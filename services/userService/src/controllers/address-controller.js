const Address = require("../models/address");
const User = require("../models/user");
const { AppError } = require("../utils/error-handler");
const logger = require("../utils/logger");

// Get all addresses for a user
exports.getUserAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.find({ userId });

    res.status(200).json({
      status: "success",
      results: addresses.length,
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

// Get address by ID
exports.getAddressById = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new AppError("Address not found", 404));
    }

    // Check if address belongs to the user
    if (address.userId.toString() !== req.user.id) {
      return next(
        new AppError("You do not have permission to access this address", 403)
      );
    }

    res.status(200).json({
      status: "success",
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};

// Create new address
exports.createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if this is the first address (make it default)
    const addressCount = await Address.countDocuments({ userId });
    const isDefault = addressCount === 0 ? true : req.body.isDefault || false;

    // Create new address
    const newAddress = await Address.create({
      ...req.body,
      userId,
      isDefault,
    });

    // Add address to user's addresses array
    await User.findByIdAndUpdate(userId, {
      $push: { addresses: newAddress._id },
    });

    res.status(201).json({
      status: "success",
      data: { address: newAddress },
    });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new AppError("Address not found", 404));
    }

    // Check if address belongs to the user
    if (address.userId.toString() !== req.user.id) {
      return next(
        new AppError("You do not have permission to update this address", 403)
      );
    }

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: { address: updatedAddress },
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new AppError("Address not found", 404));
    }

    // Check if address belongs to the user
    if (address.userId.toString() !== req.user.id) {
      return next(
        new AppError("You do not have permission to delete this address", 403)
      );
    }

    // Remove address from user's addresses array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: address._id },
    });

    // Delete address
    await Address.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Set address as default
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new AppError("Address not found", 404));
    }

    // Check if address belongs to the user
    if (address.userId.toString() !== req.user.id) {
      return next(
        new AppError("You do not have permission to update this address", 403)
      );
    }

    // Set all user addresses to non-default
    await Address.updateMany({ userId: req.user.id }, { isDefault: false });

    // Set this address as default
    address.isDefault = true;
    address.updatedAt = Date.now();
    await address.save();

    res.status(200).json({
      status: "success",
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};
