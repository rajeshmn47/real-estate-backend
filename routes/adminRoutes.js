const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getInquiries,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.delete('/properties/:id', deleteProperty);
router.get('/inquiries', getInquiries);

module.exports = router;
