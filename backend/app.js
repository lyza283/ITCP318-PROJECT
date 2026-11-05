const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');

// Frontend URL galing sa env (puwede maraming URL na may comma), localhost lang kapag dev
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Pang-gising sa free server bago mag-demo, walang DB call
app.get('/api/v1/health', (req, res) => res.status(200).json({ success: true }));

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.statusCode === 400) {
        return res.status(400).json({ success: false, message: error.message });
    }

    if (error instanceof multer.MulterError || error.message?.startsWith('Only JPG, PNG')) {
        return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Unhandled API error:', error.message);
    return res.status(500).json({ success: false, message: 'The request could not be completed.' });
});

module.exports = app;