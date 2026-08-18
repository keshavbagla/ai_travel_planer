import { Destination } from "../models/destination.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
    validateSelectFlightOffer,
    validateFlightOfferId,
} from "../validators/flight.validator.js";

import {
    flightOfferService,
} from "../services/flight.service.js";

/**
 * Search and save flight offers
 */
const searchAndSaveFlightOffers =
    asyncHandler(async (req, res) => {
        const {
            trip,
            departureIata,
            arrivalIata,
            outboundDate,
            adults = 1,
            travelClass = "ECONOMY",
            currency = "INR",
        } = req.body;

        if (!departureIata) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Departure IATA code is required."
                )
            );
        }

        if (!arrivalIata) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Arrival IATA code is required."
                )
            );
        }

        if (!outboundDate) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Outbound date is required."
                )
            );
        }

        const result =
            await flightOfferService
                .searchAndSaveFlightOffers({
                    user: req.user._id,
                    trip,
                    departureIata,
                    arrivalIata,
                    outboundDate,
                    adults,
                    travelClass,
                    currency,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Flight offers fetched successfully."
            )
        );
    });

const searchFlightsByDestination =
    asyncHandler(async (req, res) => {
        const {
            destinationId,
            departureIata,
            outboundDate,
            adults = 1,
            travelClass = "ECONOMY",
            currency = "INR",
            trip,
        } = req.body;

        if (!destinationId) {
            throw new ApiError(
                400,
                "Destination ID is required."
            );
        }

        if (!departureIata) {
            throw new ApiError(
                400,
                "Departure IATA code is required."
            );
        }

        if (!outboundDate) {
            throw new ApiError(
                400,
                "Outbound date is required."
            );
        }

        const destination =
            await Destination.findOne({
                _id: destinationId,
                isActive: true,
            }).select(
                "name primaryAirportIata"
            );

        if (!destination) {
            throw new ApiError(
                404,
                "Destination not found."
            );
        }

        if (!destination.primaryAirportIata) {
            throw new ApiError(
                400,
                "Primary airport is not configured for this destination."
            );
        }

        const result =
            await flightOfferService
                .searchAndSaveFlightOffers({
                    user: req.user._id,
                    trip,
                    departureIata,
                    arrivalIata:
                        destination.primaryAirportIata,
                    outboundDate,
                    adults,
                    travelClass,
                    currency,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    destination: {
                        id: destination._id,
                        name: destination.name,
                        airport:
                            destination.primaryAirportIata,
                    },
                    ...result,
                },
                "Flights fetched successfully."
            )
        );
    });

/**
 * Get one flight offer
 */
const getFlightOfferById =
    asyncHandler(async (req, res) => {
        const { flightOfferId } =
            req.params;

        validateFlightOfferId(
            flightOfferId
        );

        const offer =
            await flightOfferService
                .getFlightOfferById({
                    flightOfferId,
                    user: req.user._id,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                offer,
                "Flight offer fetched successfully."
            )
        );
    });


/**
 * Select flight offer
 */
const selectFlightOffer =
    asyncHandler(async (req, res) => {
        validateSelectFlightOffer(
            req.body
        );

        const {
            flightOfferId,
            trip,
        } = req.body;

        const offer =
            await flightOfferService
                .selectFlightOffer({
                    flightOfferId,
                    user: req.user._id,
                    trip,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                offer,
                "Flight offer selected successfully."
            )
        );
    });


/**
 * Get booking details
 */
const getSelectedFlightBookingDetails =
    asyncHandler(async (req, res) => {
        const { flightOfferId } =
            req.params;

        validateFlightOfferId(
            flightOfferId
        );

        const result =
            await flightOfferService
                .getSelectedFlightBookingDetails({
                    flightOfferId,
                    user: req.user._id,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Flight booking details fetched successfully."
            )
        );
    });


/**
 * Get external booking URL
 */
const getSelectedFlightBookingUrl =
    asyncHandler(async (req, res) => {
        const { flightOfferId } =
            req.params;

        validateFlightOfferId(
            flightOfferId
        );

        const result =
            await flightOfferService
                .getSelectedFlightBookingUrl({
                    flightOfferId,
                    user: req.user._id,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Flight booking URL generated successfully."
            )
        );
    });

export {
    searchAndSaveFlightOffers,
    getFlightOfferById,
    selectFlightOffer,
    getSelectedFlightBookingDetails,
    getSelectedFlightBookingUrl,
    searchFlightsByDestination,
};