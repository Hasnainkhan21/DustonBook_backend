const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // 🔹 Shipping Details Added
  shippingDetails: {
    fullName: { type: String, required: true, minlength: 3, maxlength: 100, trim: true },
    phone: { type: String, required: true, minlength: 10, maxlength: 15, trim: true, match: /^[0-9+]{10,15}$/ },
    address: { type: String, required: true, minlength: 5, maxlength: 200, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true, maxlength: 20},
    country: { type: String, required: true, trim: true }
  },

  // 🔹 Order Items
  items: [
    {
      book: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Book", 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      }
    }
  ],

  // 🔹 Automatically Calculated Total
  totalAmount: { 
    type: Number, 
    required: true 
  },

  // 🔹 Order Status
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending"
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 🔹 Auto Calculate total price before saving
orderSchema.pre("save", async function (next) {
  await this.populate("items.book", "price");

  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  next();
});

module.exports = mongoose.model("Order", orderSchema);
