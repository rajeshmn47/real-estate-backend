const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      unique: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('City', citySchema);
