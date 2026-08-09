import { Router } from "express";

import {
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
} from "../controllers/payment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post(
    "/",
    createPayment
);

router.get(
    "/",
    getAllPayments
);

router.get(
    "/search",
    searchPayments
);

router.get(
    "/filter",
    filterPayments
);

router.get(
    "/:paymentId",
    getPaymentById
);

router.patch(
    "/:paymentId",
    updatePayment
);

router.patch(
    "/:paymentId/paid",
    markPaymentAsPaid
);
router.patch(
    "/:paymentId/failed",
    markPaymentAsFailed
);
router.patch(
    "/:paymentId/refund",
    refundPayment
);

router.delete(
    "/:paymentId",
    deletePayment
);

export default router;