const axios = require("axios");
const logger = require("../utils/logger");

// Mock user data for development
const mockUsers = {
  user123: {
    id: "user123",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    addresses: [
      {
        id: "address1",
        fullName: "Nguyễn Văn A",
        phone: "0901234567",
        street: "123 Đường Nguyễn Huệ",
        ward: "Phường Bến Nghé",
        district: "Quận 1",
        city: "TP.HCM",
        province: "HCM",
        zipCode: "70000",
        country: "Việt Nam",
        isDefault: true,
        fullAddress:
          "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM, HCM, 70000, Việt Nam",
      },
      {
        id: "address2",
        fullName: "Nguyễn Văn A",
        phone: "0901234567",
        street: "456 Đường Lê Lợi",
        ward: "Phường Bến Thành",
        district: "Quận 1",
        city: "TP.HCM",
        province: "HCM",
        zipCode: "70000",
        country: "Việt Nam",
        isDefault: false,
        fullAddress:
          "456 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM, HCM, 70000, Việt Nam",
      },
    ],
  },
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (userId) => {
  try {
    // Use mock data in development
    if (process.env.NODE_ENV === "development") {
      logger.info(`Using mock user data for ${userId}`);
      return mockUsers[userId] || null;
    }

    // In production, call user service API
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "http://localhost:8003";
    const response = await axios.get(`${userServiceUrl}/api/users/${userId}`);

    if (response.data && response.data.status === "success") {
      return response.data.data;
    }

    return null;
  } catch (error) {
    logger.error(`Error fetching user ${userId}:`, error.message);
    // Return mock data as fallback
    return mockUsers[userId] || null;
  }
};

/**
 * Get shipping address by ID
 * @param {string} userId - User ID
 * @param {string} addressId - Address ID (optional, if not provided returns default address)
 * @returns {Promise<Object>} - Address data
 */
const getShippingAddress = async (userId, addressId) => {
  try {
    // Get user data
    const user = await getUserById(userId);

    if (!user || !user.addresses || user.addresses.length === 0) {
      return null;
    }

    // If addressId is provided, find that specific address
    if (addressId) {
      return user.addresses.find((addr) => addr.id === addressId) || null;
    }

    // Otherwise, return default address
    return user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
  } catch (error) {
    logger.error(
      `Error fetching shipping address for user ${userId}:`,
      error.message
    );
    return null;
  }
};

module.exports = {
  getUserById,
  getShippingAddress,
};
