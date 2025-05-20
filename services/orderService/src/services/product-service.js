const axios = require("axios");
const logger = require("../utils/logger");

// Mock product data for development
const mockProducts = {
  product1: {
    id: "product1",
    name: "Áo thun nam",
    price: 150000,
    stockQuantity: 100,
    imageUrl: "https://example.com/images/product1.jpg",
  },
  product2: {
    id: "product2",
    name: "Quần jean nam",
    price: 350000,
    stockQuantity: 50,
    imageUrl: "https://example.com/images/product2.jpg",
  },
  product3: {
    id: "product3",
    name: "Giày thể thao",
    price: 850000,
    stockQuantity: 30,
    imageUrl: "https://example.com/images/product3.jpg",
  },
  product4: {
    id: "product4",
    name: "Áo khoác nam",
    price: 450000,
    stockQuantity: 40,
    imageUrl: "https://example.com/images/product4.jpg",
  },
  product5: {
    id: "product5",
    name: "Mũ lưỡi trai",
    price: 120000,
    stockQuantity: 80,
    imageUrl: "https://example.com/images/product5.jpg",
  },
  product6: {
    id: "product6",
    name: "Đồng hồ nam",
    price: 1250000,
    stockQuantity: 15,
    imageUrl: "https://example.com/images/product6.jpg",
  },
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
const getProductById = async (productId) => {
  try {
    // Use mock data in development
    if (process.env.NODE_ENV === "development") {
      logger.info(`Using mock product data for ${productId}`);
      return mockProducts[productId] || null;
    }

    // In production, call product service API
    const productServiceUrl =
      process.env.PRODUCT_SERVICE_URL || "http://localhost:8001";
    const response = await axios.get(
      `${productServiceUrl}/api/products/${productId}`
    );

    if (response.data && response.data.status === "success") {
      return response.data.data;
    }

    return null;
  } catch (error) {
    logger.error(`Error fetching product ${productId}:`, error.message);
    // Return mock data as fallback
    return mockProducts[productId] || null;
  }
};

module.exports = {
  getProductById,
};
