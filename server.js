const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// JWT verification middleware
function verifyJWT(req, res, next) {
  if (
    req.path.startsWith('/auth') ||
    (req.path.startsWith('/comments') && req.method === 'GET')
  ) {
    // Public endpoints
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

// Proxy config
app.use(verifyJWT);

app.use('/auth', createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/auth': '' } }));
app.use('/blogs', createProxyMiddleware({ target: process.env.BLOG_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/blogs': '' } }));
app.use('/comments', createProxyMiddleware({ target: process.env.COMMENTS_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/comments': '' } }));
app.use('/profile', createProxyMiddleware({ target: process.env.PROFILE_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/profile': '' } }));

// Health and readiness endpoints
app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', (req, res) => res.status(200).json({ ready: true }));

app.listen(process.env.PORT || 3000, () => console.log('API Gateway running'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});