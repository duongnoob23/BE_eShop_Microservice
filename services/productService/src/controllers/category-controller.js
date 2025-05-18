const Category = require("../models/category");
const Product = require("../models/product");

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    // Check if parent category exists if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }
    }

    const category = new Category({
      name,
      description,
      parentId: parentId || null,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, parentId, status } = req.body;

    // Validate category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if parent category exists if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }

      // Prevent circular reference
      if (parentId === req.params.id) {
        return res
          .status(400)
          .json({ message: "Category cannot be its own parent" });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, parentId, status },
      { new: true }
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parentId: req.params.id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category with subcategories. Delete subcategories first or update their parentId.",
      });
    }

    // Check if category has products
    const products = await Product.find({ categoryId: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category with products. Delete or move products to another category first.",
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const skip = page * size;

    // Lấy danh mục hiện tại
    const currentCategory = await Category.findById(req.params.id);

    if (!currentCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Tìm tất cả danh mục con (nếu có)
    const subcategories = await Category.find({
      parentId: req.params.id,
      status: "active",
    });

    // Tạo mảng chứa ID của danh mục hiện tại và các danh mục con
    const categoryIds = [req.params.id, ...subcategories.map((sub) => sub._id)];

    // Tìm sản phẩm thuộc danh mục hiện tại hoặc các danh mục con
    const products = await Product.find({
      categoryId: { $in: categoryIds },
      status: "active",
    })
      .populate("categoryId")
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      categoryId: { $in: categoryIds },
      status: "active",
    });

    res.status(200).json({
      products,
      pagination: {
        total,
        page,
        size,
        pages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
