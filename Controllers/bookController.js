const Book = require("../Models/bookModel");
const cloudinary = require("../Configurations/cloudinary");

// Add a new book
const addBook = async (req, res) => {
  const { title, author, price, stock, category, description } = req.body;
  const coverImage = req.file ? req.file.path : null;
  const publicId = req.file ? req.file.filename : null;
  if (!title || !author || !price || !stock) {
    return res.status(400).json({ message: "Title, author, price, and stock are required" });
  }
  if (price < 0 || stock < 0) {
    return res.status(400).json({ message: "Price and stock cannot be negative" });
  }
  const book = new Book({ title, author, price, stock, category, description, coverImage, publicId });
  await book.save();
  res.status(201).json({ message: "Book added successfully", book });
};

// Get all books
const getBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};

// Get single book
const getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
};

// Update book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Validate price and stock
    if (req.body.price && req.body.price < 0 || req.body.stock && req.body.stock < 0) {
      return res.status(400).json({ message: "Price and stock cannot be negative" });
    }

    // Handle image update
    if (req.file) {
      if (book.publicId) {
        await cloudinary.uploader.destroy(book.publicId);
      }
      // Set new image info
      req.body.coverImage = req.file.path;
      req.body.publicId = req.file.filename;
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  // Delete image from Cloudinary
  if (book.publicId) {
    await cloudinary.uploader.destroy(book.publicId);
  }

  await book.deleteOne();
  res.json({ message: "Book deleted successfully" });
};

module.exports = { addBook, getBooks, getBookById, updateBook, deleteBook };
