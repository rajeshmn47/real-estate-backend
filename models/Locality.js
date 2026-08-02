const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Locality name is required'],
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City reference is required'],
      index: true,
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0,
      },
      lng: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

localitySchema.index({ city: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Locality', localitySchema);
