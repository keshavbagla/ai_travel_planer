import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("✅ MongoDB Connected");
        console.log(conn.connection.host);

        return conn;
    } catch (error) {
        console.error("MongoDB Error:");
        console.error(error);
        throw error;
    }
};

export default connectDB;