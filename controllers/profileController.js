const User = require('../models/User');

// Update Profile (authenticated user only)
exports.updateProfile = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { bio, avatar } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (bio) user.profile.bio = bio;
  if (avatar) user.profile.avatar = avatar;

  await user.save();
  res.status(200).json({ message: 'Profile updated successfully' });
};

// Get Profile (authenticated user only)
exports.getProfile = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.profile);
};
