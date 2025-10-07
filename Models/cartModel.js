const mongoose = require("mongoose");
const Book = require("./bookModel");

const cartItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);


// Add item to cart
cartSchema.methods.addItem = async function (bookId, quantity) {
  const existingItem = this.items.find(
    (item) => item.book.toString() === bookId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ book: bookId, quantity });
  }

  await this.save();
  return this;
};

// Remove item from cart
cartSchema.methods.removeItem = async function (bookId) {
  this.items = this.items.filter(
    (item) => item.book.toString() !== bookId.toString()
  );
  await this.save();
  return this;
};

// Clear all items
cartSchema.methods.clearCart = async function () {
  this.items = [];
  await this.save();
};

module.exports = mongoose.model("Cart", cartSchema);
