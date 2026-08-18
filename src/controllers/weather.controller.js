import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
    getWeatherForecast,
} from "../services/weather.service.js";

const getWeather = asyncHandler(
    async (req, res) => {
        const {
            location,
            days,
        } = req.query;

        if (!location) {
            throw new ApiError(
                400,
                "Location is required."
            );
        }

        const daysNumber =
            days !== undefined
                ? Number(days)
                : 7;

        if (
            Number.isNaN(daysNumber) ||
            !Number.isInteger(daysNumber)
        ) {
            throw new ApiError(
                400,
                "Days must be a valid integer."
            );
        }

        if (
            daysNumber < 1 ||
            daysNumber > 14
        ) {
            throw new ApiError(
                400,
                "Days must be between 1 and 14."
            );
        }

        const weather =
            await getWeatherForecast({
                location,
                days: daysNumber,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                weather,
                "Weather fetched successfully."
            )
        );
    }
);

export {
    getWeather,
};