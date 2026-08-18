import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const aviationstackClient = axios.create({
    baseURL:
        "https://api.aviationstack.com",
    timeout: 15000,
});

const searchFlights = async ({
    departureIata,
    arrivalIata,
    flightDate,
    flightNumber,
    flightStatus,
    limit = 100,
    offset = 0,
}) => {
    const apiKey =
        process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
        throw new ApiError(
            500,
            "Aviationstack API key is not configured."
        );
    }

    const params = {
        access_key: apiKey,
        limit,
        offset,
    };

    if (departureIata) {
        params.dep_iata =
            departureIata.toUpperCase();
    }

    if (arrivalIata) {
        params.arr_iata =
            arrivalIata.toUpperCase();
    }

    if (flightDate) {
        params.flight_date =
            flightDate;
    }

    if (flightNumber) {
        params.flight_number =
            flightNumber;
    }

    if (flightStatus) {
        params.flight_status =
            flightStatus.toLowerCase();
    }

    try {
        const response =
            await aviationstackClient.get(
                "/v1/flights",
                {
                    params,
                }
            );

        const data = response.data;

        if (data?.error) {
            throw new ApiError(
                502,
                data.error.message ||
                    "Aviationstack API returned an error."
            );
        }

        return {
            pagination:
                data.pagination || {
                    limit,
                    offset,
                    count: 0,
                    total: 0,
                },

            flights:
                Array.isArray(data.data)
                    ? data.data.map(
                          normalizeFlight
                      )
                    : [],
        };

    } catch (error) {
        console.error(
            "Aviationstack error:",
            error.response?.data || error.message
        );

        if (error instanceof ApiError) {
            throw error;
        }

        if (error.response) {
            throw new ApiError(
                502,
                error.response.data?.error?.message ||
                    "Unable to fetch flight data from Aviationstack."
            );
        }

        if (error.request) {
            throw new ApiError(
                504,
                "Aviationstack API request timed out or is unavailable."
            );
        }

        throw new ApiError(
            500,
            "Failed to search flights."
        );
    }
};

const normalizeFlight = (flight) => {
    return {
        provider: "Aviationstack",

        providerFlightId:
            flight?.flight?.iata ||
            flight?.flight?.icao ||
            null,

        flightNumber:
            flight?.flight?.number ||
            null,

        flightIata:
            flight?.flight?.iata ||
            null,

        flightIcao:
            flight?.flight?.icao ||
            null,

        airline: {
            name:
                flight?.airline?.name ||
                null,

            iata:
                flight?.airline?.iata ||
                null,

            icao:
                flight?.airline?.icao ||
                null,
        },

        departure: {
            airport:
                flight?.departure?.airport ||
                null,

            iata:
                flight?.departure?.iata ||
                null,

            icao:
                flight?.departure?.icao ||
                null,

            terminal:
                flight?.departure?.terminal ||
                null,

            gate:
                flight?.departure?.gate ||
                null,

            scheduled:
                flight?.departure?.scheduled ||
                null,

            estimated:
                flight?.departure?.estimated ||
                null,

            actual:
                flight?.departure?.actual ||
                null,
        },

        arrival: {
            airport:
                flight?.arrival?.airport ||
                null,

            iata:
                flight?.arrival?.iata ||
                null,

            icao:
                flight?.arrival?.icao ||
                null,

            terminal:
                flight?.arrival?.terminal ||
                null,

            gate:
                flight?.arrival?.gate ||
                null,

            scheduled:
                flight?.arrival?.scheduled ||
                null,

            estimated:
                flight?.arrival?.estimated ||
                null,

            actual:
                flight?.arrival?.actual ||
                null,
        },

        flightStatus:
            flight?.flight_status ||
            "unknown",

        aircraft: {
            registration:
                flight?.aircraft
                    ?.registration ||
                null,

            iata:
                flight?.aircraft?.iata ||
                null,

            icao:
                flight?.aircraft?.icao ||
                null,
        },

        flightDate:
            flight?.flight_date ||
            null,

        departureDelay:
            flight?.departure?.delay ??
            0,

        arrivalDelay:
            flight?.arrival?.delay ??
            0,

        live: flight?.live
            ? {
                  latitude:
                      flight.live.latitude ??
                      null,

                  longitude:
                      flight.live.longitude ??
                      null,

                  altitude:
                      flight.live.altitude ??
                      null,

                  direction:
                      flight.live.direction ??
                      null,

                  speedHorizontal:
                      flight.live
                          .speed_horizontal ??
                      null,

                  speedVertical:
                      flight.live
                          .speed_vertical ??
                      null,

                  isGround:
                      flight.live.is_ground ??
                      null,
              }
            : null,

        isActive: true,

        lastSyncedAt: new Date(),
    };
};


export const flightProviderService = {
    searchFlights,
};