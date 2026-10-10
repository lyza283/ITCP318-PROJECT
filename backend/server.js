const app = require('./app');
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'config', '.env'), override: true })

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(process.env.PORT, () => {
            console.log(`server started on port:' ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
        });
    } catch (error) {
        console.error('Failed to start server because MongoDB connection failed:', error);
        process.exit(1);
    }
};

startServer();