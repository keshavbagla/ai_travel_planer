import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import destinationRouter from "./routes/destination.route.js";
import hotelRouter from "./routes/hotel.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import activityRouter from "./routes/activity.route.js";
import tripRouter from "./routes/trip.route.js";
import bookingRouter from "./routes/booking.route.js";
import paymentRouter from "./routes/payment.route.js";
import notificationRouter from "./routes/notification.route.js";
import reviewRouter from "./routes/review.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import cancellationRouter from "./routes/cancellation.route.js";
import travelerRouter from "./routes/traveler.route.js";
import flightOfferRoutes from "./routes/flightOffer.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";


const app = express();

app.use((req, res, next) => {
    console.log(
        "🔥 EXPRESS RECEIVED:",
        req.method,
        req.originalUrl
    );

    next();
});

app.use(
    cors({
        origin:
            process.env.CLIENT_URL || "*",

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


app.use(
    express.static("public")
);


app.use(cookieParser());

app.use(morgan("dev"));

pp.use("/api/v1/auth", authRouter);

app.use("/api/v1/destinations", destinationRouter);

app.use("/api/v1/hotels", hotelRouter);

app.use("/api/v1/restaurants", restaurantRouter);

app.use("/api/v1/activities", activityRouter);

app.use("/api/v1/trips", tripRouter);

app.use("/api/v1/bookings", bookingRouter);

app.use("/api/v1/payments", paymentRouter);

app.use("/api/v1/notifications", notificationRouter);

app.use("/api/v1/reviews", reviewRouter);

app.use("/api/v1/wishlist", wishlistRouter);

app.use("/api/v1/cancellations", cancellationRouter);

app.use("/api/v1/travelers", travelerRouter);

app.use("/api/v1/flight-offers", flightOfferRoutes);

app.use(errorHandler);



app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "AI Travel Planner Backend Running 🚀",
    });
});


export { app };