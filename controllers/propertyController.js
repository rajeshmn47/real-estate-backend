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

        // ✅ Handle features – array or string
        let featuresArray = [];
        if (features) {
            if (Array.isArray(features)) {
                featuresArray = features;
            } else if (typeof features === 'string') {
                featuresArray = features.split(',').map((item) => item.trim());
            }
        }

        // ✅ Handle amenities – array or string
        let amenitiesArray = [];
        if (amenities) {
            if (Array.isArray(amenities)) {
                amenitiesArray = amenities;
            } else if (typeof amenities === 'string') {
                try {
                    amenitiesArray = JSON.parse(amenities);
                } catch {
                    amenitiesArray = amenities.split(',').map((item) => item.trim());
                }
            }
        }

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
            features: featuresArray,
            amenities: amenitiesArray,
            postedBy: req.user.id,
            isVerified: req.user.role === 'admin',
        });

        res.status(201).json(property);
    } catch (error) {
        console.error('Create property error:', error);
        res.status(400).json({ error: error.message });
    }
};

// controllers/propertyController.js
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

    if (city && city.trim() !== '') {
      const searchTerm = city.trim();

      if (mongoose.Types.ObjectId.isValid(searchTerm)) {
        filter.city = searchTerm;
      } else {
        const matchingCities = await City.find({ name: new RegExp(escapeRegex(searchTerm), 'i') }).select('_id');
        const cityIds = matchingCities.map((item) => item._id);

        if (cityIds.length > 0) {
          filter.city = { $in: cityIds };
        } else {
          filter.$or = [
            { location: new RegExp(searchTerm, 'i') },
            { title: new RegExp(searchTerm, 'i') },
          ];
        }
      }
    }

    if (listingType) filter.listingType = listingType;

    // 🏠 Property type
    if (propertyType) filter.propertyType = propertyType;

    // 🛏️ Bedrooms
    if (bedrooms) filter.bedrooms = Number(bedrooms);

    // 💰 Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

    const properties = await Property.find(filter)
      .populate('postedBy', 'name email phone avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== SEARCH CITY AUTOCOMPLETE =====
exports.searchCities = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = String(search).trim();
    if (!query) {
      return res.json([]);
    }

    const regex = new RegExp(escapeRegex(query), 'i');
    const cities = await City.find({ name: regex }).limit(10).select('name state');
    res.json(cities);
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
