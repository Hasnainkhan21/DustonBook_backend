const Order = require("../Models/orderModel");
const Cart = require("../Models/cartModel");

// Place order (convert cart → order)
const placeOrder = async (req, res) => {
  try {
    const { shippingDetails } = req.body;

    if (!shippingDetails)
      return res.status(400).json({ message: "Shipping details are required" });

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.user._id,
      shippingDetails,
      items: cart.items,
      totalAmount
    });

    await order.save();

    await Cart.deleteOne({ user: req.user._id });

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(order);
};

module.exports = { placeOrder, getUserOrders, getAllOrders, updateOrderStatus };
