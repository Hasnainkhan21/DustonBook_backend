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

    // Total revenue
    const totalRevenueData = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.totalRevenue || 10;

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
      totalRevenue,
      topBooks,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

