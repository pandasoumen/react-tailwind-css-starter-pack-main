import mongoose from "mongoose";
//const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: String,
  category: String,
  tags: [String],
  readTime: String,
  published: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//module.exports = mongoose.model('BlogPost', blogPostSchema);
const BlogPost = mongoose.model("BlogPost", blogSchema);
export default BlogPost;
