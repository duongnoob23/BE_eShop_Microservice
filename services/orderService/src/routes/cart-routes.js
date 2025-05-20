const express = require("express");
const cartController = require("../controllers/cart-controller");

const router = express.Router();

// Cart routes
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.patch("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

module.exports = router;
