const mongoose = require("mongoose");
const logger = require("./logger");

/**
 * Connect to MongoDB
 */
exports.connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/userdb",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
