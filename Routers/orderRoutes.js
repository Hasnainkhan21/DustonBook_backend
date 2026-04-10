const express = require("express");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder } = require("../Controllers/orderController");

const router = express.Router();

router.post("/place", protect, placeOrder);
router.get("/my", protect, getUserOrders);

// Admin only routes
router.get("/all", protect, authorize("admin"), getAllOrders);
router.put("/update/:id", protect, authorize("admin"), updateOrderStatus);
router.delete("/delete/:id", protect, deleteOrder); // Both owner and admin can delete (with restrictions in controller)

module.exports = router;
