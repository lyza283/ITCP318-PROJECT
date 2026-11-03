const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'config', '.env'), override: true })

// Huminto agad kapag may kulang na env variable (dapat nakaload na ang .env bago i-require ang app)
const isProduction = String(process.env.NODE_ENV).toLowerCase() === 'production';
const requiredEnv = [
    'PORT',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
]
if (isProduction) requiredEnv.push('FRONTEND_ORIGIN')
if (!process.env.MONGODB_URI && !process.env.DB_URI) requiredEnv.push('MONGODB_URI')

const missingEnv = requiredEnv.filter(key => !process.env[key])
if (missingEnv.length > 0) {
    missingEnv.forEach(key => console.error(`ERROR: Missing required environment variable ${key} (set it in backend/config/.env or in your hosting dashboard)`))
    process.exit(1);
}

const app = require('./app');
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(process.env.PORT, () => {
            console.log(`server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
        });
    } catch (error) {
        console.error('Failed to start server because MongoDB connection failed:', error);
        process.exit(1);
    }
};

startServer();
