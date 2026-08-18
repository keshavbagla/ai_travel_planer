import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
    getPlaces,
    getPlace,
} from "../services/image.service.js";

const searchPlaces = asyncHandler(
    async (req, res) => {
        const {
            type,
            lat,
            lon,
            radius = 5000,
            limit = 10,
        } = req.body;

        if (!type) {
            throw new ApiError(
                400,
                "Place type is required."
            );
        }

        if (
            lat === undefined ||
            lon === undefined
        ) {
            throw new ApiError(
                400,
                "Latitude and longitude are required."
            );
        }

        const places =
            await getPlaces({
                type,
                lat: Number(lat),
                lon: Number(lon),
                radius: Number(radius),
                limit: Number(limit),
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                places,
                "Places fetched successfully."
            )
        );
    }
);

const getPlaceDetails =
    asyncHandler(
        async (req, res) => {
            const { placeId } =
                req.params;

            if (!placeId) {
                throw new ApiError(
                    400,
                    "Place ID is required."
                );
            }

            const place =
                await getPlace(
                    placeId
                );

            if (!place) {
                throw new ApiError(
                    404,
                    "Place details not found."
                );
            }

            return res.status(200).json(
                new ApiResponse(
                    200,
                    place,
                    "Place details fetched successfully."
                )
            );
        }
    );

export {
    searchPlaces,
    getPlaceDetails,
};