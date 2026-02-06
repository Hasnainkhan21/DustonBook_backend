const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const {getAnalytics} = require("../Controllers/analyticsController");

router.get("/analytics", protect, getAnalytics);

module.exports = router;
