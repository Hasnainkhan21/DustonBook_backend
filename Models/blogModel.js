const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, default: "Admin" }, 
    image: { type: String },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", type: Number, default: 0 }],
    publicId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogSchema);
