const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, likePost, deletePost, updatePost } = require("../Controllers/blogController");
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");
const authorize = require("../middlewares/authorize");


router.post("/add", protect, upload.single("image"), createPost); // later: add admin middleware
router.get("/all", getAllPosts);
router.put("/like/:id", protect, likePost);
router.delete("/:id", protect,authorize("admin"), deletePost);
router.put("/:id", protect, updatePost);

module.exports = router;
