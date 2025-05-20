const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Order Item Schema (embedded document)
const orderItemSchema = new mongoose.Schema({
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
});

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPING",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: [
        "CREDIT_CARD",
        "PAYPAL",
        "COD",
        "BANK_TRANSFER",
        "MOMO",
        "ZALOPAY",
      ],
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for order total with shipping
orderSchema.virtual("grandTotal").get(function () {
  return this.totalAmount + this.shippingFee;
});

// Method to calculate total amount
orderSchema.methods.calculateTotalAmount = function () {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  return this.totalAmount;
};

module.exports = mongoose.model("Order", orderSchema);
