import { Router } from "express";

import {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    verifyForgotPasswordOTP,
    resetPassword,
    changeCurrentPassword,
    updateAccountDetails,
    getCurrentUser
} from "../controllers/auth.controller.js";

import {
    verifyJWT
} from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

import { uploadProfileImage } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);

router.post(
    "/verify-otp",
    verifyOTP
);

router.post("/login", loginUser);

router.post(
    "/refresh-token",
    refreshAccessToken
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-forgot-password-otp",
    verifyForgotPasswordOTP
);

router.post(
    "/reset-password",
    resetPassword
);

router.post(
    "/logout",
    verifyJWT,
    logoutUser
);

router.post(
    "/change-current-password",
    verifyJWT,
    changeCurrentPassword
);

router.get(
    "/me",
    verifyJWT,
    getCurrentUser
);

router.patch(
    "/update-account-details",
    verifyJWT,
    updateAccountDetails
);

router.patch(
    "/upload-profile-image",
    (req, res, next) => {
        console.log("Reached route");
        next();
    },
    verifyJWT,
    upload.single("profileImage"),
    (req, res, next) => {
        console.log("req.file =", req.file);
        console.log("req.body =", req.body);
        next();
    },
    uploadProfileImage
);

export default router;