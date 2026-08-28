import { Router } from "express";

import {
    createWishlist,
    getAllWishlist,
    getWishlistById,
    getWishlistByItem,
    searchWishlist,
    filterWishlist,
    updateWishlist,
    deleteWishlist,
} from "../controllers/wishlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.use(verifyJWT);

router.post(
    "/",
    createWishlist
);

router.get(
    "/",
    getAllWishlist
);

router.get(
    "/search",
    searchWishlist
);

router.get(
    "/filter",
    filterWishlist
);

router.get(
    "/item",
    getWishlistByItem
);

router.get(
    "/:wishlistId",
    getWishlistById
);

router.patch(
    "/:wishlistId",
    updateWishlist
);


router.delete(
    "/:wishlistId",
    deleteWishlist
);

export default router;