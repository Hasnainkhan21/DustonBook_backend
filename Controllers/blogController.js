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
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Make sure blog.likes exists
    if (typeof blog.likes !== "number") blog.likes = 0;

    blog.likes += 1;

    await blog.save(); // this can throw if schema or DB has issues

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error in likePost:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
    try {

        let updateData = { ...req.body };

        // Convert tags string to array
        if (updateData.tags) {
            updateData.tags = updateData.tags.split(",").map(t => t.trim());
        }

        // If a new image is uploaded
        if (req.file) {
            updateData.image = req.file.filename;
        }

        // Remove empty/undefined fields
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === "" || updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

