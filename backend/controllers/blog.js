import BlogPost from "../models/BlogPost.js";

// -------------------------------
// Get all blog posts (PUBLIC)
// -------------------------------
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.find().populate("author", "name role");
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// Get a single blog post (PUBLIC)
// -------------------------------
export const getBlogById = async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id).populate(
      "author",
      "name role"
    );

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// Create a blog post (DOCTOR ONLY)
// -------------------------------
export const createBlog = async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const newBlog = await BlogPost.create({
      title,
      content,
      image,
      author: req.user._id,
    });

    res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// Update blog post
// -------------------------------
export const updateBlog = async (req, res) => {
  try {
    const updated = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.json({ success: true, blog: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// Delete blog post
// -------------------------------
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
