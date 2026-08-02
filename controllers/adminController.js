const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// ===== Dashboard stats =====
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalVerified = await Property.countDocuments({ isVerified: true });
    const totalInquiries = await Inquiry.countDocuments();

    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'name email');

    res.json({ totalUsers, totalProperties, totalVerified, totalInquiries, recentProperties });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Get all users =====
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Update user role =====
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Delete user =====
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Property.updateMany({ postedBy: req.params.id }, { $unset: { postedBy: 1 } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Get all properties =====
exports.getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified, published } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';
    if (published !== undefined) filter.isPublished = published === 'true';

    const properties = await Property.find(filter)
      .populate('postedBy', 'name email')
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(filter);
    res.json({ properties, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Admin delete property =====
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted by admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Get inquiries =====
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('property')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
