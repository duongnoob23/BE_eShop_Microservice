const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Inventory = require("../models/inventory");

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb";

// Sample inventory data
const inventoryData = [
  {
    productId: "68294558882ca08fabefadc6",
    availableQuantity: 65,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc7",
    availableQuantity: 30,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc8",
    availableQuantity: 50,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc9",
    availableQuantity: 25,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadca",
    availableQuantity: 40,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadcb",
    availableQuantity: 35,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadcc",
    availableQuantity: 45,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb8",
    availableQuantity: 150,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb9",
    availableQuantity: 200,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadba",
    availableQuantity: 120,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadbb",
    availableQuantity: 40,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadbc",
    availableQuantity: 80,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadbd",
    availableQuantity: 35,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadbe",
    availableQuantity: 100,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadbf",
    availableQuantity: 60,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc0",
    availableQuantity: 25,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc1",
    availableQuantity: 40,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc2",
    availableQuantity: 30,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc3",
    availableQuantity: 45,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc4",
    availableQuantity: 70,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadc5",
    availableQuantity: 55,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadae",
    availableQuantity: 20,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadaf",
    availableQuantity: 40,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb0",
    availableQuantity: 30,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb1",
    availableQuantity: 50,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb2",
    availableQuantity: 100,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb3",
    availableQuantity: 80,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb4",
    availableQuantity: 60,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb5",
    availableQuantity: 70,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb6",
    availableQuantity: 90,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadb7",
    availableQuantity: 75,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefada8",
    availableQuantity: 50,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefada9",
    availableQuantity: 45,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadaa",
    availableQuantity: 30,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadab",
    availableQuantity: 60,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadac",
    availableQuantity: 25,
    reservedQuantity: 0,
  },
  {
    productId: "68294558882ca08fabefadad",
    availableQuantity: 15,
    reservedQuantity: 0,
  },
];

// Hàm seed dữ liệu
const seedData = async () => {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Đã kết nối đến MongoDB");

    // Kiểm tra xem đã có dữ liệu chưa
    const inventoryCount = await Inventory.countDocuments();

    if (inventoryCount > 0) {
      console.log(`Cơ sở dữ liệu đã có ${inventoryCount} bản ghi inventory.`);
      console.log("Sử dụng flag --reset để xóa dữ liệu cũ trước khi thêm mới.");

      if (!process.argv.includes("--reset")) {
        await mongoose.connection.close();
        return;
      }

      // Xóa dữ liệu cũ nếu có flag --reset
      await Inventory.deleteMany({});
      console.log("Đã xóa dữ liệu cũ");
    }

    // Thêm dữ liệu mẫu
    const result = await Inventory.insertMany(inventoryData);
    console.log(`Đã thêm ${result.length} bản ghi inventory`);

    console.log("Quá trình thêm dữ liệu mẫu đã hoàn tất thành công");
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu mẫu:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Đã đóng kết nối MongoDB");
  }
};

// Chạy hàm seed
seedData();
