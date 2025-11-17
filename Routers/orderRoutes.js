const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus } = require("../Controllers/orderController");

const router = express.Router();

router.post("/place", protect, placeOrder);
router.get("/my", protect, getUserOrders);
router.get("/all", protect, getAllOrders);
router.put("/update/:id", protect, updateOrderStatus);

module.exports = router;
