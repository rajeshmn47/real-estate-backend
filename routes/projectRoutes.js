// routes/projectRoutes.js
const express = require('express');
const {
    getProjects,
    searchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/search', searchProjects);      // used for autocomplete
router.get('/:id', getProject);

// Protected / Admin routes (optional)
router.post('/', authenticate, authorizeAdmin, createProject);
router.put('/:id', authenticate, authorizeAdmin, updateProject);
router.delete('/:id', authenticate, authorizeAdmin, deleteProject);

module.exports = router;