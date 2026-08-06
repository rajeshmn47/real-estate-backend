// controllers/localityController.js
const Property = require('../models/Property');

// ===== GET locality suggestions (autocomplete) =====
exports.getLocalities = async (req, res) => {
  try {
    const { search } = req.query;

    // Require at least 2 characters for autocomplete
    if (!search || search.trim().length < 2) {
      return res.json([]);
    }

    // Case‑insensitive regex search on the 'location' field
    const regex = new RegExp(search.trim(), 'i');
    const localities = await Property.distinct('location', {
      location: { $regex: regex },
    });

    // Return only the first 10 matches
    res.json(localities.slice(0, 10));
  } catch (err) {
    console.error('Locality autocomplete error:', err);
    res.status(500).json({ error: err.message });
  }
};