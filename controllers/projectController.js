// controllers/projectController.js
const Project = require('../models/Project');

// ===== GET all projects (with search, city, pagination) =====
exports.getProjects = async (req, res) => {
  try {
    const { search, city, page = 1, limit = 20, sort = 'name' } = req.query;

    const filter = {};
    if (search && search.trim().length >= 2) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }
    if (city) {
      filter.cityName = { $regex: city.trim(), $options: 'i' };
    }

    const projects = await Project.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== SEARCH projects by name (used for autocomplete) =====
exports.searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const projects = await Project.find({
      name: { $regex: q.trim(), $options: 'i' },
    })
      .limit(10)
      .select('name cityName uuid');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET a single project by UUID or MongoDB _id =====
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { uuid: id };
    const project = await Project.findOne(query);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== CREATE a new project (optional – you may not need this if you use the scraper) =====
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ===== UPDATE a project =====
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { uuid: id };
    const project = await Project.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ===== DELETE a project =====
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { uuid: id };
    const project = await Project.findOneAndDelete(query);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};