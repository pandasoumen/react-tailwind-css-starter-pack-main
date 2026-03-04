import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient", "super-admin", "moderator", "support"],
      default: "patient",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    doctorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    doctorVerification: {
      licenseNumber: {
        type: String,
        default: "",
      },
      specialization: {
        type: String,
        default: "",
      },
      hospital: {
        type: String,
        default: "",
      },
      experienceYears: {
        type: Number,
        default: 0,
      },
      certificateFiles: {
        type: [String],
        default: [],
      },
    },
    doctorStats: {
      totalAppointments: {
        type: Number,
        default: 0,
      },
      completedAppointments: {
        type: Number,
        default: 0,
      },
      cancelledAppointments: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    doctorAI: {
      performanceScore: {
        type: Number,
        default: 0,
      },
      suspiciousFlag: {
        type: Boolean,
        default: false,
      },
      cancellationRate: {
        type: Number,
        default: 0,
      },
      negativeReviewRate: {
        type: Number,
        default: 0,
      },
    },
    suspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
      index: true,
    },
    lastLoginIp: {
      type: String,
      default: "",
    },
    registrationIp: {
      type: String,
      default: "",
    },
    suspiciousFlag: {
      type: Boolean,
      default: false,
      index: true,
    },
    profile: {
      age: Number,
      gender: String,
      phone: String,
      address: String,
      city: String,
      country: String,
      bloodGroup: String,
      healthGoal: String,
      medicalConditions: [String],
    },
    doctorProfile: {
      specialty: String,
      experience: Number,
      qualifications: [String],
      languages: [String],
      region: String,
      consultationFee: Number,
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" }],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ doctorStatus: 1, role: 1 });

userSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) return;
  if (/^\$2[aby]\$\d{2}\$/.test(this.password)) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function comparePassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
