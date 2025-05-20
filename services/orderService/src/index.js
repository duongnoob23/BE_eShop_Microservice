/**
 * Order Service Entry Point
 *
 * Service này quản lý giỏ hàng và đơn hàng
 */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const logger = require("./utils/logger");
const errorHandler = require("./utils/error-handler");
const connectDB = require("./config/db");

// Import routes
const cartRoutes = require("./routes/cart-routes");
const orderRoutes = require("./routes/order-routes");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8004;

logger.info("Order Service đang khởi động...");

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Order Service is running",
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed data in development environment
    if (process.env.NODE_ENV === "development") {
      try {
        const { seedData } = require("./scripts/seed");
        await seedData();
      } catch (error) {
        logger.error("Error seeding data:", error);
      }
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Order Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});
