import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        console.log("Connecting to MongoDB...");

        const conn = await mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000,
            }
        );

        cachedConnection = conn;

        console.log("✅ MongoDB Connected");
        console.log(conn.connection.host);

        return conn;

    } catch (error) {
        console.error("❌ MongoDB Error:");
        console.error(error);

        cachedConnection = null;

        throw error;
    }
};

export default connectDB;