import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000
        });
        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`✗ MongoDB Connection Error: ${error.message}`);
        console.warn("⚠️  Make sure to update MONGO_URI in backend/.env with your MongoDB Atlas connection string.");
    }
};

export default connectDB;
