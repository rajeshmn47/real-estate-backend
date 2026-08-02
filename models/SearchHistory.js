const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    query: {
      city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
      },
      locality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locality',
      },
      listingType: {
        type: String,
        trim: true,
      },
      minPrice: {
        type: Number,
        min: 0,
      },
      maxPrice: {
        type: Number,
        min: 0,
      },
      propertyType: {
        type: String,
        trim: true,
      },
      bedrooms: {
        type: Number,
        min: 0,
      },
      amenities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Amenity',
        },
      ],
      searchText: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
