const User = require('../models/User');
const Property = require('../models/Property');

// ===== Get user by ID =====
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone avatar role createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Get user's properties =====
exports.getUserProperties = async (req, res) => {
  try {
    const properties = await Property.find({ postedBy: req.params.id })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Get logged-in user's favorites =====
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: { path: 'postedBy', select: 'name email' },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
