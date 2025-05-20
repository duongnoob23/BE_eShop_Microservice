const User = require("../models/user-model");
const logger = require("../config/logger");
const { formatResponse } = require("../utils/response");

/**
 * Get user by ID
 * @route GET /api/users/:userId
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json(formatResponse(false, null, "User not found"));
    }

    res
      .status(200)
      .json(formatResponse(true, user, "User retrieved successfully"));
  } catch (error) {
    logger.error(`Error getting user: ${error.message}`);
    next(error);
  }
};

/**
 * Get user addresses
 * @route GET /api/users/:userId/addresses
 */
exports.getUserAddresses = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("addresses");

    if (!user) {
      return res
        .status(404)
        .json(formatResponse(false, null, "User not found"));
    }

    res
      .status(200)
      .json(
        formatResponse(true, user.addresses, "Addresses retrieved successfully")
      );
  } catch (error) {
    logger.error(`Error getting addresses: ${error.message}`);
    next(error);
  }
};

/**
 * Add address to user
 * @route POST /api/users/:userId/addresses
 */
exports.addUserAddress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json(formatResponse(false, null, "User not found"));
    }

    // If this is the default address, unset any existing default
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    });

    await user.save();

    logger.info(`Address added for user: ${userId}`);
    res
      .status(201)
      .json(formatResponse(true, user.addresses, "Address added successfully"));
  } catch (error) {
    logger.error(`Error adding address: ${error.message}`);
    next(error);
  }
};
