const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const createReceiptPdf = require('../utils/orderReceipt');
const { parseDateRange, completedSalesPipeline } = require('../utils/salesAnalytics');

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Completed', 'Delivered', 'Cancelled'];
const STATUS_TRANSITIONS = {
    Pending: ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Completed'],
    Completed: [],
    Delivered: [],
    Cancelled: []
};

const roundCurrency = value => Math.round((value + Number.EPSILON) * 100) / 100;

function getDateRange(req, res) {
    try {
        return parseDateRange(req.query);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
        return null;
    }
}

exports.newOrder = async (req, res) => {
    const { orderItems, shippingInfo } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0 || orderItems.length > 50) {
        return res.status(400).json({ success: false, message: 'Your cart must contain between 1 and 50 items.' });
    }

    const requiredShippingFields = ['address', 'city', 'phoneNo', 'postalCode', 'country'];
    if (!shippingInfo || requiredShippingFields.some(field =>
        typeof shippingInfo[field] !== 'string' || !shippingInfo[field].trim()
    )) {
        return res.status(400).json({ success: false, message: 'Complete all shipping information before placing your order.' });
    }

    const requestedQuantities = new Map();
    for (const item of orderItems) {
        if (!mongoose.isValidObjectId(item?.product)
            || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
            return res.status(400).json({ success: false, message: 'The cart contains an invalid product or quantity.' });
        }
        requestedQuantities.set(
            String(item.product),
            (requestedQuantities.get(String(item.product)) || 0) + Number(item.quantity)
        );
    }

    const productIds = [...requestedQuantities.keys()];
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
        return res.status(400).json({ success: false, message: 'One or more products in your cart are no longer available.' });
    }

    const orderItemsToSave = [];
    for (const product of products) {
        const quantity = requestedQuantities.get(String(product._id));
        if (product.stock < quantity) {
            return res.status(409).json({
                success: false,
                message: `${product.name} does not have enough stock for the requested quantity.`
            });
        }
        orderItemsToSave.push({
            product: product._id,
            name: product.name,
            quantity,
            image: product.images[0]?.url || '',
            price: product.price
        });
    }

    const itemsPrice = roundCurrency(orderItemsToSave.reduce(
        (total, item) => total + item.price * item.quantity, 0
    ));
    const shippingPrice = itemsPrice > 200 ? 0 : 25;
    const taxPrice = roundCurrency(itemsPrice * 0.05);
    const totalPrice = roundCurrency(itemsPrice + shippingPrice + taxPrice);

    const order = await Order.create({
        orderItems: orderItemsToSave,
        shippingInfo: Object.fromEntries(requiredShippingFields.map(field => [
            field,
            shippingInfo[field].trim()
        ])),
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        paymentInfo: { method: 'Cash on Delivery', status: 'pending' },
        orderStatus: 'Pending',
        user: req.user._id
    });

    return res.status(201).json({ success: true, order });
};

exports.myOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
};

exports.getSingleOrder = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return res.status(404).json({ success: false, message: 'No order found with this ID.' });
    }
    if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You are not allowed to view this order.' });
    }
    return res.status(200).json({ success: true, order });
};

exports.downloadReceipt = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You are not allowed to download this receipt.' });
    }

    const receipt = await createReceiptPdf(order);
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${order._id}.pdf"`
    });
    return res.send(receipt);
};

exports.allOrders = async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    const totalAmount = roundCurrency(orders.reduce((sum, order) => sum + order.totalPrice, 0));
    return res.status(200).json({ success: true, totalAmount, orders });
};

exports.deleteOrder = async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'No order found with this ID.' });
    }
    return res.status(200).json({ success: true });
};

