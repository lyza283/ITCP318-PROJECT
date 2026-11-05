const Product = require('../models/product')
const Order = require('../models/order')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');
const { getPagination, paginationMetadata } = require('../utils/pagination');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const { Filter } = require('bad-words');
const { parseDateRange, completedSalesPipeline } = require('../utils/salesAnalytics');

const profanityFilter = new Filter();

async function removeTemporaryImages(files = []) {
    await Promise.all(files.map(async file => {
        try {
            await fs.unlink(file.path);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Failed to remove temporary product image:', error.message);
            }
        }
    }));
}

exports.newProduct = async (req, res, next) => {
    if (!req.files?.length) {
        return res.status(400).json({
            success: false,
            message: 'Please select at least one product image.'
        });
    }

    const imagesLinks = [];
    try {
        for (const image of req.files) {
            const result = await cloudinary.v2.uploader.upload(image.path, {
                folder: 'products',
                width: 150,
                crop: 'scale',
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }
    } catch (error) {
        await Promise.all(imagesLinks.map(image =>
            cloudinary.v2.uploader.destroy(image.public_id)
        ).map(promise => promise.catch(cleanupError => {
            console.error('Failed to roll back product image upload:', cleanupError.message);
        })));
        console.error('Product image upload failed:', error.message);
        return res.status(502).json({
            success: false,
            message: 'Product image upload failed. Check Cloudinary configuration and try again.'
        });
    } finally {
        await removeTemporaryImages(req.files);
    }

    try {
        const product = await Product.create({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            stock: req.body.stock,
            seller: req.body.seller,
            images: imagesLinks,
            user: req.user._id
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        await Promise.all(imagesLinks.map(image =>
            cloudinary.v2.uploader.destroy(image.public_id)
        ).map(promise => promise.catch(cleanupError => {
            console.error('Failed to clean up product image after create failure:', cleanupError.message);
        })));
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Product creation failed:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Product could not be created. Please try again.'
        });
    }
}

exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    return res.status(200).json({
        success: true,
        product
    })
}

exports.getProducts = async (req, res) => {
    try {
        const resPerPage = 5;
        const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
        apiFeatures.pagination(resPerPage);

        const [products, filteredProductsCount, productsCount] = await Promise.all([
            apiFeatures.query,
            Product.countDocuments(apiFeatures.filters),
            Product.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            products,
            filteredProductsCount,
            totalCount: filteredProductsCount,
            hasMore: (Number(req.query.page) || 1) * resPerPage < filteredProductsCount,
            resPerPage,
            productsCount,
        });
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ success: false, message: error.message });
        }
        throw error;
    }
    // if (!products)
    //     return res.status(400).json({ message: 'error loading products' })

    // return res.status(200).json({
    //     success: true,
    //     products,
    //     resPerPage,
    //     productsCount,

    // })
}

exports.updateProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        await removeTemporaryImages(req.files);
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    let retainedImageIds = product.images.map(image => image.public_id);
    if (req.body.retainedImages !== undefined) {
        try {
            retainedImageIds = JSON.parse(req.body.retainedImages);
        } catch {
            await removeTemporaryImages(req.files);
            return res.status(400).json({ success: false, message: 'The retained image selection is invalid.' });
        }
        if (!Array.isArray(retainedImageIds)
            || retainedImageIds.some(imageId => typeof imageId !== 'string')
            || retainedImageIds.some(imageId => !product.images.some(image => image.public_id === imageId))) {
            await removeTemporaryImages(req.files);
            return res.status(400).json({ success: false, message: 'The retained image selection is invalid.' });
        }
    }
    const retainedImages = product.images.filter(image => retainedImageIds.includes(image.public_id));
    let uploadedImages = [];

    if (req.files?.length) {
        try {
            for (const image of req.files) {
                const result = await cloudinary.v2.uploader.upload(image.path, {
                    folder: 'products',
                    width: 150,
                    crop: 'scale',
                });
                uploadedImages.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }
        } catch (error) {
            await Promise.all(uploadedImages.map(image =>
                cloudinary.v2.uploader.destroy(image.public_id)
            ).map(promise => promise.catch(cleanupError => {
                console.error('Failed to roll back product image upload:', cleanupError.message);
            })));
            console.error('Product image upload failed:', error.message);
            return res.status(502).json({
                success: false,
                message: 'Product image upload failed. Check Cloudinary configuration and try again.'
            });
        } finally {
            await removeTemporaryImages(req.files);
        }
    }

    const images = [...retainedImages, ...uploadedImages];
    if (images.length === 0 || images.length > 10) {
        await Promise.all(uploadedImages.map(image =>
            cloudinary.v2.uploader.destroy(image.public_id)
        ).map(promise => promise.catch(cleanupError => {
            console.error('Failed to clean up invalid product image upload:', cleanupError.message);
        })));
        return res.status(400).json({
            success: false,
            message: images.length ? 'A product can have at most 10 images.' : 'A product must have at least one image.'
        });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            stock: req.body.stock,
            seller: req.body.seller,
            images
        }, {
            new: true,
            runValidators: true
        });
        const retainedIds = images.map(image => image.public_id);
        const removedImages = product.images.filter(image => !retainedIds.includes(image.public_id));
        const cleanupResults = await Promise.allSettled(
            removedImages.map(image => cloudinary.v2.uploader.destroy(image.public_id))
        );
        cleanupResults.forEach(result => {
            if (result.status === 'rejected') {
                console.error('Failed to delete replaced product image:', result.reason.message);
            }
        });
        return res.status(200).json({
            success: true,
            product: updatedProduct,
            imageCleanupWarning: cleanupResults.some(result => result.status === 'rejected')
        });
    } catch (error) {
        await Promise.all(uploadedImages.map(image =>
            cloudinary.v2.uploader.destroy(image.public_id)
        ).map(promise => promise.catch(cleanupError => {
            console.error('Failed to clean up product image after update failure:', cleanupError.message);
        })));
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Product update failed:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Product could not be updated. Please try again.'
        });
    }
}

exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    const cleanupResults = await Promise.allSettled(
        product.images.map(image => cloudinary.v2.uploader.destroy(image.public_id))
    );
    cleanupResults.forEach(result => {
        if (result.status === 'rejected') {
            console.error('Failed to delete product image:', result.reason.message);
        }
    });

    return res.status(200).json({
        success: true,
        message: 'Product deleted',
        imageCleanupWarning: cleanupResults.some(result => result.status === 'rejected')
    })
}

exports.deleteProducts = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100
        || ids.some(id => !mongoose.isValidObjectId(id))) {
        return res.status(400).json({
            success: false,
            message: 'Select between 1 and 100 valid products to delete.'
        });
    }

    const products = await Product.find({ _id: { $in: ids } });
    if (products.length !== ids.length) {
        return res.status(404).json({
            success: false,
            message: 'One or more selected products no longer exist. Refresh the list and try again.'
        });
    }

    await Product.deleteMany({ _id: { $in: ids } });
    const cleanupResults = await Promise.allSettled(
        products.flatMap(product => product.images.map(image =>
            cloudinary.v2.uploader.destroy(image.public_id)
        ))
    );
    const imageCleanupWarning = cleanupResults.some(result => result.status === 'rejected');
    cleanupResults.forEach(result => {
        if (result.status === 'rejected') {
            console.error('Failed to delete bulk product image:', result.reason.message);
        }
    });

    return res.status(200).json({
        success: true,
        deletedCount: products.length,
        imageCleanupWarning
    });
}

exports.getAdminProducts = async (req, res, next) => {
    const { page, limit, skip } = getPagination(req.query);
    const [products, totalCount, outOfStockCount] = await Promise.all([
        Product.find().sort({ _id: 1 }).skip(skip).limit(limit),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 })
    ]);
    return res.status(200).json({
        success: true,
        products,
        outOfStockCount,
        ...paginationMetadata(totalCount, page, limit)
    })
}

exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5
        || typeof comment !== 'string' || comment.trim().length < 2 || comment.length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a rating from 1 to 5 and a review between 2 and 1000 characters.'
        });
    }

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const verifiedPurchase = await Order.exists({
        user: req.user._id,
        orderStatus: { $in: ['Completed', 'Delivered'] },
        'orderItems.product': product._id
    });
    const isReviewed = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
    );
    if (!verifiedPurchase) {
        return res.status(403).json({
            success: false,
            message: 'Only customers with a completed order for this product can leave a review.'
        });
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: numericRating,
        comment: profanityFilter.clean(comment.trim()),
        verifiedPurchase: true
    }

    if (isReviewed) {
        Object.assign(isReviewed, review);
    } else {
        product.reviews.push(review);
    }
    product.numOfReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((total, item) => item.rating + total, 0)
        / product.reviews.length;
    await product.save({ validateBeforeSave: false });
    return res.status(200).json({
        success: true,
        review: product.reviews.find(
            item => item.user.toString() === req.user._id.toString()
        )
    })
}

const formatReview = (product, review) => ({
    _id: review._id,
    productId: product._id,
    productName: product.name,
    user: review.user,
    name: review.name,
    rating: review.rating,
    comment: review.comment,
    verifiedPurchase: Boolean(review.verifiedPurchase)
});

exports.getAllReviews = async (req, res, next) => {
    const { page, limit, skip } = getPagination(req.query);
    const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name reviews');
    const allReviews = products.flatMap(product => product.reviews.map(review => formatReview(product, review)));
    return res.status(200).json({
        success: true,
        count: allReviews.length,
        reviews: allReviews.slice(skip, skip + limit),
        ...paginationMetadata(allReviews.length, page, limit)
    });
}

exports.getProductReviews = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.query.id)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid product ID.' });
    }
    const product = await Product.findById(req.query.id).select('name reviews');
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const { page, limit, skip } = getPagination(req.query);
    return res.status(200).json({
        success: true,
        reviews: product.reviews.slice(skip, skip + limit).map(review => formatReview(product, review)),
        ...paginationMetadata(product.reviews.length, page, limit)
    });
}

exports.deleteReview = async (req, res, next) => {
    const { id, productId } = req.query;
    if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product or review ID.' });
    }
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const reviews = product.reviews.filter(review => review._id.toString() !== id.toString());
    if (reviews.length === product.reviews.length) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const ratings = reviews.length
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0

    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numOfReviews: reviews.length
    }, {
        returnDocument: 'after',
        runValidators: true
    })

    return res.status(200).json({
        success: true
    })
}

exports.productSales = async (req, res, next) => {
    let dateRange;
    try {
        dateRange = parseDateRange(req.query);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    const pipeline = completedSalesPipeline(dateRange);
    const [sales, totals] = await Promise.all([
        Order.aggregate([
            ...pipeline,
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.name',
                    total: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                }
            },
            { $sort: { total: -1 } }
        ]),
        Order.aggregate([
            ...pipeline,
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ])
    ]);

    const grandTotal = totals[0]?.total || 0;
    const totalPercentage = sales.map(item => ({
        name: item._id,
        percent: grandTotal ? Number(((item.total / grandTotal) * 100).toFixed(2)) : 0
    }));
    return res.status(200).json({ success: true, totalPercentage, sales, totalSales: grandTotal });
}