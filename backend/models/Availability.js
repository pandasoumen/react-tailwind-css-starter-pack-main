const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: String,
  startTime: String,
  endTime: String,
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model('Availability', availabilitySchema);