const { v4: uuidv4 } = require("uuid");
const { kafka, TOPICS } = require("./config");
const logger = require("../utils/logger");

// Create producer
const producer = kafka.producer();

// Initialize producer
const initialize = async () => {
  try {
    await producer.connect();
    logger.info("Kafka producer connected successfully");
    return true;
  } catch (error) {
    logger.error("Failed to connect Kafka producer:", error);
    return false;
  }
};

// Send message to Kafka
const sendMessage = async (topic, message) => {
  try {
    const eventId = uuidv4();

    // Add metadata to message
    const fullMessage = {
      eventId,
      eventType: message.eventType,
      timestamp: new Date().toISOString(),
      ...message,
    };

    // Send to Kafka
    await producer.send({
      topic,
      messages: [
        {
          key: message.payload?.productId || uuidv4(),
          value: JSON.stringify(fullMessage),
        },
      ],
    });

    logger.info(
      `Message sent to ${topic} successfully with eventId: ${eventId}`
    );
    return { success: true, eventId };
  } catch (error) {
    logger.error(`Error sending message to ${topic}:`, error);
    return { success: false, error: error.message };
  }
};

// Send inventory checked event
const sendInventoryChecked = async (
  productId,
  isCorrect,
  availableQuantity,
  stockQuantity
) => {
  return await sendMessage(TOPICS.INVENTORY_CHECKED, {
    eventType: "inventoryChecked",
    payload: {
      productId,
      isCorrect,
      availableQuantity,
      stockQuantity,
    },
  });
};

module.exports = {
  initialize,
  producer,
  sendInventoryChecked,
};
