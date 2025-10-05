const express = require("express");
const {
  createBook,
  getBooks,
  editBook,
  removeBook
} = require("../Controllers/bookController");
const  protect  = require("../middlewares/authMiddleware");
const router = express.Router();


router.post("/create",protect, createBook);     // Add book
router.get("/get", getBooks);                 // Get all books (public)
router.put("/edit/:id",editBook);     // Update book
router.delete("/remove/:id",removeBook); // Delete book

module.exports = router;
