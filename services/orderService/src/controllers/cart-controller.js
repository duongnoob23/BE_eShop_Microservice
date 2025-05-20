const Cart = require("../models/cart");
const { StatusCodes } = require("http-status-codes");
const logger = require("../utils/logger");
const productService = require("../services/product-service");
const AppError = require("../utils/app-error");

// Sử dụng userId cố định cho development
const DEFAULT_USER_ID = "user123";

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    // Sử dụng userId cố định thay vì lấy từ header
    const userId = DEFAULT_USER_ID;

    // Validate quantity
    if (!quantity || quantity < 1) {
      return next(
        new AppError("Quantity must be at least 1", StatusCodes.BAD_REQUEST)
      );
    }

    // Giả lập thông tin sản phẩm thay vì gọi product service
    const product = {
      id: productId,
      name: `Product ${productId}`,
      price: 100000,
      stockQuantity: 100,
      imageUrl: `https://example.com/images/${productId}.jpg`,
    };

    // Find cart for user or create new one
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        productName: product.name,
        quantity,
        price: product.price,
        productImage: product.imageUrl,
      });
    }

    // Update cart timestamp
    cart.updatedAt = Date.now();
    await cart.save();

    logger.info(`Updated cart for user ${userId}, added product ${productId}`);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        items: cart.items,
        total: cart.calculateTotal(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get cart items for user
exports.getCart = async (req, res, next) => {
  try {
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Find cart for user
    let cart = await Cart.findOne({ userId });

    // If no cart exists, return empty cart
    if (!cart) {
      return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          items: [],
          total: 0,
        },
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      results: cart.items.length,
      data: {
        items: cart.items,
        total: cart.calculateTotal(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Validate quantity
    if (!quantity || quantity < 0) {
      return next(
        new AppError("Quantity must be at least 0", StatusCodes.BAD_REQUEST)
      );
    }

    // Find cart for user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(new AppError("Cart not found", StatusCodes.NOT_FOUND));
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === id
    );

    if (itemIndex === -1) {
      return next(new AppError("Cart item not found", StatusCodes.NOT_FOUND));
    }

    // If quantity is 0, remove item from cart
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
      logger.info(`Removed item from cart for user ${userId}, item ${id}`);
    } else {
      // Update item quantity
      cart.items[itemIndex].quantity = quantity;
      logger.info(`Updated cart item for user ${userId}, item ${id}`);
    }

    // Update cart timestamp
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        items: cart.items,
        total: cart.calculateTotal(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Find cart for user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(new AppError("Cart not found", StatusCodes.NOT_FOUND));
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === id
    );

    if (itemIndex === -1) {
      return next(new AppError("Cart item not found", StatusCodes.NOT_FOUND));
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Update cart timestamp
    cart.updatedAt = Date.now();
    await cart.save();

    logger.info(`Removed item from cart for user ${userId}, item ${id}`);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        items: cart.items,
        total: cart.calculateTotal(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Find cart for user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Cart is already empty",
      });
    }

    // Clear cart items
    cart.items = [];

    // Update cart timestamp
    cart.updatedAt = Date.now();
    await cart.save();

    logger.info(`Cleared cart for user ${userId}`);

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};
