const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { welcomeEmail } = require('../tempelates/welcomeEmail');
const { sendEmail } = require('../Services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists"); 
  }

  const newUser = await User.create({ name, email, password });

  // send welcome email (non-blocking)
  try {
    await sendEmail({
      to: newUser.email,
      subject: 'Welcome to Dust on Book',
      html: welcomeEmail(newUser.name),
    });
  } catch (emailErr) {
    console.error('Welcome email error:', emailErr);
  }

  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is already populated by protect middleware
  res.status(200).json(req.user);
});

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.json({ message: 'Logged out successfully' });
};
