import ApiError from "../utils/ApiError.js";
import httpStatus from "../constants/httpStatus.js";

const notFoundHandler = (req, res, next) => {
    next(
        new ApiError(
            httpStatus.NOT_FOUND,
            `Route ${req.method} ${req.originalUrl} not found on this server`,
        ),
    );
};

const globalErrorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode ||
            error.status ||
            httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, [], error.stack);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        timestamp: error.timestamp,
        ...(req.app.get("env") === "development" && { stack: error.stack }),
    };

    if (req.app.get("env") === "production") {
        delete response.stack;
        if (error.statusCode >= 500) {
            console.error("[Server Error]", err);
        }
    } else {
        console.error("[Error]", err.message, err.stack || "");
    }

    res.status(error.statusCode).json(response);
};

export { notFoundHandler, globalErrorHandler };
export default globalErrorHandler;
