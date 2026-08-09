import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const verifyJWT = asyncHandler(async(req, _, next) => {
  try{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
      throw new ApiError(401, "Invalid Access Token");
    }

    if(user.accountStatus !== "active"){
      throw new ApiError(403, "Your account is currently inactive");
    }

    if(user.email && !user.isEmailVerified){
      throw new ApiError(403, "Please verify your email first");
    }

    if(user.phoneNumber && !user.isPhoneVerified){
      throw new ApiError(403, "Please verify your phone number first");
    }

    req.user = user;
    next()
  }

  catch(error){
    throw new ApiError(401, error?.message || "Invalid access token")
  }
});