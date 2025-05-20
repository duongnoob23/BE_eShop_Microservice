/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @returns {Object} Formatted response
 */
exports.formatResponse = (success, data, message) => {
  return {
    success,
    data,
    message,
  };
};
