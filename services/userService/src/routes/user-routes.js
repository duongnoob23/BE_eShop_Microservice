const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

// Get user by ID
router.get("/:userId", userController.getUserById);

// Get user addresses
router.get("/:userId/addresses", userController.getUserAddresses);

// Add address to user
router.post("/:userId/addresses", userController.addUserAddress);

module.exports = router;
