const Inventory = require("../models/inventory");

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory by productId
exports.getInventoryByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new inventory
exports.createInventory = async (req, res) => {
  try {
    const { productId, availableQuantity, reservedQuantity } = req.body;

    // Check if inventory already exists
    const existingInventory = await Inventory.findOne({ productId });
    if (existingInventory) {
      return res
        .status(400)
        .json({ message: "Inventory already exists for this product" });
    }

    const inventory = new Inventory({
      productId,
      availableQuantity: availableQuantity || 0,
      reservedQuantity: reservedQuantity || 0,
    });

    const savedInventory = await inventory.save();
    res.status(201).json(savedInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { availableQuantity, reservedQuantity, operation } = req.body;

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (availableQuantity !== undefined) {
      if (operation) {
        inventory.updateQuantity(availableQuantity, operation);
      } else {
        inventory.availableQuantity = Math.max(0, availableQuantity);
      }
    }

    if (reservedQuantity !== undefined) {
      inventory.reservedQuantity = Math.max(0, reservedQuantity);
    }

    const updatedInventory = await inventory.save();
    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reserve inventory
exports.reserveInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (!inventory.hasEnoughQuantity(quantity)) {
      return res
        .status(400)
        .json({ message: "Not enough inventory available" });
    }

    inventory.reserve(quantity);
    const updatedInventory = await inventory.save();

    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Release inventory
exports.releaseInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (inventory.reservedQuantity < quantity) {
      return res.status(400).json({ message: "Not enough reserved inventory" });
    }

    inventory.release(quantity);
    const updatedInventory = await inventory.save();

    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const inventory = await Inventory.findOneAndDelete({ productId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
