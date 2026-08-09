import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import destinationRouter from "./routes/destination.route.js";
import hotelRouter from "./routes/hotel.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "20kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "20kb",
    })
);

app.use(express.static("public"));

app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/destinations", destinationRouter);

app.use("/api/v1/hotels", hotelRouter);

app.use("/api/v1/restaurants", restaurantRouter);

app.use(errorHandler);


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Travel Planner Backend Running 🚀",
    });
});

export { app };