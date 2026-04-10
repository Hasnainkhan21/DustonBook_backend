const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { addBook, getBooks, getBookById, updateBook, deleteBook } = require("../Controllers/bookController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");

router.get("/get", getBooks);
router.get("/get/:id", getBookById);

// Admin only routes
router.post("/add", protect, authorize("admin"), upload.single("coverImage"), addBook);
router.put("/update/:id", protect, authorize("admin"), upload.single("coverImage"), updateBook);
router.delete("/delete/:id", protect, authorize("admin"), deleteBook);

module.exports = router;
