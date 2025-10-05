const Book = require("../Models/bookModel");

// CREATE
const addBook = async (data) => {
  const book = new Book(data);
  return await book.save();
};

// READ
const getAllBooks = async () => {
  return await Book.find().populate("createdBy", "name email");
};

// UPDATE
const updateBook = async (id, data) => {
  return await Book.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteBook = async (id) => {
  return await Book.findByIdAndDelete(id);
};

module.exports = { addBook, getAllBooks, updateBook, deleteBook };
