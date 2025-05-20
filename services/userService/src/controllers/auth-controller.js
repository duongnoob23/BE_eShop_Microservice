const bcrypt = require("bcryptjs");
const User = require("../models/user-model");
const logger = require("../config/logger");
const { formatResponse } = require("../utils/response");

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            null,
            "User already exists with this email or username"
          )
        );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
    });

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    };

    logger.info(`New user registered: ${email}`);
    res
      .status(201)
      .json(formatResponse(true, userResponse, "User registered successfully"));
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json(formatResponse(false, null, "Invalid credentials"));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(formatResponse(false, null, "Invalid credentials"));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user info
    const userResponse = {
      userId: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    };

    logger.info(`User logged in: ${email}`);
    res
      .status(200)
      .json(formatResponse(true, userResponse, "Login successful"));
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};
