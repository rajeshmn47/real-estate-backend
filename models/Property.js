const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0, 'Area cannot be negative'],
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: [0, 'Bathrooms cannot be negative'],
    },

    // ✅ UPDATED – added new property types
    propertyType: {
      type: String,
      enum: [
        'Apartment',
        'Independent House',
        'Independent Floor',
        'Plot',
        'Studio',
        'Duplex',
        'Penthouse',
        'Villa',
        'PG',
        'Farm House',
        'Commercial',
      ],
      required: [true, 'Property type is required'],
    },

    // ✅ UPDATED – changed 'PG/Co-Living' → 'PG/Co-living' to match frontend
    listingType: {
      type: String,
      enum: ['Buy', 'Rent', 'Commercial', 'PG/Co-living', 'Plots'],
      required: [true, 'Listing type is required'],
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City is required'],
      index: true,
    },
    locality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    zipCode: {
      type: String,
      trim: true,
      default: '',
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
      },
    ],
    features: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posting user is required'],
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },

    // PG‑specific fields (already present)
    pgName: {
      type: String,
      default: '',
      trim: true,
    },
    totalBeds: {
      type: Number,
      default: 0,
      min: 0,
    },
    pgGender: {
      type: String,
      enum: ['Girls', 'Boys', 'Both', ''],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes – keep as they are
propertySchema.index({ city: 1, listingType: 1, price: 1 });
propertySchema.index({ coordinates: '2dsphere' });
propertySchema.index({ title: 'text', description: 'text', location: 'text' });

propertySchema.virtual('pricePerSqFt').get(function () {
  if (!this.price || !this.area) {
    return null;
  }
  return Number((this.price / this.area).toFixed(2));
});

module.exports = mongoose.model('Property', propertySchema);