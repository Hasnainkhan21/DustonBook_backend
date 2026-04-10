const Book = require("../Models/bookModel");
const cloudinary = require("../Configurations/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Add a new book
// @route   POST /api/books/add
// @access  Private/Admin
exports.addBook = asyncHandler(async (req, res) => {
  const { title, author, price, stock, category, description } = req.body;
  const coverImage = req.file ? req.file.path : null;
  const publicId = req.file ? req.file.filename : null;

  if (!title || !author || !price || stock === undefined) {
    res.status(400);
    throw new Error("Title, author, price, and stock are required");
  }

  if (Number(price) < 0 || Number(stock) < 0) {
    res.status(400);
    throw new Error("Price and stock cannot be negative");
  }

  const book = await Book.create({
    title,
    author,
    price,
    stock,
    category,
    description,
    coverImage,
    publicId
  });

  res.status(201).json({ message: "Book added successfully", book });
});

// @desc    Get all books
// @route   GET /api/books/get
// @access  Public
exports.getBooks = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  let query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (category && category !== "all") {
    query.category = category;
  }

  const books = await Book.find(query).sort({ createdAt: -1 });
  res.json({ books });
});

// @desc    Get single book
// @route   GET /api/books/get/:id
// @access  Public
exports.getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }
  res.json(book);
});

// @desc    Update a book
// @route   PUT /api/books/update/:id
// @access  Private/Admin
exports.updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  if ((req.body.price && Number(req.body.price) < 0) || (req.body.stock && Number(req.body.stock) < 0)) {
    res.status(400);
    throw new Error("Price and stock cannot be negative");
  }

  // Handle image update
  if (req.file) {
    if (book.publicId) {
      await cloudinary.uploader.destroy(book.publicId);
    }
    req.body.coverImage = req.file.path;
    req.body.publicId = req.file.filename;
  }

  const updatedBook = await Book.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json(updatedBook);
});

// @desc    Delete a book
// @route   DELETE /api/books/delete/:id
// @access  Private/Admin
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  // Delete image from Cloudinary
  if (book.publicId) {
    await cloudinary.uploader.destroy(book.publicId);
  }

  await book.deleteOne();
  res.json({ message: "Book deleted successfully" });
});
