import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  time: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
    index: true,
  },
  notes: String,
  paymentMethod: {
    type: String,
    default: "",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
    index: true,
  },
  paymentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  invoiceNumber: {
    type: String,
    default: "",
  },
  invoiceDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isFraudulent: {
    type: Boolean,
    default: false,
    index: true,
  },
  cancelledBy: {
    type: String,
    enum: ["admin", "patient", "doctor", "system", ""],
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

appointmentSchema.index({ doctorId: 1, createdAt: -1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
