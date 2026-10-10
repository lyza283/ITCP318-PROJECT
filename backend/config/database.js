const mongoose = require('mongoose');

const connectDatabase = async () => {
    const uri = process.env.MONGODB_URI || process.env.DB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not configured');
    }

    const connection = await mongoose.connect(uri);
    console.log(`MongoDB Database connected with HOST: ${connection.connection.host}`);
};

module.exports = connectDatabase;