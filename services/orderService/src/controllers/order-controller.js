const Order = require("../models/order");
const Cart = require("../models/cart");
const { StatusCodes } = require("http-status-codes");
const logger = require("../utils/logger");
const AppError = require("../utils/app-error");

// Sử dụng userId cố định cho development
const DEFAULT_USER_ID = "user123";

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress, notes } = req.body;
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Get cart
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Cart is empty", StatusCodes.BAD_REQUEST));
    }

    // Create order items from cart items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      productImage: item.productImage,
    }));

    // Create new order
    const order = new Order({
      userId,
      items: orderItems,
      paymentMethod,
      shippingAddress:
        shippingAddress || "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      notes,
    });

    // Calculate total amount
    order.calculateTotalAmount();

    // Save order
    await order.save();

    // Clear cart after order is created
    cart.items = [];
    await cart.save();

    logger.info(`Created new order ${order.orderNumber} for user ${userId}`);

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res, next) => {
  try {
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Get orders with pagination
    const orders = await Order.find({ userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Order.countDocuments({ userId });

    res.status(StatusCodes.OK).json({
      status: "success",
      results: orders.length,
      total,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get order details by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Find order
    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return next(new AppError("Order not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Sử dụng userId cố định
    const userId = DEFAULT_USER_ID;

    // Find order
    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return next(new AppError("Order not found", StatusCodes.NOT_FOUND));
    }

    // Check if order can be cancelled
    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      return next(
        new AppError(
          `Order cannot be cancelled because it is already ${order.status}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // Update order status
    order.status = "CANCELLED";
    order.updatedAt = Date.now();
    await order.save();

    logger.info(`Cancelled order ${order.orderNumber} for user ${userId}`);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(StatusCodes.OK).json({
      status: "success",
      results: orders.length,
      total,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPING",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // Find and update order
    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError("Order not found", StatusCodes.NOT_FOUND));
    }

    // Update status
    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    logger.info(`Updated order ${order.orderNumber} status to ${status}`);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
