// backend/src/utils/responseHelper.js
class ResponseHelper {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static created(res, data, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }

    static error(res, message, statusCode = 500, error = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: error?.message || error,
            ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
        });
    }

    static validationError(res, errors, message = 'Validation failed') {
        return res.status(400).json({
            success: false,
            message,
            errors
        });
    }
}

module.exports = ResponseHelper;