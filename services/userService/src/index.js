// User Service Entry Point
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

// Load environment variables
dotenv.config();

// Import utils
const logger = require("./utils/logger");
const { errorHandler } = require("./utils/error-handler");

// Import routes
const userRoutes = require("./routes/user-routes");
const addressRoutes = require("./routes/address-routes");
const authRoutes = require("./routes/auth-routes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8003;

logger.info("User Service đang khởi động...");

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Setup database
const setupDatabase = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/userdb";
    logger.info(`Connecting to MongoDB at ${MONGO_URI}`);

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    logger.info("Connected to MongoDB successfully");

    // Seed data if needed
    if (process.env.NODE_ENV === "development") {
      try {
        const { checkAndSeedData } = require("./scripts/auto-seed");
        await checkAndSeedData();
      } catch (seedError) {
        logger.error("Error seeding data:", seedError);
      }
    }
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    logger.info("Retrying MongoDB connection in 5 seconds...");
    setTimeout(setupDatabase, 5000);
  }
};

// Routes
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", authRoutes);

// Simple health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "User Service is running" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`User Service running on port ${PORT}`);
  setupDatabase();
});

module.exports = app;
