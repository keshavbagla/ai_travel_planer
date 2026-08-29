import { Cancellation } from "../models/cancellation.model.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";

const calculateRefund = ({
    booking,
}) => {
    const policy =
        booking.cancellationPolicy;

    if (!policy) {
        throw new ApiError(
            400,
            "Cancellation policy is not available for this booking."
        );
    }
    
    const bookingAmount =
        Number(booking.totalAmount);

    if (
        policy.type ===
        "NonRefundable"
    ) {
        return {
            refundAmount: 0,
            refundPercentage: 0,
        };
    }

    if (
        policy.type ===
            "FreeCancellation" &&
        policy.freeCancellationUntil
    ) {
        const now = new Date();

        if (
            now <=
            new Date(
                policy.freeCancellationUntil
            )
        ) {
            return {
                refundAmount:
                    bookingAmount,
                refundPercentage: 100,
            };
        }

        return {
            refundAmount: 0,
            refundPercentage: 0,
        };
    }

    if (
        policy.type ===
            "PartialRefund" &&
        Array.isArray(policy.rules)
    ) {
        const now = new Date();

        const checkInDate =
            new Date(
                booking.checkInDate
            );

        const difference =
            checkInDate.getTime() -
            now.getTime();

        const hoursRemaining =
            difference /
            (1000 * 60 * 60);

        const sortedRules =
            [...policy.rules].sort(
                (a, b) =>
                    b.beforeHours -
                    a.beforeHours
            );

        const applicableRule =
            sortedRules.find(
                (rule) =>
                    hoursRemaining >=
                    rule.beforeHours
            );

        const refundPercentage =
            applicableRule
                ? applicableRule.refundPercentage
                : 0;

        const refundAmount =
            (
                bookingAmount *
                refundPercentage
            ) / 100;

        return {
            refundAmount,
            refundPercentage,
        };
    }

    return {
        refundAmount: 0,
        refundPercentage: 0,
    };
};


const getBookingForCancellation =
    async ({
        bookingId,
        user,
    }) => {
        const booking =
            await Booking.findOne({
                _id: bookingId,
                user,
                isActive: true,
            });

        if (!booking) {
            throw new ApiError(
                404,
                "Booking not found."
            );
        }

        return booking;
    };

// Create Cancellation

const createCancellation =
    async ({
        bookingId,
        reason,
        user,
    }) => {
        // Find booking

        const booking =
            await getBookingForCancellation({
                bookingId,
                user,
            });

        // Booking must be confirmed

        if (
            booking.bookingStatus !==
            "Confirmed"
        ) {
            throw new ApiError(
                400,
                `Booking cannot be cancelled because its current status is ${booking.bookingStatus}.`
            );
        }

        // Booking must not already
        // be cancelled

        if (booking.isCancelled) {
            throw new ApiError(
                409,
                "Booking has already been cancelled."
            );
        }

        // Payment must be successful

        if (
            booking.paymentStatus !==
            "Paid"
        ) {
            throw new ApiError(
                400,
                "Booking cannot be cancelled because payment is not completed."
            );
        }

        // Check existing cancellation

        const existingCancellation =
            await Cancellation.findOne({
                booking: bookingId,
                isActive: true,
            });

        if (existingCancellation) {
            throw new ApiError(
                409,
                "Cancellation request already exists for this booking."
            );
        }

        // Calculate refund

        const {
            refundAmount,
            refundPercentage,
        } = calculateRefund({
            booking,
        });

        // Create cancellation record

        const cancellation =
            await Cancellation.create({
                booking: booking._id,
                user,
                reason,
                cancellationStatus:
                    "Completed",
                refundAmount,
                refundStatus:
                    refundAmount > 0
                        ? "Completed"
                        : "NotApplicable",
                cancellationDate:
                    new Date(),
                processedAt:
                    new Date(),
                notes:
                    `Refund percentage: ${refundPercentage}%`,
            });

        // Update booking

        booking.bookingStatus =
            "Cancelled";

        booking.paymentStatus =
            refundAmount > 0
                ? "Refunded"
                : booking.paymentStatus;

        booking.cancellationReason =
            reason;

        booking.cancellationDate =
            new Date();

        booking.isCancelled =
            true;

        await booking.save();

        // Update payment

        const payment =
            await Payment.findOne({
                booking: booking._id,
                isActive: true,
            });

        if (payment) {
            payment.refundAmount =
                refundAmount;

            payment.refundReason =
                reason;

            payment.refundedAt =
                refundAmount > 0
                    ? new Date()
                    : null;

            if (refundAmount > 0) {
                payment.paymentStatus =
                    "Refunded";
            }

            await payment.save();
        }

        return await Cancellation.findById(
            cancellation._id
        )
            .populate(
                "user",
                "fullName email avatar"
            )
            .populate(
                "booking"
            );
    };

// Get All Cancellations

const getAllCancellations =
    async ({
        page = 1,
        limit = 10,
        user,
    } = {}) => {
        page = Number(page);
        limit = Number(limit);

        const skip =
            (page - 1) * limit;

        const query = {
            user,
            isActive: true,
        };

        const [
            cancellations,
            total,
        ] = await Promise.all([
            Cancellation.find(query)
                .populate(
                    "user",
                    "fullName email avatar"
                )
                .populate("booking")
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit),

            Cancellation.countDocuments(
                query
            ),
        ]);

        return {
            cancellations,
            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(
                        total / limit
                    ),
            },
        };
    };

// Get Cancellation By ID

const getCancellationById =
    async ({
        cancellationId,
        user,
    }) => {
        const cancellation =
            await Cancellation.findOne({
                _id: cancellationId,
                user,
                isActive: true,
            })
                .populate(
                    "user",
                    "fullName email avatar"
                )
                .populate("booking");

        if (!cancellation) {
            throw new ApiError(
                404,
                "Cancellation not found."
            );
        }

        return cancellation;
    };

export const cancellationService = {
    createCancellation,
    getAllCancellations,
    getCancellationById,
};