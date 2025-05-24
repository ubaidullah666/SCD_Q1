const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);

// Create Blog
exports.createBlog = async (req, res) => {
  const { title, content } = req.body;

  const blog = new Blog({ title, content, author: req.userId });
  await blog.save();

  const blogView = new View({ blogId: blog._id });
  await blogView.save();

  res.status(201).json({ message: 'Blog created successfully' });
};

// Get Blogs
exports.getBlogs = async (req, res) => {
  const blogs = await Blog.find().populate('author', 'username');
  res.json(blogs);
};

// Increment blog views
exports.incrementViews = async (req, res) => {
  const { blogId } = req.params;
  const view = await View.findOne({ blogId });

  if (view) {
    view.views++;
    await view.save();
  } else {
    const newView = new View({ blogId, views: 1 });
    await newView.save();
  }

  res.status(200).json({ message: 'View count incremented' });
};

// Delete Blog (only creator)
exports.deleteBlog = async (req, res) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  if (blog.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await Blog.deleteOne({ _id: blogId });
  res.json({ message: 'Blog deleted' });
};
