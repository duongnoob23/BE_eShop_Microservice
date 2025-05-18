const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
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
});

// Find active categories
categorySchema.statics.findActive = function () {
  return this.find({ status: "active" });
};

// Find subcategories
categorySchema.statics.findSubcategories = function (parentId) {
  return this.find({ parentId, status: "active" });
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
