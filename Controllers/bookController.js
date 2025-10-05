const {
  addBook,
  getAllBooks,
  updateBook,
  deleteBook
} = require("../Services/bookService");

// ADD BOOK
const createBook = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const book = await addBook(data);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL BOOKS
const getBooks = async (req, res) => {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE BOOK
const editBook = async (req, res) => {
  try {
    const updated = await updateBook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE BOOK
const removeBook = async (req, res) => {
  try {
    const deleted = await deleteBook(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBook, getBooks, editBook, removeBook };
