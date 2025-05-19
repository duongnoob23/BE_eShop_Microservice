const express = require("express");
const router = express.Router();
const inventoryRoutes = require("./inventory-routes");

// Inventory routes
router.use("/inventory", inventoryRoutes);

module.exports = router;
