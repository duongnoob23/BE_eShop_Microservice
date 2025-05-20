require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user-model");
const { connectDB } = require("../config/db");

// Sample users data
const users = [
  {
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    fullName: "John Doe",
    phoneNumber: "1234567890",
    addresses: [
      {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true,
      },
    ],
  },
  {
    username: "janedoe",
    email: "jane@example.com",
    password: "password123",
    fullName: "Jane Doe",
    phoneNumber: "0987654321",
    addresses: [
      {
        street: "456 Park Ave",
        city: "Boston",
        state: "MA",
        zipCode: "02108",
        country: "USA",
        isDefault: true,
      },
    ],
  },
];

// Seed function
const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log("Deleted existing users");

    // Hash passwords and create users
    const createdUsers = [];

    for (const user of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Create user with hashed password
      const newUser = new User({
        ...user,
        password: hashedPassword,
      });

      await newUser.save();
      createdUsers.push(newUser);
    }

    console.log(`Created ${createdUsers.length} users`);
    console.log("Sample user credentials:");
    console.log(`Email: ${users[0].email}, Password: ${users[0].password}`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

// Run seed function
seedUsers();
