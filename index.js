import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 8001;

import { emailService } from "./src/services/email.service.js";

connectDB()
    .then(async () => {

        await emailService.verifyTransporter();

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

    });