const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// Calculate total amount before save
orderSchema.pre("save", async function (next) {
  await this.populate("items.book", "price");
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  next();
});

module.exports = mongoose.model("Order", orderSchema);
