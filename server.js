const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const cookieParser = require('cookie-parser');
const connectDB = require('./Configurations/db');
const cors = require('cors');
const morgan = require('morgan');

// Import Routes
const authRoutes = require('./Routers/authRoutes');
const bookRoutes = require("./Routers/bookRoutes");
const cartRoutes = require("./Routers/cartRoutes");
const orderRoutes = require("./Routers/orderRoutes");
const blogRoutes = require("./Routers/blogRoutes");
const analyticsRoutes = require("./Routers/analyticsRoutes");

connectDB();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/analytics", analyticsRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
