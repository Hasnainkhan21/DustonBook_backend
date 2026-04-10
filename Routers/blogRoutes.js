const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, likePost, deletePost, updatePost } = require("../Controllers/blogController");
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");
const authorize = require("../middlewares/authorize");

router.get("/all", getAllPosts);
router.put("/like/:id", protect, likePost); // Users must be logged in to like

// Admin only routes
router.post("/add", protect, authorize("admin"), upload.single("image"), createPost);
router.put("/update/:id", protect, authorize("admin"), updatePost);
router.delete("/delete/:id", protect, authorize("admin"), deletePost);

module.exports = router;
