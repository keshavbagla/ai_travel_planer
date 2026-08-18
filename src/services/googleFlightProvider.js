import axios from "axios";
import {
    cacheService,
} from "./cache.service.js";

import {
    createFlightSearchCacheKey,
} from "../utils/flightCache.util.js";

import { ApiError } from "../utils/ApiError.js";

const normalizeProviderMessage = (value) => {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                if (
                    item &&
                    typeof item.message === "string"
                ) {
                    return item.message;
                }

                try {
                    return JSON.stringify(item);
                } catch {
                    return String(item);
                }
            })
            .join(", ");
    }

    if (value && typeof value === "object") {
        if (typeof value.message === "string") {
            return value.message;
        }

        try {
            return JSON.stringify(value);
        } catch {
            return "Google Flights provider returned an error.";
        }
    }

    return "Google Flights provider returned an error.";
};

const RAPIDAPI_HOST =
    process.env.RAPIDAPI_HOST ||
    "google-flights2.p.rapidapi.com";

const RAPIDAPI_BASE_URL =
    `https://${RAPIDAPI_HOST}`;

const googleFlightsClient =
    axios.create({
        baseURL: RAPIDAPI_BASE_URL,
        timeout: 60000,
});

const getHeaders = () => {
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
        throw new ApiError(
            500,
            "RapidAPI key is not configured."
        );
    }

    return {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    };
};

const extractProviderError = (error) => {
    const responseData = error?.response?.data;

    if (typeof responseData === "string") {
        return responseData;
    }

    if (
        responseData &&
        typeof responseData.message === "string"
    ) {
        return responseData.message;
    }

    if (
        responseData?.error &&
        typeof responseData.error.message === "string"
    ) {
        return responseData.error.message;
    }

    if (error?.message) {
        return error.message;
    }

    return "Google Flights API request failed.";
};

/**
 * Search Flights
 */
const searchFlights = async ({
    departureIata,
    arrivalIata,
    outboundDate,
    adults = 1,
    travelClass = "ECONOMY",
    currency = "INR",
}) => {
    const cacheKey =
        createFlightSearchCacheKey({
            departureIata,
            arrivalIata,
            outboundDate,
            adults,
            travelClass,
            currency,
        });

    /*
     * Flight search results are deliberately cached
     * only for a short period because fares can change.
     */
    const CACHE_TTL_SECONDS = 300;

    // 1. Redis cache
    const cached =
        await cacheService.get(
            cacheKey
        );

    if (cached) {
        console.log(
            `Flight search cache HIT: ${cacheKey}`
        );

        return {
            ...cached,
            source: "cache",
        };
    }

    console.log(
        `Flight search cache MISS: ${cacheKey}`
    );

    try {
        const response =
            await googleFlightsClient.get(
                "/api/v1/searchFlights",
                {
                    params: {
                        departure_id:
                            departureIata.toUpperCase(),

                        arrival_id:
                            arrivalIata.toUpperCase(),

                        outbound_date:
                            outboundDate,

                        adults:
                            Number(adults),

                        travel_class:
                            travelClass.toUpperCase(),

                        currency:
                            currency.toUpperCase(),

                        show_hidden: 1,

                        language_code: "en-US",

                        country_code: "US",

                        search_type: "best",
                    },

                    headers: getHeaders(),
                }
            );

        const data =
            response.data;

        if (!data?.status) {
            throw new ApiError(
                502,
                normalizeProviderMessage(
                    data?.message
                )
            );
        }

        const result = {
            provider: "GoogleFlights",

            timestamp:
                data.timestamp || null,

            itineraries:
                data?.data?.itineraries || {
                    topFlights: [],
                    otherFlights: [],
                },
        };

        await cacheService.set(
            cacheKey,
            result,
            CACHE_TTL_SECONDS
        );
        
        return {
            ...result,
            source: "provider",
        };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (
            error?.code ===
            "ECONNABORTED"
        ) {
            throw new ApiError(
                504,
                "Google Flights search timed out. Please try again."
            );
        }

        console.error(
            "Google Flights Search Error:",
            {
                message:
                    error?.message,
                status:
                    error?.response?.status,
                data:
                    error?.response?.data,
                code:
                    error?.code,
            }
        );

        if (
            error?.response?.status ===
            429
        ) {
            throw new ApiError(
                429,
                "RapidAPI request limit exceeded."
            );
        }

        throw new ApiError(
            error?.response?.status ||
                502,
            normalizeProviderMessage(
                error?.response?.data?.message
            )
        );
    }
};

/**
 * Get Booking Details
 */
const getBookingDetails = async (bookingToken) => {
    if (!bookingToken) {
        throw new ApiError(
            400,
            "Booking token is required."
        );
    }

    try {
        const response =
            await googleFlightsClient.get(
                "/api/v1/getBookingDetails",
                {
                    params: {
                        booking_token:
                            bookingToken,
                    },

                    headers: getHeaders(),
                }
            );

        const data = response.data;

        if (!data?.status) {
            throw new ApiError(
                502,
                data?.message ||
                    "Google Flights booking details failed."
            );
        }

        return {
            provider: "GoogleFlights",

            timestamp:
                data.timestamp || null,

            bagInfo:
                data.bag_info || null,

            bookings:
                Array.isArray(data.data)
                    ? data.data
                    : [],
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        console.error(
            "Google Flights booking details error:",
            {
                status:
                    error?.response?.status,
                data:
                    error?.response?.data,
                message:
                    error?.message,
                code:
                    error?.code,
            }
        );

        throw new ApiError(
            error?.response?.status || 502,
            error?.response?.data?.message ||
                "Unable to fetch Google Flights booking details."
        );
    }
};

/**
 * Get Booking URL
 */
const getBookingUrl = async (bookingToken) => {
    if (!bookingToken) {
        throw new ApiError(
            400,
            "Booking token is required."
        );
    }

    try {
        const response =
            await googleFlightsClient.get(
                "/api/v1/getBookingURL",
                {
                    params: {
                        token: bookingToken,
                    },

                    headers: getHeaders(),
                }
            );

        const data = response.data;

        if (!data?.status) {
            throw new ApiError(
                502,
                normalizeProviderMessage(
                    data?.message
                )
            );
        }

        if (
            typeof data.data !== "string" ||
            !data.data.trim()
        ) {
            throw new ApiError(
                502,
                "Google Flights returned an invalid booking URL."
            );
        }

        return {
            provider: "GoogleFlights",
            timestamp:
                data.timestamp || null,
            bookingUrl: data.data,
        };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        console.error(
            "Google Flights booking URL error:",
            {
                status:
                    error?.response?.status,
                data:
                    error?.response?.data,
                message:
                    error?.message,
                code:
                    error?.code,
            }
        );

        throw new ApiError(
            error?.response?.status || 502,
            normalizeProviderMessage(
                error?.response?.data?.message
            )
        );
    }
};

export const googleFlightsProvider = {
    searchFlights,
    getBookingDetails,
    getBookingUrl,
};