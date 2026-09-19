const mongoose = require('mongoose');

const connectDB = async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const primaryURI = process.env.MONGO_URI || (isProduction ? null : "mongodb://127.0.0.1:27017/ecommerce");
    const localFallbackURI = "mongodb://127.0.0.1:27017/ecommerce";

    if (isProduction && !primaryURI) {
        console.error("❌ FATAL: MONGO_URI is required in production mode. Refusing fallback to local database.");
        process.exit(1);
    }

    try {
        console.log("📡 Connecting to MongoDB...");
        const conn = await mongoose.connect(primaryURI, {
            serverSelectionTimeoutMS: 4000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (primaryError) {
        console.warn(`⚠️ Primary MongoDB Connection Failed: ${primaryError.message}`);

        if (isProduction) {
            console.error("❌ FATAL: MongoDB is required in production mode. Primary connection failed; refusing fallback to local database.");
            process.exit(1);
        }

        if (primaryURI !== localFallbackURI) {
            try {
                console.log("🔄 Attempting fallback connection to local MongoDB...");
                const conn = await mongoose.connect(localFallbackURI, {
                    serverSelectionTimeoutMS: 2000,
                });
                console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
                return;
            } catch (fallbackError) {
                console.warn(`⚠️ Local fallback connection also unavailable: ${fallbackError.message}`);
            }
        }

        console.warn("⚠️ [Development/Demo Mode] MongoDB is not connected. Application running in offline/demo fallback mode.");
    }
};

module.exports = connectDB;
