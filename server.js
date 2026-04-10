const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./Configurations/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Import Routes
const authRoutes = require('./Routers/authRoutes');
const bookRoutes = require("./Routers/bookRoutes");
const cartRoutes = require("./Routers/cartRoutes");
const orderRoutes = require("./Routers/orderRoutes");
const blogRoutes = require("./Routers/blogRoutes");
const analyticsRoutes = require("./Routers/analyticsRoutes");

const app = express();
const server = http.createServer(app);

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const io = socketIO(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"],
    credentials: true
  }
});

global.io = io;

connectDB();

app.use(cors({ origin: frontendUrl, credentials: true }));
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

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

global.io = io;

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);
});

const port = process.env.PORT || 3006;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔗 Accepting requests from: ${frontendUrl}`);
});
