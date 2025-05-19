// Inventory Service Entry Point
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

// Import models
const Inventory = require("./models/inventory");

// Import Kafka modules
const kafkaConsumers = require("./kafka/consumers");
const kafkaProducers = require("./kafka/producers");

// Import routes
const inventoryRoutes = require("./routes/inventory-routes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5004;

logger.info("Inventory Service starting...");

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Setup Kafka
const setupKafka = async () => {
  try {
    // Initialize Kafka producer
    const initialized = await kafkaProducers.initialize();
    if (initialized) {
      // Make producer globally available
      global.kafkaProducer = kafkaProducers;
      logger.info("Kafka producer initialized successfully");

      // Start Kafka consumer
      await kafkaConsumers.run();
    } else {
      logger.error("Failed to initialize Kafka producer");
      // Retry after delay
      logger.info("Retrying Kafka setup in 5 seconds...");
      setTimeout(setupKafka, 5000);
    }
  } catch (error) {
    logger.error("Error setting up Kafka:", error);
    // Retry after delay
    logger.info("Retrying Kafka setup in 5 seconds...");
    setTimeout(setupKafka, 5000);
  }
};

// Setup database
const setupDatabase = async () => {
  try {
    // Always use the MONGO_URI from environment variables if available
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb";
    logger.info(`Connecting to MongoDB at ${MONGO_URI}`);

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Default is 30000 (30s)
    });

    logger.info("Connected to MongoDB successfully");

    // Setup Kafka after database is connected
    await setupKafka();
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    // Retry connection after delay
    logger.info("Retrying MongoDB connection in 5 seconds...");
    setTimeout(setupDatabase, 5000);
  }
};

// Routes
app.use("/api/inventory", inventoryRoutes);

// Simple health check endpoint
app.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Inventory Service is running" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Inventory Service running on port ${PORT}`);
  setupDatabase();
});
