import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


export const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false,
        });

        return {
            accessToken,
            refreshToken,
        };

    } catch (error) {

        throw new ApiError(
            500,
            "Error while generating authentication tokens"
        );

    }
};


export const verifyAccessToken = (token) => {

    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

};


export const verifyRefreshToken = (token) => {

    return jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    );

};