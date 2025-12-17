const mongoose = require("mongoose");
const Cart = require("../Models/cartModel");
const Order = require("../Models/orderModel");
const Book = require('../Models/bookModel');

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingDetails } = req.body;

    if (!shippingDetails)
      return res.status(400).json({ message: "Shipping details are required" });

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.book")
      .session(session);

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // 🔴 STEP 1: STOCK VALIDATION
    for (const item of cart.items) {
      if (item.book.stock < item.quantity) {
        throw new Error(
          `${item.book.title} has only ${item.book.stock} left`
        );
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
    const order = await Order.create(
      [
        {
          user: req.user._id,
          shippingDetails,
          items: cart.items.map((i) => ({
            book: i.book._id,
            quantity: i.quantity,
          })),
          totalAmount: cart.items.reduce(
            (sum, item) => sum + item.book.price * item.quantity,
            0
          ),
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
    io.emit("newOrder", order[0]);

    res.status(201).json({
      message: "Order placed successfully",
      order: order[0],
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: err.message || "Order placement failed",
    });
  }
};



  // Get user orders
  const getUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate("items.book");
    res.json(orders);
  };

  // Admin: get all orders
  const getAllOrders = async (req, res) => {
    const orders = await Order.find().populate("user", "name email").populate("items.book");
    res.json(orders);
  };

  // Admin: update order status
  const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.book user");

    // 🔥 Emit event for real-time update
    io.emit("orderStatusUpdated", order);

    res.json(order);
  };


  //delete order
const deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate("items.book")
      .session(session);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const userRole = req.user.role;
    const userId = req.user._id.toString();

    // 🔐 Customer permission check
    if (userRole === "customer") {
      if (order.user.toString() !== userId)
        return res.status(403).json({ message: "Unauthorized" });

      const hoursDiff =
        (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60);

      if (hoursDiff > 24)
        return res.status(403).json({
          message: "You cannot delete this order after 24 hours",
        });
    }

    // 🔴 RESTORE STOCK (ONLY IF NOT DELIVERED)
    if (order.status !== "delivered") {
      for (const item of order.items) {
        await Book.updateOne(
          { _id: item.book._id },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    // 🔴 DELETE ORDER
    await Order.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      message:
        order.status === "delivered"
          ? "Order deleted (stock unchanged)"
          : "Order deleted and stock restored",
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};




  //delete all orders - for testing purposes
  const deleteAllOrders = async (req, res) => {
    try{
      await Order.deleteMany({});
      res.json({ message: "All orders deleted successfully" });
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }
  module.exports = { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder, deleteAllOrders };
