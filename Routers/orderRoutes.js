const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus } = require("../Controllers/orderController");

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/userOrder", protect, getUserOrders);
router.get("/all", protect, getAllOrders);
router.put("/:id", protect, updateOrderStatus);

module.exports = router;
