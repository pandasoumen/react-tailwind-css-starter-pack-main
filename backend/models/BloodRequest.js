import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  donorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodDonor",
    required: true,
    index: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    index: true,
  },
  hospital: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  urgency: {
    type: Boolean,
    default: false,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
    index: true,
  },
  isSpam: {
    type: Boolean,
    default: false,
  },
  isFake: {
    type: Boolean,
    default: false,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  acceptedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

bloodRequestSchema.index({ requester: 1, createdAt: -1 });
bloodRequestSchema.index({ donor: 1, status: 1, createdAt: -1 });

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

export default BloodRequest;
