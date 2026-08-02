const express = require('express');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
  toggleFavorite,
} = require('../controllers/propertyController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', authenticate, upload.array('images', 5), createProperty);
router.get('/', getProperties);
router.get('/:id', getProperty);
router.put('/:id', authenticate, upload.array('images', 5), updateProperty);
router.delete('/:id', authenticate, deleteProperty);
router.patch('/:id/verify', authenticate, authorizeAdmin, verifyProperty);
router.post('/:id/favorite', authenticate, toggleFavorite);

module.exports = router;
