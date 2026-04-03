/**
 * Standard API response wrapper for successful responses.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g., 200, 201)
 * @param {string} message - Success message
 * @param {Object} [data] - Optional data payload
 */
export const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
