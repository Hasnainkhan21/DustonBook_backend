const mongoose = require("mongoose");
const Cart = require("../Models/cartModel");
const Order = require("../Models/orderModel");
const Book = require('../Models/bookModel');
const User = require("../Models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const { sendEmail } = require("../Services/emailService");
const { orderPlacedEmail } = require("../tempelates/orderPlaced");
const { orderStatusEmail } = require("../tempelates/orderStatus");

// @desc    Place a new order
// @route   POST /api/orders/place
// @access  Private
exports.placeOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingDetails } = req.body;

    if (!shippingDetails) {
      res.status(400);
      throw new Error("Shipping details are required");
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.book")
      .session(session);

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("Cart is empty");
    }

    // 🔴 STEP 1: STOCK VALIDATION
    for (const item of cart.items) {
      if (item.book.stock < item.quantity) {
        throw new Error(`${item.book.title} has only ${item.book.stock} left`);
      }
    }

    // 🔴 STEP 2: DECREASE STOCK
    for (const item of cart.items) {
      await Book.updateOne(
        { _id: item.book._id },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // 🔴 STEP 3: CREATE ORDER
    const orderItems = cart.items.map((i) => ({
      book: i.book._id,
      quantity: i.quantity,
    }));

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    const [order] = await Order.create(
      [
        {
          user: req.user._id,
          shippingDetails,
          items: orderItems,
          totalAmount,
        },
      ],
      { session }
    );

    // 🔴 STEP 4: CLEAR CART
    await Cart.deleteOne({ user: req.user._id }).session(session);

    // 🔴 STEP 5: COMMIT
    await session.commitTransaction();
    session.endSession();

    // 🔴 Real-time admin notification
    if (global.io) {
      global.io.emit("newOrder", order);
    }

    // 🔔 Notify (non-blocking)
    process.nextTick(async () => {
      try {
        const fullOrder = await Order.findById(order._id)
          .populate("items.book")
          .populate("user", "name email");

        const html = orderPlacedEmail(fullOrder);
        await sendEmail({ to: req.user.email, subject: `Order #${order._id.toString().slice(-6)} placed`, html });

        const admins = await User.find({ role: "admin" }).select("email");
        for (const admin of admins) {
          const adminHtml = `<h3>New Order Placed</h3><p>Order <b>#${order._id}</b> placed by <b>${req.user.email}</b>.</p>` + html;
          await sendEmail({ to: admin.email, subject: `New Order #${order._id.toString().slice(-6)}`, html: adminHtml });
        }
      } catch (err) {
        console.error("Order notification error:", err);
      }
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// @desc    Get user orders
// @route   GET /api/orders/my
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("items.book").sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Admin: get all orders
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.book")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Admin: update order status
// @route   PUT /api/orders/update/:id
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate("items.book user");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // 🔥 Emit event for real-time update
  if (global.io) {
    global.io.emit("orderStatusUpdated", order);
  }

  // 🔔 Notify customer about status change
  if (order.user?.email) {
    process.nextTick(async () => {
      try {
        const html = orderStatusEmail(order);
        await sendEmail({ to: order.user.email, subject: `Order status updated: ${status}`, html });
      } catch (err) {
        console.error("Status notification error:", err);
      }
    });
  }

  res.json(order);
});

// @desc    Delete order
// @route   DELETE /api/orders/delete/:id
// @access  Private
exports.deleteOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate("items.book")
      .session(session);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error("Not authorized to delete this order");
    }

    // Owner can only cancel within 24 hours if pending
    if (isOwner && !isAdmin) {
      const hoursDiff = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        res.status(403);
        throw new Error("Orders cannot be cancelled after 24 hours");
      }
      if (order.status !== "Pending") {
        res.status(400);
        throw new Error("Only pending orders can be cancelled");
      }
    }

    // RESTORE STOCK (ONLY IF NOT DELIVERED)
    if (order.status !== "delivered") {
      for (const item of order.items) {
        if (item.book) {
          await Book.updateOne(
            { _id: item.book._id },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Order deleted successfully" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});
