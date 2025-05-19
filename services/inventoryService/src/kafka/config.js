const { Kafka } = require("kafkajs");
const logger = require("../utils/logger");

// Kafka configuration
const kafka = new Kafka({
  clientId: "inventory-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Kafka topics
const TOPICS = {
  CHECK_INVENTORY: "CheckInventory",
  INVENTORY_CHECKED: "InventoryChecked",
};

module.exports = {
  kafka,
  TOPICS,
};
