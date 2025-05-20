const User = require("../models/user-model");
const logger = require("../config/logger");

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
exports.findUserById = async (userId) => {
  try {
    return await User.findById(userId).select("-password");
  } catch (error) {
    logger.error(`Error finding user by ID: ${error.message}`);
    throw error;
  }
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User object
 */
exports.findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    logger.error(`Error finding user by email: ${error.message}`);
    throw error;
  }
};

/**
 * Find user by username
 * @param {string} username - Username
 * @returns {Promise<Object>} User object
 */
exports.findUserByUsername = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    logger.error(`Error finding user by username: ${error.message}`);
    throw error;
  }
};
