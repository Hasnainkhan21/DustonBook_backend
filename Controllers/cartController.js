const Cart = require("../Models/cartModel");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;

  if (!bookId) {
    res.status(400);
    throw new Error("Book ID is required");
  }

  const qty = Number(quantity) || 1;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  await cart.addItem(bookId, qty);

  res.status(200).json({ message: "Item added to cart", cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:bookId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  await cart.removeItem(bookId);
  res.json({ message: "Item removed", cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  await cart.clearCart();
  res.json({ message: "Cart cleared" });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:bookId
// @access  Private
exports.updateQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { bookId } = req.params;

  if (quantity === undefined || Number(quantity) < 1) {
    res.status(400);
    throw new Error("Valid quantity is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find(i => i.book.toString() === bookId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  item.quantity = Number(quantity);
  await cart.save();

  res.json({ message: "Quantity updated", cart });
});
