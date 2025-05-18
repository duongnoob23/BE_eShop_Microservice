const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Find products by category
productSchema.statics.findByCategory = function (categoryId) {
  return this.find({ categoryId, status: "active" });
};

// Search products by name or description
productSchema.statics.search = function (query) {
  const searchRegex = new RegExp(query, "i");
  return this.find({
    $or: [{ name: searchRegex }, { description: searchRegex }],
    status: "active",
  });
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
