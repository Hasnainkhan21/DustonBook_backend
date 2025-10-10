const BlogPost = require("../Models/blogModel");
const cloudinary = require("../Configurations/cloudinary");


exports.createPost= async (req, res) => {
  try {
    const { title, content, authorName, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let imageUrl = null;
    let publicId = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blog_images",
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    // Create new blog post
    const blog = await BlogPost.create({
      title,
      content,
      authorName,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      image: imageUrl,
      publicId,
    });

    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a post
exports.likePost= async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete post by id
exports.deletePost = async (req, res) => {
    try{
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if(!post) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post deleted successfully" });
    }catch(error){
        res.status(500).json({ message: error.message });
    }  
}

//update post by id
exports.updatePost = async (req, res) => {
    try{
        const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}
