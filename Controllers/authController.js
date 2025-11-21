const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");

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

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
    httpOnly: true,   
    secure: false,     
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

    res.status(200).json({ message: "Login successful"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name email');
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    res.json({ message: 'Logged out successfully' });
};
