const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const {getAnalytics} = require("../Controllers/analyticsController");

router.get("/", protect, getAnalytics);

module.exports = router;
