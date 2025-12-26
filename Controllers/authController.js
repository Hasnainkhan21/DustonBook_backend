const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const { welcomeEmail } = require('../tempelates/welcomeEmail');
const { sendEmail } = require('../Services/emailService');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({ name, email, password, role: req.body.role });

    // send welcome email (log but don't block registration)
    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Welcome to Dust on Book',
        html: welcomeEmail(newUser.name),
      });
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr);
    }

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
  console.error("Register error:", error);
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val) => val.message);
    return res.status(400).json({ errors: messages });
  }
  res.status(500).json({ message: error.message });
}
}


// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please enter all fields" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    // ✅ RETURN USER WITH ROLE
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ INCLUDE ROLE
    const user = await User.findById(decoded.id)
      .select("name email role");

    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    res.json({ message: 'Logged out successfully' });
};
