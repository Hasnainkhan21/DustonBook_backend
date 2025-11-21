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
      io.emit("newOrder", order); // Fixed: was savedOrder

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
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const userRole = req.user.role; 
    const userId = req.user._id.toString(); 

    if (userRole === "customer") {
      if (order.user.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized: Not your order" });
      }

      const hoursDiff = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        return res.status(403).json({
          message: "You cannot delete this order. 24 hours have passed.",
        });
      }
    }

    // Admin can delete anytime
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
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
