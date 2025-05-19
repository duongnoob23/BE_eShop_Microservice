const express = require("express");
const categoryController = require("../controllers/category-controller");

const router = express.Router();

// GET /api/categories - Get all categories
router.get("/", categoryController.getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Kiểm tra xem hàm getSubcategories có tồn tại không
// Nếu không, hãy comment hoặc xóa dòng này
// router.get("/:id/subcategories", categoryController.getSubcategories);

// GET /api/categories/:id/products - Get products by category
router.get("/:id/products", categoryController.getProductsByCategory);

// POST /api/categories - Create new category
router.post("/", categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put("/:id", categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
