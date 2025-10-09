const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const connectDB = require('./Configurations/db');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./Routers/authRoutes');
const bookRoutes = require("./Routers/bookRoutes");
const cartRoutes = require("./Routers/cartRoutes");
const orderRoutes = require("./Routers/orderRoutes");
const blogRoutes = require("./Routers/blogRoutes");


connectDB();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
