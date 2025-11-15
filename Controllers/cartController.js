const Cart = require("../Models/cartModel");

// Get user's cart
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  res.json(cart);
};

// Add item to cart
const addToCart = async (req, res) => {
  const bookId = req.body.bookId;
  const quantity = Number(req.body.quantity) || 1; // DEFAULT HERE

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

//update cart item quantity
const updateQuantity = async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(i => i.book.toString() === req.params.bookId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = quantity;
  await cart.save();

  res.json({ message: "Quantity updated", cart });
};

module.exports = { getCart, addToCart, removeFromCart, clearCart, updateQuantity };
