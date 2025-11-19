const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder, deleteAllOrders } = require("../Controllers/orderController");

const router = express.Router();

router.post("/place", protect, placeOrder);
router.get("/my", protect, getUserOrders);
router.get("/all", protect, getAllOrders);
router.put("/update/:id", protect, updateOrderStatus);
router.delete("/delete/:id", protect, deleteOrder);
router.delete('/deleteAll', deleteAllOrders);

module.exports = router;
