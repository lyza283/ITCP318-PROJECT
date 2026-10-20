const PDFDocument = require('pdfkit');

function createOrderReceipt(order) {
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({ size: 'A4', margin: 48 });
        const chunks = [];

        document.on('data', chunk => chunks.push(chunk));
        document.on('end', () => resolve(Buffer.concat(chunks)));
        document.on('error', reject);

        document.fontSize(20).text('GuhitSpace Order Receipt', { align: 'center' });
        document.moveDown();
        document.fontSize(11).text(`Order: #${order._id}`);
        document.text(`Order status: ${order.orderStatus}`);
        document.text(`Date: ${new Date(order.createdAt).toLocaleString('en-PH')}`);
        document.text(`Customer: ${order.user?.name || 'Customer'}`);
        document.moveDown();
        document.fontSize(13).text('Items', { underline: true });
        document.moveDown(0.5);

        for (const item of order.orderItems) {
            document.fontSize(10).text(
                `${item.name}  |  ${item.quantity} x PHP ${Number(item.price).toFixed(2)}  |  PHP ${(item.quantity * item.price).toFixed(2)}`
            );
        }

        document.moveDown();
        document.fontSize(11).text(`Items subtotal: PHP ${Number(order.itemsPrice).toFixed(2)}`);
        document.text(`Shipping: PHP ${Number(order.shippingPrice).toFixed(2)}`);
        document.text(`Tax: PHP ${Number(order.taxPrice).toFixed(2)}`);
        document.fontSize(13).text(`Grand total: PHP ${Number(order.totalPrice).toFixed(2)}`);
        document.moveDown();
        document.fontSize(9).text(`Payment method: ${order.paymentInfo?.method || 'Cash on Delivery'}`);
        document.end();
    });
}

module.exports = createOrderReceipt;
