const express = require("express");
const orderController = require("../controllers/order-controller");

const router = express.Router();

// User order routes
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.patch("/:id/cancel", orderController.cancelOrder);

// Admin routes (không cần middleware xác thực)
router.get("/admin/all", orderController.getAllOrders);
router.patch("/admin/:id/status", orderController.updateOrderStatus);

module.exports = router;
