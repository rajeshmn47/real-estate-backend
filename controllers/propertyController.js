const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const City = require('../models/City');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveCityId = async (cityValue, stateValue = 'Unknown') => {
  if (!cityValue) return null;

  const cityString = String(cityValue).trim();
  if (!cityString) return null;

  if (mongoose.Types.ObjectId.isValid(cityString)) {
    return cityString;
  }

  let city = await City.findOne({ name: new RegExp(`^${escapeRegex(cityString)}$`, 'i') });
  if (!city) {
    city = await City.create({ name: cityString, state: stateValue || 'Unknown' });
  }

  return city._id;
};

// ===== CREATE property =====
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      area,
      bedrooms,
      bathrooms,
      propertyType,
      listingType,
      location,
      city,
      state,
      zipCode,
      coordinates,
      features,
      amenities,
    } = req.body;

    const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
    const cityId = await resolveCityId(city, state);

    const property = await Property.create({
      title,
      description,
      price,
      area,
      bedrooms,
      bathrooms,
      propertyType,
      listingType,
      location,
      city: cityId,
      state,
      zipCode,
      coordinates: coordinates ? JSON.parse(coordinates) : undefined,
      images,
      features: features ? features.split(',').map((item) => item.trim()) : [],
      amenities: amenities ? JSON.parse(amenities) : [],
      postedBy: req.user.id,
      isVerified: req.user.role === 'admin',
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ===== GET all properties =====
exports.getProperties = async (req, res) => {
  try {
    const {
      city,
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = { isPublished: true };
    if (city) {
      if (mongoose.Types.ObjectId.isValid(city)) {
        filter.city = city;
      } else {
        const cities = await City.find({ name: new RegExp(escapeRegex(String(city)), 'i') }).select('_id');
        filter.city = { $in: cities.map((item) => item._id) };
      }
    }
    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

    const properties = await Property.find(filter)
      .populate('postedBy', 'name email phone avatar')
      .sort(sort)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== GET single property =====
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('postedBy', 'name email phone avatar');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== UPDATE property =====
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updates.images = [...(property.images || []), ...newImages];
    }

    if (updates.coordinates && typeof updates.coordinates === 'string') {
      updates.coordinates = JSON.parse(updates.coordinates);
    }
    if (updates.features && typeof updates.features === 'string') {
      updates.features = updates.features.split(',').map((item) => item.trim());
    }
    if (updates.amenities && typeof updates.amenities === 'string') {
      updates.amenities = JSON.parse(updates.amenities);
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ===== DELETE property =====
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await property.remove();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== VERIFY property =====
exports.verifyProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });

    res.json({ message: 'Property verified', property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== TOGGLE FAVORITE =====
exports.toggleFavorite = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.favorites.indexOf(propertyId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      return res.json({ message: 'Removed from favorites', isFavorite: false });
    }

    user.favorites.push(propertyId);
    await user.save();
    res.json({ message: 'Added to favorites', isFavorite: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
