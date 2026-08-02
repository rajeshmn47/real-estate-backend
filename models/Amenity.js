const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Amenity name is required'],
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

amenitySchema.index({ name: 1 });

module.exports = mongoose.model('Amenity', amenitySchema);
