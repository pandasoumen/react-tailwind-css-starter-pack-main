// import mongoose from "mongoose";

// const doctorSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   specialization: String,
//   experience: Number,
//   fees: Number,
//   bio: String,
//   rating: { type: Number, default: 0 },
// });

// export default mongoose.model("Doctor", doctorSchema);

import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  specialty: { type: String, default: "" },
  experience: { type: Number, default: 0 },
  qualifications: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  region: { type: String, default: "" },
  sex: { type: String, default: "" },
  collegeUniversity: { type: String, default: "" },
  research: { type: String, default: "" },
  bio: { type: String, default: "" },
  phoneCountryCode: { type: String, default: "+91" },
  offlineChamberLocation: { type: String, default: "" },
  offlineChamberStart: { type: String, default: "" },
  offlineChamberEnd: { type: String, default: "" },
  nationality: { type: String, default: "" },
  countryCode: { type: String, default: "" },
  countryFlag: { type: String, default: "" },

  consultationFee: { type: Number, default: 0 },
  consultationCurrency: { type: String, default: "INR" },

  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  availability: [
    {
      day: String,
      startTime: String,
      endTime: String,
      slots: [String]
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

// module.exports = mongoose.model("Doctor", doctorSchema);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
