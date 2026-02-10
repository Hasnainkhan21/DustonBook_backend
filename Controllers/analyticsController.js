const User = require("../Models/userModel");
const Order = require("../Models/orderModel");
const Book = require("../Models/bookModel");
const BlogPost = require("../Models/blogModel");

exports.getAnalytics = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments({role: "customer"});
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments({ status: "pending" });
    const blogs = await BlogPost.countDocuments();

    // Admins: count and list (name and email)
    const admins = await User.find({ role: "admin" }).select("name email -_id").lean();
    const totalAdmins = admins.length;

    // (total revenue removed)

    // Most sold books (top 5)
    const topBooks = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.book",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $project: {
          _id: 0,
          title: "$bookDetails.title",
          totalSold: 1,
        },
      },
    ]);

    res.json({
      totalUsers,
      totalBooks,
      totalOrders,
      totalAdmins,
      admins,
      topBooks,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

