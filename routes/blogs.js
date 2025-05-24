const express = require('express');
const { createBlog, getBlogs, incrementViews, deleteBlog } = require('../controllers/blogController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createBlog);           
router.get('/', getBlogs);                              
router.post('/view/:blogId', incrementViews);           
router.delete('/:blogId', authMiddleware, deleteBlog); 

module.exports = router;
