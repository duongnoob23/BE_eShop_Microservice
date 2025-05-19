const { kafka, TOPICS } = require("./config");
const logger = require("../utils/logger");
const Inventory = require("../models/inventory");

// Create consumer
const consumer = kafka.consumer({ groupId: "inventory-service-group" });

// Initialize and run consumer
const run = async () => {
  try {
    await consumer.connect();
    logger.info("Kafka consumer connected successfully");

    // Subscribe to topics
    await consumer.subscribe({
      topic: TOPICS.CHECK_INVENTORY,
      fromBeginning: false,
    });
    logger.info(`Subscribed to topic: ${TOPICS.CHECK_INVENTORY}`);

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
          if (topic === TOPICS.CHECK_INVENTORY) {
            await handleCheckInventory(data);
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

// Handle check inventory event
const handleCheckInventory = async (data) => {
  try {
    const { productId, stockQuantity } = data.payload;
    logger.info(
      `Checking inventory for product ${productId} with stock ${stockQuantity}`
    );

    // Find inventory for product
    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      logger.warn(`Inventory not found for product ${productId}`);

      // Send response that inventory doesn't exist
      if (global.kafkaProducer) {
        await global.kafkaProducer.sendInventoryChecked(
          productId,
          false,
          0,
          stockQuantity
        );
      }
      return;
    }

    // Check if inventory available quantity matches stock
    const isCorrect = inventory.availableQuantity === stockQuantity;

    logger.info(
      `Inventory check for product ${productId}: ${
        isCorrect ? "CORRECT" : "INCORRECT"
      } (Available: ${inventory.availableQuantity}, Stock: ${stockQuantity})`
    );

    // Send response
    if (global.kafkaProducer) {
      await global.kafkaProducer.sendInventoryChecked(
        productId,
        isCorrect,
        inventory.availableQuantity,
        stockQuantity
      );
    }
  } catch (error) {
    logger.error("Error handling check inventory event:", error);
  }
};

module.exports = {
  run,
};
