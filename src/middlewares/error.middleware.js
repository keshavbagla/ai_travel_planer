import { ApiError } from "../utils/ApiError.js";

const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error("========== ERROR ==========");
    console.error(err);
    console.error(err.stack);
    console.error("===========================");

    let error = err;

    if (!(error instanceof ApiError)) {
        error = new ApiError(
            error.statusCode || 500,
            error.message || "Internal Server Error",
            [],
            err.stack
        );
    }

    return res.status(error.statusCode).json({
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [],
        data: null,
    });
};

export { errorHandler };