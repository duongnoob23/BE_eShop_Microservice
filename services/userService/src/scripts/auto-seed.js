const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Address = require("../models/address");
const logger = require("../utils/logger");

// Dữ liệu người dùng mẫu
const sampleUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "123456",
    firstName: "Admin",
    lastName: "User",
    phoneNumber: "0987654321",
    roles: ["admin", "user"],
    status: "ACTIVE",
  },
  {
    username: "nguyenvana",
    email: "nguyenvana@example.com",
    password: "123456",
    firstName: "Nguyễn",
    lastName: "Văn A",
    phoneNumber: "0901234567",
    roles: ["user"],
    status: "ACTIVE",
  },
  {
    username: "tranthib",
    email: "tranthib@example.com",
    password: "123456",
    firstName: "Trần",
    lastName: "Thị B",
    phoneNumber: "0912345678",
    roles: ["user"],
    status: "ACTIVE",
  },
];

// Dữ liệu địa chỉ mẫu
const sampleAddresses = [
  // Địa chỉ cho Admin
  {
    addressLine1: "123 Đường Lê Lợi, Phường Bến Nghé",
    city: "Hồ Chí Minh",
    state: "HCM",
    postalCode: "70000",
    country: "Việt Nam",
    phoneNumber: "0987654321",
    isDefault: true,
  },

  // Địa chỉ cho Nguyễn Văn A
  {
    addressLine1: "789 Đường Trần Hưng Đạo, Phường Cầu Kho",
    city: "Hồ Chí Minh",
    state: "HCM",
    postalCode: "70000",
    country: "Việt Nam",
    phoneNumber: "0901234567",
    isDefault: true,
  },

  // Địa chỉ cho Trần Thị B
  {
    addressLine1: "202 Đường Lý Tự Trọng, Phường Bến Thành",
    city: "Hồ Chí Minh",
    state: "HCM",
    postalCode: "70000",
    country: "Việt Nam",
    phoneNumber: "0912345678",
    isDefault: true,
  },
];

// Kiểm tra và tạo dữ liệu mẫu
const checkAndSeedData = async () => {
  try {
    // Kiểm tra xem đã có người dùng chưa
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      logger.info(
        `Cơ sở dữ liệu đã có ${userCount} người dùng. Bỏ qua quá trình tạo dữ liệu.`
      );
      return false;
    }

    logger.info(
      "Không tìm thấy dữ liệu người dùng. Bắt đầu tạo dữ liệu mẫu..."
    );

    // Mã hóa mật khẩu cho người dùng mẫu
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Thêm người dùng
    const insertedUsers = await User.insertMany(hashedUsers);
    logger.info(`Đã thêm ${insertedUsers.length} người dùng`);

    // Tạo map để lưu trữ người dùng theo username
    const userMap = {};
    insertedUsers.forEach((user) => {
      userMap[user.username] = user;
    });

    // Gán địa chỉ cho từng người dùng
    const addressPromises = [];

    // Địa chỉ cho Admin
    const adminAddress = {
      ...sampleAddresses[0],
      userId: userMap["admin"]._id,
    };
    addressPromises.push(Address.create(adminAddress));

    // Địa chỉ cho Nguyễn Văn A
    const nguyenVanAAddress = {
      ...sampleAddresses[1],
      userId: userMap["nguyenvana"]._id,
    };
    addressPromises.push(Address.create(nguyenVanAAddress));

    // Địa chỉ cho Trần Thị B
    const tranThiBAddress = {
      ...sampleAddresses[2],
      userId: userMap["tranthib"]._id,
    };
    addressPromises.push(Address.create(tranThiBAddress));

    // Thêm tất cả địa chỉ
    const addressResults = await Promise.all(addressPromises);
    logger.info(`Đã thêm ${addressResults.length} địa chỉ`);

    // Cập nhật người dùng với tham chiếu đến địa chỉ
    for (let i = 0; i < addressResults.length; i++) {
      const address = addressResults[i];
      const userId = address.userId;
      await User.findByIdAndUpdate(userId, {
        $push: { addresses: address._id },
      });
    }

    logger.info("Đã tạo dữ liệu mẫu thành công");
    return true;
  } catch (error) {
    logger.error("Lỗi trong quá trình tạo dữ liệu mẫu:", error);
    return false;
  }
};

// Hàm chạy seed
const runSeed = async () => {
  try {
    await checkAndSeedData();
    logger.info("Hoàn tất quá trình tạo dữ liệu mẫu");
  } catch (error) {
    logger.error("Lỗi:", error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  const mongoose = require("mongoose");
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/userdb";

  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      logger.info(`Đã kết nối đến MongoDB tại ${MONGO_URI}`);
      return runSeed();
    })
    .then(() => {
      mongoose.connection.close();
      logger.info("Đã đóng kết nối MongoDB");
    })
    .catch((err) => {
      logger.error("Lỗi:", err);
      mongoose.connection.close();
    });
}

module.exports = { checkAndSeedData };
