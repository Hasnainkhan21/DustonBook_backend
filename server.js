const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const server = http.createServer(app);
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

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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

global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

const port = process.env.PORT;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
