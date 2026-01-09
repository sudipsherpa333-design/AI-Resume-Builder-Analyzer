const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Advanced async handler with timeout
const asyncHandlerWithTimeout = (fn, timeoutMs = 10000) => {
    return async (req, res, next) => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeoutMs);
        });

        try {
            await Promise.race([
                Promise.resolve(fn(req, res, next)),
                timeoutPromise
            ]);
        } catch (error) {
            next(error);
        }
    };
};

// Error wrapper for cleaner controller code
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    asyncHandler,
    asyncHandlerWithTimeout,
    catchAsync
};