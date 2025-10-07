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


connectDB();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use("/api/cart", cartRoutes);


const port = process.env.PORT;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
