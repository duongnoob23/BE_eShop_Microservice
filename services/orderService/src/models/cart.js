const mongoose = require("mongoose");

// CartItem Schema (embedded document)
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  productImage: {
    type: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cart Schema
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate total
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

module.exports = mongoose.model("Cart", cartSchema);
