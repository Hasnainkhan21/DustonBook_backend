const Cart = require("../Models/cartModel");

// Get user's cart
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  res.json(cart);
};

// Add item to cart
const addToCart = async (req, res) => {
  const { bookId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  await cart.addItem(bookId, quantity);
  res.status(200).json({ message: "Item added to cart", cart });
};

// Remove item
const removeFromCart = async (req, res) => {
  const { bookId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  await cart.removeItem(bookId);
  res.json({ message: "Item removed", cart });
};

// Clear cart
const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  await cart.clearCart();
  res.json({ message: "Cart cleared" });
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
