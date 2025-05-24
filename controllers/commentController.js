const Comment = require('../models/Comment');

// Add a comment (protected)
exports.addComment = async (req, res) => {
  try {
    // req.user should be set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { blogId, content } = req.body;
    if (!blogId || !content) {
      return res.status(400).json({ message: 'blogId and content are required' });
    }
    const comment = new Comment({
      blogId,
      content,
      author: req.user.id
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get comments by blog id (public)
exports.getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return res.status(400).json({ message: 'blogId is required' });
    }
    const comments = await Comment.find({ blogId }).populate('author', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
