const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    agencyName: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      trim: true,
      unique: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalListings: {
      type: Number,
      default: 0,
      min: [0, 'Total listings cannot be negative'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

agentSchema.index({ rating: -1 });

module.exports = mongoose.model('Agent', agentSchema);
