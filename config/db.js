const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 👇 FIX: Variable ki jagah seedha apna Link yahan daal dein
        const dbURI = "mongodb+srv://Anushri_db_user:Anushri%40123@ecommercecluster.knufrx7.mongodb.net/ecommerce?retryWrites=true&w=majority";

        console.log("📡 Connecting directly to Atlas...");
        
        const conn = await mongoose.connect(dbURI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`❌ Database Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
