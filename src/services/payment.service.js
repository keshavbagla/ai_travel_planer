import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generatePaymentReference } from "../utils/generatePaymentReference.js";

const populatePayment = (query) => {
    return query
        .populate(
            "user",
            "fullName email avatar"
        )
        .populate(
            "booking",
            "bookingReference bookingType checkInDate checkOutDate guests totalAmount currency paymentStatus bookingStatus"
        );
};

const validateReferences = async (
    paymentData
) => {

    const user =
        await User.findById(
            paymentData.user
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }
    const booking =
        await Booking.findOne({
            _id: paymentData.booking,
            user: paymentData.user,
            isActive: true,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    return {
        user,
        booking,
    };
};

const createPayment = async (
    paymentData
) => {

    const {
        booking,
    } = await validateReferences(
        paymentData
    );

    if (
        paymentData.amount !==
        booking.totalAmount
    ) {
        throw new ApiError(
            400,
            "Payment amount must match booking total amount."
        );
    }

    if (
        paymentData.currency &&
        paymentData.currency !==
            booking.currency
    ) {
        throw new ApiError(
            400,
            "Payment currency must match booking currency."
        );
    }

    const existingPayment =
        await Payment.findOne({
            booking: paymentData.booking,
            user: paymentData.user,
            isActive: true,
            paymentStatus: {
                $in: [
                    "Pending",
                    "Processing",
                    "Paid",
                ],
            },
        });

    if (existingPayment) {
        throw new ApiError(
            400,
            "An active payment already exists for this booking."
        );
    }

    let paymentReference;

    do {
        paymentReference =
            generatePaymentReference();
    } while (
        await Payment.exists({
            paymentReference,
        })
    );

    const payment =
        await Payment.create({
            ...paymentData,
            paymentReference,
        });

    return await populatePayment(
        Payment.findById(
            payment._id
        )
    );
};

const getAllPayments = async ({
    page = 1,
    limit = 10,
    user,
} = {}) => {
    page = Number(page);
    limit = Number(limit);

    const skip =
        (page - 1) * limit;

    const [
        payments,
        total,
    ] = await Promise.all([
        populatePayment(
            Payment.find({
                user,
                isActive: true,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Payment.countDocuments({
            user,
            isActive: true,
        }),
    ]);

    return {
        payments,
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

const getPaymentById = async ({
    paymentId,
    user,
}) => {
    const payment =
        await populatePayment(
            Payment.findOne({
                _id: paymentId,
                user,
                isActive: true,
            })
        );

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    return payment;
};

const searchPayments = async (
    keyword,
    user
) => {
    if (!keyword) {
        return [];
    }

    return await populatePayment(
        Payment.find({
            user,
            isActive: true,
            $or: [
                {
                    paymentReference: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    transactionId: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    paymentMethod: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    paymentGateway: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ],
        })
            .sort({
                createdAt: -1,
            })
            .limit(20)
    );
};

const filterPayments = async ({
    user,
    paymentStatus,
    paymentMethod,
    paymentGateway,
} = {}) => {
    const query = {
        user,
        isActive: true,
    };

    if (paymentStatus) {
        query.paymentStatus =
            paymentStatus;
    }

    if (paymentMethod) {
        query.paymentMethod =
            paymentMethod;
    }

    if (paymentGateway) {
        query.paymentGateway =
            paymentGateway;
    }

    return await populatePayment(
        Payment.find(query)
            .sort({
                createdAt: -1,
            })
    );
};

const updatePayment = async ({
    paymentId,
    paymentData,
    user,
}) => {
    const payment =
        await Payment.findOne({
            _id: paymentId,
            user,
            isActive: true,
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    delete paymentData.user;

    delete paymentData.paymentReference;


    Object.entries(
        paymentData
    ).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null
        ) {
            payment[key] = value;
        }
    });

    await payment.save();

    return await populatePayment(
        Payment.findById(
            payment._id
        )
    );
};

const markPaymentAsPaid = async ({
    paymentId,
    transactionId,
    user,
}) => {
    const payment =
        await Payment.findOne({
            _id: paymentId,
            user,
            isActive: true,
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    if (
        payment.paymentStatus ===
        "Refunded"
    ) {
        throw new ApiError(
            400,
            "Refunded payment cannot be marked as paid."
        );
    }

    payment.paymentStatus =
        "Paid";

    payment.transactionId =
        transactionId ||
        payment.transactionId;

    payment.paidAt =
        new Date();

    await payment.save();

    await Booking.findByIdAndUpdate(
        payment.booking,
        {
            paymentStatus: "Paid",
            bookingStatus: "Confirmed",
        }
    );

    return await populatePayment(
        Payment.findById(
            payment._id
        )
    );
};

const markPaymentAsFailed = async ({
    paymentId,
    failureReason,
    user,
}) => {
    const payment =
        await Payment.findOne({
            _id: paymentId,
            user,
            isActive: true,
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    payment.paymentStatus = "Failed";

    payment.failureReason =
        failureReason || "";

    payment.paidAt = null;

    await payment.save();

    await Booking.findByIdAndUpdate(
        payment.booking,
        {
            paymentStatus: "Failed",
        }
    );

    return await populatePayment(
        Payment.findById(
            payment._id
        )
    );
};

const refundPayment = async ({
    paymentId,
    refundAmount,
    refundReason,
    user,
}) => {
    const payment =
        await Payment.findOne({
            _id: paymentId,
            user,
            isActive: true,
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    if (
        payment.paymentStatus !==
        "Paid"
    ) {
        throw new ApiError(
            400,
            "Only paid payments can be refunded."
        );
    }

    if (
        refundAmount >
        payment.amount
    ) {
        throw new ApiError(
            400,
            "Refund amount cannot exceed payment amount."
        );
    }

    payment.refundAmount =
        refundAmount;

    payment.refundReason =
        refundReason || "";

    payment.refundedAt =
        new Date();

    if (
        refundAmount ===
        payment.amount
    ) {
        payment.paymentStatus =
            "Refunded";
    } else {
        payment.paymentStatus =
            "Partially Refunded";
    }

    await payment.save();

    await Booking.findByIdAndUpdate(
        payment.booking,
        {
            paymentStatus:
                payment.paymentStatus ===
                "Refunded"
                    ? "Refunded"
                    : "Paid",
        }
    );

    return await populatePayment(
        Payment.findById(
            payment._id
        )
    );
};

const deletePayment = async ({
    paymentId,
    user,
}) => {
    const payment =
        await Payment.findOne({
            _id: paymentId,
            user,
            isActive: true,
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    payment.isActive = false;

    await payment.save();
};

export const paymentService = {
    createPayment,
    getAllPayments,
    getPaymentById,
    searchPayments,
    filterPayments,
    updatePayment,
    markPaymentAsPaid,
    markPaymentAsFailed,
    refundPayment,
    deletePayment,
};