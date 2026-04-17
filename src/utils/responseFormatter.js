export const sendSuccess = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data
    });
};

export const sendError = (res, message, code, statusCode = 400) => {
    res.status(statusCode).json({
        success: false,
        error: { code, message }
    });
};
