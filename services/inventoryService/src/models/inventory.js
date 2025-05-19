const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  reservedQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Update the lastUpdated field before saving
inventorySchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

// Check if product is in stock
inventorySchema.methods.isInStock = function () {
  return this.availableQuantity > 0;
};

// Check if product has enough quantity
inventorySchema.methods.hasEnoughQuantity = function (quantity) {
  return this.availableQuantity >= quantity;
};

// Reserve inventory
inventorySchema.methods.reserve = function (quantity) {
  if (!this.hasEnoughQuantity(quantity)) {
    return false;
  }

  this.availableQuantity -= quantity;
  this.reservedQuantity += quantity;
  return true;
};

// Release reserved inventory
inventorySchema.methods.release = function (quantity) {
  if (this.reservedQuantity < quantity) {
    return false;
  }

  this.reservedQuantity -= quantity;
  this.availableQuantity += quantity;
  return true;
};

// Update inventory quantity
inventorySchema.methods.updateQuantity = function (
  quantity,
  operation = "SET"
) {
  switch (operation.toUpperCase()) {
    case "SET":
      this.availableQuantity = Math.max(0, quantity);
      break;
    case "ADD":
      this.availableQuantity += quantity;
      break;
    case "SUBTRACT":
      this.availableQuantity = Math.max(0, this.availableQuantity - quantity);
      break;
    default:
      return false;
  }
  return true;
};

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
