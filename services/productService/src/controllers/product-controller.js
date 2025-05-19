const Product = require("../models/product");
const Category = require("../models/category");
const logger = require("../utils/logger");
const { getInventoryCheckResult } = require("../kafka/consumers");

// Get all products
// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const skip = parseInt(req.query.skip) || page * size;
    const category = req.query.category;

    logger.info(
      `Getting all products, page: ${page}, size: ${size}, skip: ${skip}, category: ${
        category || "all"
      }`
    );

    // Xây dựng filter
    const filter = { status: "active" };

    // Nếu có category, thêm vào filter
    if (category) {
      // Tìm category theo tên hoặc ID
      let categoryObj;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryObj = await Category.findById(category);
      } else {
        categoryObj = await Category.findOne({ name: category });
      }

      if (categoryObj) {
        filter.categoryId = categoryObj._id;
      }
    }

    // Lấy sản phẩm từ database
    const products = await Product.find(filter)
      .skip(skip)
      .limit(size)
      .populate("categoryId")
      .sort({ createdAt: -1 });

    // Đếm tổng số sản phẩm
    const totalProducts = await Product.countDocuments(filter);

    // Kiểm tra inventory cho mỗi sản phẩm
    const productsWithInventoryCheck = await Promise.all(
      products.map(async (product) => {
        const productObj = product.toObject();

        // Kiểm tra nếu có Kafka producer
        if (global.kafkaProducer) {
          try {
            // Gửi sự kiện kiểm tra inventory
            await global.kafkaProducer.sendCheckInventory(
              productObj._id.toString(),
              productObj.stock
            );

            // Đợi một chút để nhận phản hồi
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Lấy kết quả kiểm tra inventory
            const inventoryCheck = getInventoryCheckResult(
              productObj._id.toString()
            );
            console.log(">>> ", inventoryCheck);

            if (inventoryCheck) {
              // Thêm kết quả kiểm tra inventory vào sản phẩm
              productObj.inventoryCorrect = inventoryCheck.isCorrect;

              // Nếu inventory không chính xác, cập nhật giá trị stock
              if (!inventoryCheck.isCorrect) {
                productObj.actualStock = inventoryCheck.availableQuantity;
                logger.warn(
                  `Product ${productObj._id} has incorrect stock: DB=${productObj.stock}, Inventory=${inventoryCheck.availableQuantity}`
                );
              }
            }
          } catch (error) {
            logger.error(
              `Error checking inventory for product ${productObj._id}:`,
              error
            );
          }
        }

        return productObj;
      })
    );

    // Trả về dữ liệu với cấu trúc phù hợp với frontend
    res.status(200).json({
      products: productsWithInventoryCheck,
      pagination: {
        total: totalProducts,
        page: page,
        size: size,
        pages: Math.ceil(totalProducts / size),
      },
    });
  } catch (error) {
    logger.error("Error getting all products:", error);
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Getting product with ID: ${id}`);

    const product = await Product.findById(id).populate("categoryId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productObj = product.toObject();

    // Check inventory if Kafka producer is available
    if (global.kafkaProducer) {
      try {
        // Send check inventory event
        await global.kafkaProducer.sendCheckInventory(
          productObj._id.toString(),
          productObj.stock
        );

        // Wait for a short time to get the response
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get inventory check result
        const inventoryCheck = getInventoryCheckResult(
          productObj._id.toString()
        );

        if (inventoryCheck) {
          // Add inventory check result to product
          productObj.inventoryCorrect = inventoryCheck.isCorrect;

          // If inventory is not correct, update the stock value
          if (!inventoryCheck.isCorrect) {
            productObj.actualStock = inventoryCheck.availableQuantity;
            logger.warn(
              `Product ${productObj._id} has incorrect stock: DB=${productObj.stock}, Inventory=${inventoryCheck.availableQuantity}`
            );
          }
        }
      } catch (error) {
        logger.error(
          `Error checking inventory for product ${productObj._id}:`,
          error
        );
      }
    }

    res.status(200).json(productObj);
  } catch (err) {
    logger.error(`Error in getProductById: ${err.message}`);
    next(err);
  }
};

// Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, images, categoryId, stock } = req.body;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    logger.info("Creating new product");
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
    logger.info(`Product created with ID: ${product._id}`);

    res.status(201).json(product);
  } catch (err) {
    logger.error("Error in createProduct:", err);
    next(err);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info(`Updating product with ID: ${id}`);

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`Product updated: ${product._id}`);
    res.status(200).json(product);
  } catch (err) {
    logger.error(`Error in updateProduct: ${err.message}`);
    next(err);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info(`Deleting product with ID: ${id}`);

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`Product deleted: ${id}`);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    logger.error(`Error in deleteProduct: ${err.message}`);
    next(err);
  }
};

//1. Product Controller gọi API lấy sản phẩm từ database.
// Với mỗi sản phẩm, controller gọi hàm  sendCheckInventory để gửi sự kiện kiểm tra inventory qua Kafka.
//2. Kafka Producer trong Product Service gửi sự kiện  CHECK_INVENTORY với thông tin  productId và  stockQuantity.
// Kafka Consumer trong Inventory Service nhận sự kiện và chuyển cho hàm  handleCheckInventory.
// Hàm  handleCheckInventory tìm inventory tương ứng với  productId và kiểm tra xem  availableQuantity có khớp với  stockQuantity không.
// Sau khi kiểm tra, Inventory Service gọi hàm  sendInventoryChecked để gửi kết quả kiểm tra qua Kafka.
// Kafka Producer trong Inventory Service gửi sự kiện  INVENTORY_CHECKED với thông tin  productId,  isCorrect,  availableQuantity, và  stockQuantity.
// Kafka Consumer trong Product Service nhận sự kiện và chuyển cho hàm  handleInventoryChecked.
// Hàm  handleInventoryChecked lưu kết quả kiểm tra vào  inventoryCheckResults map.
// Product Controller đợi một khoảng thời gian (500ms) để đảm bảo kết quả đã được nhận, sau đó gọi hàm  getInventoryCheckResult để lấy kết quả.
// Nếu có kết quả, controller thêm thông tin inventoryCorrect và actualStock (nếu cần) vào sản phẩm trước khi trả về cho client.
