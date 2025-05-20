const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AppError = require("../utils/app-error");
const logger = require("../utils/logger");

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// Middleware bảo vệ route - yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
  try {
    // 1) Lấy token từ header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.", 401)
      );
    }

    // 2) Xác thực token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // 3) Kiểm tra xem người dùng còn tồn tại không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("Người dùng sở hữu token này không còn tồn tại.", 401)
      );
    }

    // 4) Kiểm tra trạng thái người dùng
    if (currentUser.status !== "ACTIVE") {
      return next(
        new AppError(
          "Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ admin.",
          401
        )
      );
    }

    // Lưu thông tin người dùng vào request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(
        new AppError("Token không hợp lệ. Vui lòng đăng nhập lại.", 401)
      );
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Token đã hết hạn. Vui lòng đăng nhập lại.", 401)
      );
    }
    next(error);
  }
};

// Middleware giới hạn quyền truy cập
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles là mảng: ['admin', 'seller']
    if (!req.user) {
      return next(
        new AppError("Bạn cần đăng nhập trước khi thực hiện hành động này", 401)
      );
    }

    if (!req.user.roles.some((role) => roles.includes(role))) {
      return next(
        new AppError("Bạn không có quyền thực hiện hành động này", 403)
      );
    }

    next();
  };
};

// Đăng ký người dùng mới
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber } =
      req.body;

    // Kiểm tra người dùng đã tồn tại
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(
        new AppError(
          "Người dùng với email hoặc tên đăng nhập này đã tồn tại",
          400
        )
      );
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      roles: ["user"],
      status: "ACTIVE",
    });

    // Tạo token
    const token = generateToken(newUser._id);

    // Loại bỏ mật khẩu khỏi phản hồi
    newUser.password = undefined;

    res.status(201).json({
      status: "success",
      token,
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra username và password có được cung cấp không
    if (!username || !password) {
      return next(
        new AppError("Vui lòng cung cấp tên đăng nhập và mật khẩu", 400)
      );
    }

    // Tìm người dùng theo username hoặc email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");

    if (!user) {
      return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng", 401));
    }

    // Kiểm tra mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng", 401));
    }

    // Tạo token
    const token = generateToken(user._id);

    // Loại bỏ mật khẩu khỏi phản hồi
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
