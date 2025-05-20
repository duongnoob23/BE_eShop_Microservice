const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Order = require("../models/order");
const logger = require("../utils/logger");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Sample cart items
const sampleCartItems = [
  {
    userId: "user123",
    items: [
      {
        productId: "product1",
        productName: "Áo thun nam",
        quantity: 2,
        price: 150000,
        productImage: "https://example.com/images/product1.jpg",
      },
      {
        productId: "product2",
        productName: "Quần jean nam",
        quantity: 1,
        price: 350000,
        productImage: "https://example.com/images/product2.jpg",
      },
    ],
    updatedAt: new Date(),
  },
  {
    userId: "user456",
    items: [
      {
        productId: "product3",
        productName: "Giày thể thao",
        quantity: 1,
        price: 850000,
        productImage: "https://example.com/images/product3.jpg",
      },
    ],
    updatedAt: new Date(),
  },
];

// Sample orders
const sampleOrders = [
  {
    userId: "user123",
    items: [
      {
        productId: "product3",
        productName: "Giày thể thao",
        quantity: 1,
        price: 850000,
        productImage: "https://example.com/images/product3.jpg",
      },
    ],
    totalAmount: 850000,
    status: "DELIVERED",
    paymentStatus: "COMPLETED",
    paymentMethod: "COD",
    shippingAddress: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    shippingFee: 0,
    orderDate: new Date("2023-10-01"),
  },
  {
    userId: "user123",
    items: [
      {
        productId: "product4",
        productName: "Áo khoác nam",
        quantity: 1,
        price: 450000,
        productImage: "https://example.com/images/product4.jpg",
      },
      {
        productId: "product5",
        productName: "Mũ lưỡi trai",
        quantity: 2,
        price: 120000,
        productImage: "https://example.com/images/product5.jpg",
      },
    ],
    totalAmount: 690000,
    status: "PROCESSING",
    paymentStatus: "COMPLETED",
    paymentMethod: "MOMO",
    shippingAddress: "456 Đường Lê Lợi, Quận 1, TP.HCM",
    shippingFee: 30000,
    orderDate: new Date("2023-10-15"),
  },
  {
    userId: "user123",
    items: [
      {
        productId: "product6",
        productName: "Đồng hồ nam",
        quantity: 1,
        price: 1250000,
        productImage: "https://example.com/images/product6.jpg",
      },
    ],
    totalAmount: 1250000,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "BANK_TRANSFER",
    shippingAddress: "789 Đường Hai Bà Trưng, Quận 3, TP.HCM",
    shippingFee: 0,
    orderDate: new Date("2023-10-20"),
  },
  {
    userId: "user456",
    items: [
      {
        productId: "product7",
        productName: "Laptop Dell XPS",
        quantity: 1,
        price: 25000000,
        productImage: "https://example.com/images/product7.jpg",
      },
    ],
    totalAmount: 25000000,
    status: "SHIPPING",
    paymentStatus: "COMPLETED",
    paymentMethod: "CREDIT_CARD",
    shippingAddress: "101 Đường Lê Duẩn, Quận 1, TP.HCM",
    shippingFee: 0,
    orderDate: new Date("2023-10-10"),
  },
  {
    userId: "user456",
    items: [
      {
        productId: "product8",
        productName: "Tai nghe không dây",
        quantity: 1,
        price: 3500000,
        productImage: "https://example.com/images/product8.jpg",
      },
      {
        productId: "product9",
        productName: "Chuột gaming",
        quantity: 1,
        price: 1200000,
        productImage: "https://example.com/images/product9.jpg",
      },
    ],
    totalAmount: 4700000,
    status: "DELIVERED",
    paymentStatus: "COMPLETED",
    paymentMethod: "MOMO",
    shippingAddress: "202 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    shippingFee: 30000,
    orderDate: new Date("2023-09-25"),
  },
];

/**
 * Seed data to database
 */
const seedData = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/orderdb";

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info("Connected to MongoDB for seeding");
    }

    // Check if reset flag is provided
    const shouldReset = process.argv.includes("--reset");

    // Check if data already exists
    const cartCount = await Cart.countDocuments();
    const orderCount = await Order.countDocuments();

    if ((cartCount > 0 || orderCount > 0) && !shouldReset) {
      logger.info(
        `Database already has ${cartCount} carts and ${orderCount} orders.`
      );
      logger.info("Use --reset flag to reset the database before seeding.");
      return;
    }

    // Clear existing data
    if (shouldReset || cartCount === 0 || orderCount === 0) {
      logger.info("Clearing existing data...");
      await Cart.deleteMany({});
      await Order.deleteMany({});
      logger.info("Cleared existing data");
    }

    // Insert cart items
    await Cart.insertMany(sampleCartItems);
    logger.info(`Inserted ${sampleCartItems.length} carts`);

    // Insert orders
    for (const orderData of sampleOrders) {
      const order = new Order(orderData);
      // Calculate total amount if not provided
      if (!orderData.totalAmount) {
        order.calculateTotalAmount();
      }
      await order.save();
    }
    logger.info(`Inserted ${sampleOrders.length} orders`);

    logger.info("Data seeding completed successfully");
  } catch (error) {
    logger.error("Error seeding data:", error);
    throw error;
  }
};

// If this script is run directly
if (require.main === module) {
  seedData()
    .then(() => {
      logger.info("Seeding completed, exiting...");
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Seeding failed:", error);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = { seedData };
