const Product = require("../models/product");
const Category = require("../models/category");

// Get all products with pagination
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const skip = page * size;

    // Xây dựng filter
    const filter = { status: "active" };

    // Nếu có category, thêm vào filter
    if (req.query.category) {
      // Tìm category theo tên
      const categoryObj = await Category.findOne({ name: req.query.category });
      if (categoryObj) {
        filter.categoryId = categoryObj._id;
      }
    }

    const products = await Product.find(filter)
      .populate("categoryId")
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

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
    console.error("Error in getAllProducts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, images, categoryId, stock } = req.body;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const product = new Product({
      name,
      description,
      price,
      images: images || [],
      categoryId,
      stock: stock || 0,
      status: "active",
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, images, categoryId, stock, status } =
      req.body;

    // Validate product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        images,
        categoryId,
        stock,
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    // Validate product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Soft delete by changing status to inactive
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "inactive", updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json({
      message: "Product deleted successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
