const BlogPost = require("../Models/blogModel");
const cloudinary = require("../Configurations/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a blog post
// @route   POST /api/blogs/add
// @access  Private/Admin
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, authorName, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  let imageUrl = null;
  let publicId = null;

  if (req.file) {
    imageUrl = req.file.path;
    publicId = req.file.filename;
  }

  const blog = await BlogPost.create({
    title,
    content,
    authorName: authorName || "Admin",
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    image: imageUrl,
    publicId,
  });

  res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
});

// @desc    Get all posts
// @route   GET /api/blogs/all
// @access  Public
exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  res.json(posts);
});

// @desc    Like a post
// @route   PUT /api/blogs/like/:id
// @access  Private
exports.likePost = asyncHandler(async (req, res) => {
  const blog = await BlogPost.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.likes = (blog.likes || 0) + 1;
  await blog.save();

  res.status(200).json(blog);
});

// @desc    Delete post by id
// @route   DELETE /api/blogs/delete/:id
// @access  Private/Admin
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Delete image from Cloudinary
  if (post.publicId) {
    await cloudinary.uploader.destroy(post.publicId);
  }

  await post.deleteOne();
  res.json({ message: "Post deleted successfully" });
});

// @desc    Update post by id
// @route   PUT /api/blogs/update/:id
// @access  Private/Admin
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  let updateData = { ...req.body };

  // Convert tags string to array
  if (updateData.tags && typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(",").map(t => t.trim());
  }

  // If a new image is uploaded
  if (req.file) {
    if (post.publicId) {
      await cloudinary.uploader.destroy(post.publicId);
    }
    updateData.image = req.file.path;
    updateData.publicId = req.file.filename;
  }

  // Remove empty/undefined fields
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === "" || updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const updatedPost = await BlogPost.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json(updatedPost);
});

