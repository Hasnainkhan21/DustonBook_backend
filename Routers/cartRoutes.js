const express = require("express");
const router = express.Router();
const  protect  = require("../middlewares/authMiddleware");
const { getCart, addToCart, removeFromCart, clearCart, updateQuantity } = require("../Controllers/cartController");

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.delete("/remove/:bookId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);
router.put("/update/:bookId", protect, updateQuantity);

module.exports = router;
