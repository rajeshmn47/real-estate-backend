const express = require('express');
const { getUserById, getUserProperties, getFavorites } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', getUserById);
router.get('/:id/properties', getUserProperties);
router.get('/me/favorites', authenticate, getFavorites);

module.exports = router;
