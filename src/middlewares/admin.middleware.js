import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request.");
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Access denied.");
    }

    next();
});