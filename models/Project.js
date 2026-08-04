const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cityUuid: { type: String },
    name: { type: String, required: true },
    displayName: { type: String },
    cityName: { type: String },
    url: { type: String },
    service: { type: String, enum: ['buy', 'rent', 'commercial'] },
    type: { type: String, default: 'project' },
    subType: { type: String },
    bhkId: { type: Number, default: 0 },
    polygonUuids: [{ type: String }],
    // Additional fields (will be populated later if needed)
    floorCount: { type: Number, default: 0 },
    towerCount: { type: Number, default: 0 },
    unitsCount: { type: Number, default: 0 },
    reraNumber: { type: String, default: '' },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);