exports.updateOrder = async (req, res) => {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Status must be one of: ${ORDER_STATUSES.join(', ')}.`
        });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const unchanged = status === order.orderStatus;
    if (!unchanged && !STATUS_TRANSITIONS[order.orderStatus]?.includes(status)) {
        return res.status(409).json({
            success: false,
            message: `An order cannot move from ${order.orderStatus} to ${status}.`
        });
    }

    const adjustedProducts = [];
    if (!unchanged && status === 'Completed') {
        for (const item of order.orderItems) {
            const product = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
            if (!product) {
                await Promise.all(adjustedProducts.map(adjusted =>
                    Product.updateOne({ _id: adjusted.id }, { $inc: { stock: adjusted.quantity } })
                ));
                return res.status(409).json({
                    success: false,
                    message: 'There is not enough stock to complete this order. Inventory was not changed.'
                });
            }
            adjustedProducts.push({ id: item.product, quantity: item.quantity });
        }
        order.completedAt = new Date();
        order.deliveredAt = order.completedAt;
    }

    if (!unchanged) {
        order.orderStatus = status;
        try {
            await order.save();
        } catch (error) {
            await Promise.all(adjustedProducts.map(adjusted =>
                Product.updateOne({ _id: adjusted.id }, { $inc: { stock: adjusted.quantity } })
            ));
            throw error;
        }
    }

    try {
        const receipt = await createReceiptPdf(order);
        const itemRows = order.orderItems.map(item =>
            `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${formatCurrency(item.price * item.quantity)}</td></tr>`
        ).join('');
        const greeting = escapeHtml(order.user?.name || 'Customer');
        const html = `
            <p>Hello ${greeting},</p>
            <p>Your order <strong>#${escapeHtml(String(order._id))}</strong> status is now <strong>${escapeHtml(status)}</strong>.</p>
            <table border="1" cellpadding="8" cellspacing="0">
                <thead><tr><th>Product</th><th>Quantity</th><th>Subtotal</th></tr></thead>
                <tbody>${itemRows}</tbody>
            </table>
            <p>Items subtotal: ${formatCurrency(order.itemsPrice)}<br>
            Shipping: ${formatCurrency(order.shippingPrice)}<br>
            Tax: ${formatCurrency(order.taxPrice)}<br>
            <strong>Grand total: ${formatCurrency(order.totalPrice)}</strong></p>
            <p>Your PDF receipt is attached to this email.</p>
        `;
        await sendEmail({
            email: order.user.email,
            subject: `Order #${order._id} status: ${status}`,
            html,
            attachments: [{ filename: `receipt-${order._id}.pdf`, content: receipt, contentType: 'application/pdf' }]
        });
    } catch (error) {
        console.error('Order status notification failed:', error.message);
        return res.status(502).json({
            success: false,
            orderUpdated: true,
            message: 'Order status was updated, but the email notification could not be sent. Check SMTP configuration and retry notification.'
        });
    }

    return res.status(200).json({ success: true, order, unchanged });
};

exports.totalOrders = async (req, res) => {
    const count = await Order.countDocuments();
    return res.status(200).json({ success: true, totalOrders: count });
};

exports.totalSales = async (req, res) => {
    const dateRange = getDateRange(req, res);
    if (!dateRange) return;
    const [result] = await Order.aggregate([
        ...completedSalesPipeline(dateRange),
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
    return res.status(200).json({
        success: true,
        totalSales: result?.totalSales || 0
    });
};

exports.customerSales = async (req, res) => {
    const dateRange = getDateRange(req, res);
    if (!dateRange) return;
    const customerSales = await Order.aggregate([
        ...completedSalesPipeline(dateRange),
        {
            $group: {
                _id: '$user',
                total: { $sum: '$totalPrice' }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        { $project: { _id: 0, 'userDetails.name': 1, total: 1 } },
        { $sort: { total: -1 } }
    ]);
    return res.status(200).json({ success: true, customerSales });
};

exports.salesPerMonth = async (req, res) => {
    const dateRange = getDateRange(req, res);
    if (!dateRange) return;
    const salesPerMonth = await Order.aggregate([
        ...completedSalesPipeline(dateRange),
        {
            $group: {
                _id: {
                    year: { $year: '$salesDate' },
                    month: { $month: '$salesDate' }
                },
                total: { $sum: '$totalPrice' }
            }
        },
        {
            $project: {
                _id: 0,
                month: {
                    $dateToString: {
                        format: '%Y-%m',
                        date: {
                            $dateFromParts: {
                                year: '$_id.year',
                                month: '$_id.month',
                                day: 1
                            }
                        }
                    }
                },
                total: 1
            }
        },
        { $sort: { month: 1 } }
    ]);
    return res.status(200).json({ success: true, salesPerMonth });
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function formatCurrency(value) {
    return `PHP ${Number(value).toFixed(2)}`;
}
