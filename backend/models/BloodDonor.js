
import mongoose from "mongoose";

const bloodDonorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    index: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  latitude: {
    type: Number,
    default: 0,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    default: 0,
    min: -180,
    max: 180,
  },
  lastDonatedAt: {
    type: Date,
    default: null,
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true,
  },
  totalDonations: {
    type: Number,
    default: 0,
    min: 0,
  },
  responseScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  acceptCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  requestCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bloodDonorSchema.pre("save", function preSave(next) {
  this.location = {
    type: "Point",
    coordinates: [Number(this.longitude || 0), Number(this.latitude || 0)],
  };
  next();
});

bloodDonorSchema.index({ location: "2dsphere" });
bloodDonorSchema.index({ bloodGroup: 1, city: 1, isAvailable: 1 });

const BloodDonor = mongoose.model("BloodDonor", bloodDonorSchema);

export default BloodDonor;
