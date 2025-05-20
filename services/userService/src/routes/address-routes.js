const express = require("express");
const addressController = require("../controllers/address-controller");
const authController = require("../controllers/auth-controller");

const router = express.Router();

// Protected routes - require authentication
router.use(authController.protect);

// Address routes
router
  .route("/")
  .get(addressController.getUserAddresses)
  .post(addressController.createAddress);

router
  .route("/:id")
  .get(addressController.getAddressById)
  .patch(addressController.updateAddress)
  .delete(addressController.deleteAddress);

router.patch("/:id/set-default", addressController.setDefaultAddress);

module.exports = router;
