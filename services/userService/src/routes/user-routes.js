const express = require("express");
const userController = require("../controllers/user-controller");
const authController = require("../controllers/auth-controller");

const router = express.Router();

// Protected routes - require authentication
router.use(authController.protect);

// Current user routes
router.get("/me", userController.getCurrentUser);
router.patch("/change-password", userController.changePassword);

// Admin only routes
router.use(authController.restrictTo("admin"));
router.get("/", userController.getAllUsers);

// Routes for specific user
router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
