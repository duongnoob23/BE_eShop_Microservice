const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory-controller");

// Get all inventory items
router.get("/", inventoryController.getAllInventory);

// Get inventory by productId
router.get("/:productId", inventoryController.getInventoryByProductId);

// Create new inventory
router.post("/", inventoryController.createInventory);

// Update inventory
router.put("/:productId", inventoryController.updateInventory);

// Reserve inventory
router.post("/:productId/reserve", inventoryController.reserveInventory);

// Release inventory
router.post("/:productId/release", inventoryController.releaseInventory);

// Delete inventory
router.delete("/:productId", inventoryController.deleteInventory);

module.exports = router;
