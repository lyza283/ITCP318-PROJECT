const Product = require('../models/product')
const Order = require('../models/order')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs/promises');

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
        console.error('Product image upload failed:', error.message);
        return res.status(502).json({
            success: false,
            message: 'Product image upload failed. Check Cloudinary configuration and try again.'
        });
    } finally {
        await Promise.all(req.files.map(async image => {
            try {
                await fs.unlink(image.path);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Failed to remove temporary product image:', error.message);
                }
            }
        }));
    }

    try {
        const product = await Product.create({
            ...req.body,
            images: imagesLinks,
            user: req.user._id
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
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

    const resPerPage = 4;
    const productsCount = await Product.countDocuments();

    // const products = await Product.find()
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
    // .filter()

    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;
    let filteredProductsCount = products.length;
    // const products = await apiFeatures.query;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,

    })
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
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    if (req.files?.length) {
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
            console.error('Product image upload failed:', error.message);
            return res.status(502).json({
                success: false,
                message: 'Product image upload failed. Check Cloudinary configuration and try again.'
            });
        } finally {
            await Promise.all(req.files.map(async image => {
                try {
                    await fs.unlink(image.path);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Failed to remove temporary product image:', error.message);
                    }
                }
            }));
        }
        req.body.images = imagesLinks;
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        return res.status(200).json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
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

    return res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
}

exports.getAdminProducts = async (req, res, next) => {

    const products = await Product.find();
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })

}

exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    await product.save({ validateBeforeSave: false });
    if (!product)
        return res.status(400).json({
            success: false,
            message: 'review not posted'
        })
    return res.status(200).json({
        success: true
    })
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.deleteReview = async (req, res, next) => {
    console.log(req.query)
    const product = await Product.findById(req.query.productId);
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.productSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }

            },

        },
    ])
    console.log(totalSales)
    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: true } },
        { $unwind: "$orderItems" },

        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])
    console.log(sales)

    if (!totalSales) {
        return res.status(404).json({
            message: 'error sales'
        })

    }
    if (!sales) {
        return res.status(404).json({
            message: 'error sales'
        })

    }

    let totalPercentage = {}
    totalPercentage = sales.map(item => {

        // console.log( ((item.total/totalSales[0].total) * 100).toFixed(2))
        percent = Number(((item.total / totalSales[0].total) * 100).toFixed(2))
        total = {
            name: item._id.product,
            percent
        }
        return total
    })
    console.log(totalPercentage)
    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })

}