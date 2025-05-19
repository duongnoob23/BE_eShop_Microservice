const { kafka, TOPICS } = require("./config");
const logger = require("../utils/logger");

// Create consumer
const consumer = kafka.consumer({ groupId: "product-service-group" });

// Store for inventory check results
const inventoryCheckResults = new Map();

// Initialize and run consumer
const run = async () => {
  try {
    await consumer.connect();
    logger.info("Kafka consumer connected successfully");

    // Subscribe to topics
    await consumer.subscribe({
      topic: TOPICS.INVENTORY_CHECKED,
      fromBeginning: false,
    });
    logger.info(`Subscribed to topic: ${TOPICS.INVENTORY_CHECKED}`);

    // Run consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = message.value.toString();
          const data = JSON.parse(messageValue);

          logger.info(`Received message from topic ${topic}:`, {
            eventId: data.eventId,
          });

          // Process message based on topic
          if (topic === TOPICS.INVENTORY_CHECKED) {
            await handleInventoryChecked(data);
          }
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });

    return true;
  } catch (error) {
    logger.error("Failed to start Kafka consumer:", error);
    return false;
  }
};

// Handle inventory checked event
const handleInventoryChecked = async (data) => {
  try {
    const { productId, isCorrect, availableQuantity, stockQuantity } =
      data.payload;
    logger.info(
      `Received inventory check result for product ${productId}: ${
        isCorrect ? "CORRECT" : "INCORRECT"
      }`
    );

    // Store result
    inventoryCheckResults.set(productId, {
      isCorrect,
      availableQuantity,
      stockQuantity,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Error handling inventory checked event:", error);
  }
};

// Get inventory check result
const getInventoryCheckResult = (productId) => {
  return inventoryCheckResults.get(productId);
};

// Clear old results (call this periodically)
const clearOldResults = () => {
  const now = Date.now();
  const MAX_AGE = 5 * 60 * 1000; // 5 minutes

  for (const [productId, result] of inventoryCheckResults.entries()) {
    if (now - result.timestamp > MAX_AGE) {
      inventoryCheckResults.delete(productId);
    }
  }
};

// Setup periodic cleanup
setInterval(clearOldResults, 60 * 1000); // Every minute

module.exports = {
  run,
  getInventoryCheckResult,
};
