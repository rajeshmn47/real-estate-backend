// routes/localityRoutes.js
const express = require('express');
const { getLocalities } = require('../controllers/localityController');
const router = express.Router();

// GET /api/localities?search=...
router.get('/', getLocalities);

module.exports = router;