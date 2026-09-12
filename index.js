import "dotenv/config";

import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "❌ MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    });