const express = require("express");
const router = express.Router();
const productController = require("../controllers/product-controller");

// Get all products with pagination
router.get("/", productController.getAllProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Create a new product
router.post("/", productController.createProduct);

// Update a product
router.put("/:id", productController.updateProduct);

// Delete a product (soft delete)
router.delete("/:id", productController.deleteProduct);

module.exports = router;
