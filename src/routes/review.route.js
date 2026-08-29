import { Router } from "express";

import {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewsForEntity,
    searchReviews,
    filterReviews,
    updateReview,
    deleteReview,
} from "../controllers/review.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post(
    "/",
    createReview
);

router.get(
    "/",
    getAllReviews
);

router.get(
    "/search",
    searchReviews
);

router.get(
    "/filter",
    filterReviews
);

router.get(
    "/entity",
    getReviewsForEntity
);

router.get(
    "/:reviewId",
    getReviewById
);

router.patch(
    "/:reviewId",
    updateReview
);

router.delete(
    "/:reviewId",
    deleteReview
);

export default router;