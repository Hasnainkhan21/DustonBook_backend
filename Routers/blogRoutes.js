const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, likePost, deletePost, updatePost } = require("../Controllers/blogController");
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");
const authorize = require("../middlewares/authorize");


router.post("/add", protect, upload.single("image"), createPost); // later: add admin middleware
router.get("/all", getAllPosts);
router.put("/like/:id",likePost);
router.delete("/delete/:id", protect, deletePost);  //authorize("admin"),
router.put("/update/:id", protect, updatePost);

module.exports = router;
