import mongoose from "mongoose";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Product from "../models/Product.js";
import BloodDonor from "../models/BloodDonor.js";
import BloodRequest from "../models/BloodRequest.js";
import Review from "../models/Review.js";
import AdminLog from "../models/AdminLog.js";
import Doctor from "../models/Doctor.js";
import { analyzeDoctorBehavior } from "../services/doctorAI.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const logAdminAction = async ({ req, action, targetId, targetType }) => {
  if (!req?.user?._id || !targetId) return;

  await AdminLog.create({
    adminId: req.user._id,
    action,
    targetId,
    targetType,
    ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
    timestamp: new Date(),
  });
};

const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (String(value).toLowerCase() === "true") return true;
  if (String(value).toLowerCase() === "false") return false;
  return undefined;
};

const getDoctorRiskLevel = (aiResult) => {
  if (!aiResult) return "LOW";
  if (aiResult.suspiciousFlag && aiResult.performanceScore < 40) return "HIGH";
  if (aiResult.suspiciousFlag || aiResult.performanceScore < 60) return "MEDIUM";
  return "LOW";
};

const detectSuspiciousPatientActivity = async (patient) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [bloodRequestsInHour, cancelledAppointmentsToday, failedPayments] = await Promise.all([
    BloodRequest.countDocuments({
      requester: patient._id,
      createdAt: { $gte: oneHourAgo },
      isActive: true,
    }),
    Appointment.countDocuments({
      patientId: patient._id,
      status: "cancelled",
      createdAt: { $gte: oneDayAgo },
    }),
    Appointment.countDocuments({
      patientId: patient._id,
      paymentStatus: "failed",
    }),
  ]);

  const multipleIpsRapidly =
    Boolean(patient.registrationIp) &&
    Boolean(patient.lastLoginIp) &&
    patient.registrationIp !== patient.lastLoginIp &&
    Boolean(patient.lastLogin) &&
    new Date(patient.lastLogin).getTime() >= oneDayAgo.getTime();

  const suspicious =
    bloodRequestsInHour > 5 ||
    cancelledAppointmentsToday > 3 ||
    failedPayments > 3 ||
    multipleIpsRapidly;

  return {
    suspicious,
    bloodRequestsInHour,
    cancelledAppointmentsToday,
    failedPayments,
    multipleIpsRapidly,
  };
};

/* =====================================================
   A. USER MANAGEMENT
===================================================== */

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const isActive = parseBoolean(req.query.isActive);

    const query = {};
    if (role) query.role = role;
    if (typeof isActive === "boolean") query.isActive = isActive;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (["admin", "super-admin"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Cannot block admin account" });
    }

    user.isActive = false;
    await user.save();

    await logAdminAction({
      req,
      action: "block_user",
      targetId: user._id,
      targetType: "user",
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserSoft = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User soft deleted successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   PATIENT MANAGEMENT
===================================================== */

export const getAllPatients = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const query = { role: "patient" };
    const isActive = parseBoolean(req.query.isActive);

    if (req.query.city) query["profile.city"] = { $regex: String(req.query.city), $options: "i" };
    if (req.query.email) query.email = { $regex: String(req.query.email), $options: "i" };
    if (typeof isActive === "boolean") query.isActive = isActive;

    if (req.query.search) {
      const search = String(req.query.search).trim();
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [patients, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    const patientIds = patients.map((patient) => patient._id);
    const appointmentCounts = patientIds.length
      ? await Appointment.aggregate([
          { $match: { patientId: { $in: patientIds } } },
          { $group: { _id: "$patientId", totalAppointments: { $sum: 1 } } },
        ])
      : [];

    const appointmentMap = new Map(
      appointmentCounts.map((item) => [String(item._id), item.totalAppointments])
    );

    const rows = await Promise.all(
      patients.map(async (patient) => {
        const suspiciousData = await detectSuspiciousPatientActivity(patient);

        if (patient.suspiciousFlag !== suspiciousData.suspicious) {
          patient.suspiciousFlag = suspiciousData.suspicious;
          await patient.save();
        }

        return {
          ...patient.toObject(),
          totalAppointments: appointmentMap.get(String(patient._id)) || 0,
          suspiciousFlag: suspiciousData.suspicious,
        };
      })
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: rows.length,
      patients: rows,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid patient id" });
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" }).select("-password");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const [appointments, bloodRequests, paymentHistory, activityLogs, suspiciousData] = await Promise.all([
      Appointment.find({ patientId })
        .populate("doctorId", "name email")
        .sort({ createdAt: -1 }),
      BloodRequest.find({ requester: patientId })
        .populate("donor", "name email")
        .sort({ createdAt: -1 }),
      Appointment.find({ patientId, paymentAmount: { $gt: 0 } })
        .select("invoiceNumber paymentAmount paymentStatus paymentMethod createdAt")
        .sort({ createdAt: -1 }),
      AdminLog.find({ targetId: patientId, targetType: { $in: ["patient", "user"] } })
        .populate("adminId", "name email")
        .sort({ timestamp: -1 }),
      detectSuspiciousPatientActivity(patient),
    ]);

    if (patient.suspiciousFlag !== suspiciousData.suspicious) {
      patient.suspiciousFlag = suspiciousData.suspicious;
      await patient.save();
    }

    return res.status(200).json({
      success: true,
      patient,
      suspiciousFlag: suspiciousData.suspicious,
      appointmentHistory: appointments,
      bloodRequestHistory: bloodRequests,
      paymentHistory,
      activityLogs: activityLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePatientStatus = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid patient id" });
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    patient.isActive = !patient.isActive;
    await patient.save();

    await logAdminAction({
      req,
      action: patient.isActive ? "unblock_patient" : "block_patient",
      targetId: patient._id,
      targetType: "patient",
    });

    return res.status(200).json({
      success: true,
      message: patient.isActive ? "Patient unblocked successfully" : "Patient blocked successfully",
      patient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientStats = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid patient id" });
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" }).select("-password");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const [totalAppointments, completedAppointments, cancelledAppointments, totalBloodRequests, suspiciousData] =
      await Promise.all([
        Appointment.countDocuments({ patientId }),
        Appointment.countDocuments({ patientId, status: "completed" }),
        Appointment.countDocuments({ patientId, status: "cancelled" }),
        BloodRequest.countDocuments({ requester: patientId }),
        detectSuspiciousPatientActivity(patient),
      ]);

    if (patient.suspiciousFlag !== suspiciousData.suspicious) {
      patient.suspiciousFlag = suspiciousData.suspicious;
      await patient.save();
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalBloodRequests,
        lastLogin: patient.lastLogin || null,
        suspiciousFlag: suspiciousData.suspicious,
        suspiciousSignals: {
          bloodRequestsInHour: suspiciousData.bloodRequestsInHour,
          cancelledAppointmentsToday: suspiciousData.cancelledAppointmentsToday,
          failedPayments: suspiciousData.failedPayments,
          multipleIpsRapidly: suspiciousData.multipleIpsRapidly,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   B. DOCTOR APPROVAL SYSTEM
===================================================== */

export const getAllDoctors = async (req, res) => {
  try {
    const query = { role: "doctor" };
    const doctorStatus = req.query.doctorStatus;
    const suspended = parseBoolean(req.query.suspended);
    const search = String(req.query.search || "").trim();

    if (doctorStatus) query.doctorStatus = doctorStatus;
    if (typeof suspended === "boolean") query.suspended = suspended;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "doctorVerification.specialization": { $regex: search, $options: "i" } },
      ];
    }

    const doctors = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const rows = await Promise.all(
      doctors.map(async (doctor) => {
        const aiResult = await analyzeDoctorBehavior(doctor);

        doctor.doctorStats = {
          totalAppointments: aiResult.totalAppointments,
          completedAppointments: aiResult.completedAppointments,
          cancelledAppointments: aiResult.cancelledAppointments,
          rating: aiResult.rating,
          totalReviews: aiResult.totalReviews,
        };
        doctor.doctorAI = {
          performanceScore: aiResult.performanceScore,
          suspiciousFlag: aiResult.suspiciousFlag,
          cancellationRate: aiResult.cancellationRate,
          negativeReviewRate: aiResult.negativeReviewRate,
        };
        await doctor.save();

        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization:
            doctor.doctorVerification?.specialization || doctor.doctorProfile?.specialty || "",
          hospital: doctor.doctorVerification?.hospital || "",
          rating: doctor.doctorStats?.rating || doctor.doctorProfile?.rating || 0,
          doctorStatus: doctor.doctorStatus,
          experienceYears:
            doctor.doctorVerification?.experienceYears || doctor.doctorProfile?.experience || 0,
          suspended: Boolean(doctor.suspended),
          doctorAI: doctor.doctorAI,
          riskLevel: getDoctorRiskLevel(aiResult),
        };
      })
    );

    return res.status(200).json({ success: true, count: rows.length, doctors: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
      doctorStatus: "pending",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.doctorStatus = "approved";
    doctor.isActive = true;
    doctor.suspended = false;
    await doctor.save();

    await logAdminAction({
      req,
      action: "approve_doctor",
      targetId: doctor._id,
      targetType: "doctor",
    });

    return res.status(200).json({ success: true, message: "Doctor approved", doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.doctorStatus = "rejected";
    doctor.suspended = true;
    await doctor.save();

    return res.status(200).json({ success: true, message: "Doctor rejected", doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.suspended = true;
    await doctor.save();

    await logAdminAction({
      req,
      action: "suspend_doctor",
      targetId: doctor._id,
      targetType: "doctor",
    });

    return res.status(200).json({ success: true, message: "Doctor suspended", doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const activateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.suspended = false;
    if (doctor.doctorStatus === "rejected") doctor.doctorStatus = "approved";
    await doctor.save();

    await logAdminAction({
      req,
      action: "activate_doctor",
      targetId: doctor._id,
      targetType: "doctor",
    });

    return res.status(200).json({ success: true, message: "Doctor activated", doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }

    const doctorUser = await User.findOne({ _id: doctorId, role: "doctor" }).select("-password");
    if (!doctorUser) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const [doctorProfile, appointments, reviews, aiResult] = await Promise.all([
      Doctor.findOne({ user: doctorId }),
      Appointment.find({ doctorId })
        .populate("patientId", "name email")
        .sort({ createdAt: -1 }),
      Review.find({ doctor: doctorId, isActive: true })
        .populate("user", "name email")
        .sort({ createdAt: -1 }),
      analyzeDoctorBehavior(doctorUser),
    ]);

    doctorUser.doctorStats = {
      totalAppointments: aiResult.totalAppointments,
      completedAppointments: aiResult.completedAppointments,
      cancelledAppointments: aiResult.cancelledAppointments,
      rating: aiResult.rating,
      totalReviews: aiResult.totalReviews,
    };
    doctorUser.doctorAI = {
      performanceScore: aiResult.performanceScore,
      suspiciousFlag: aiResult.suspiciousFlag,
      cancellationRate: aiResult.cancellationRate,
      negativeReviewRate: aiResult.negativeReviewRate,
    };
    await doctorUser.save();

    const revenueGenerated = appointments.reduce(
      (sum, appointment) =>
        appointment.paymentStatus === "paid" ? sum + Number(appointment.paymentAmount || 0) : sum,
      0
    );

    return res.status(200).json({
      success: true,
      doctor: doctorUser,
      doctorProfile,
      certificates: doctorUser.doctorVerification?.certificateFiles || [],
      availability: doctorProfile?.availability || [],
      analytics: {
        totalAppointments: aiResult.totalAppointments,
        completionRate:
          aiResult.totalAppointments > 0
            ? Number(((aiResult.completedAppointments / aiResult.totalAppointments) * 100).toFixed(2))
            : 0,
        averageRating: aiResult.rating,
        revenueGenerated,
      },
      aiMonitoring: {
        performanceScore: aiResult.performanceScore,
        suspiciousFlag: aiResult.suspiciousFlag,
        recommendation: aiResult.recommendation,
        warnings: aiResult.warnings,
        riskLevel: getDoctorRiskLevel(aiResult),
      },
      appointmentHistory: appointments,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.params.id;
    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const [aiResult, revenueAgg] = await Promise.all([
      analyzeDoctorBehavior(doctor),
      Appointment.aggregate([
        { $match: { doctorId: doctor._id, paymentStatus: "paid" } },
        { $group: { _id: null, revenueGenerated: { $sum: "$paymentAmount" } } },
      ]),
    ]);

    doctor.doctorStats = {
      totalAppointments: aiResult.totalAppointments,
      completedAppointments: aiResult.completedAppointments,
      cancelledAppointments: aiResult.cancelledAppointments,
      rating: aiResult.rating,
      totalReviews: aiResult.totalReviews,
    };
    doctor.doctorAI = {
      performanceScore: aiResult.performanceScore,
      suspiciousFlag: aiResult.suspiciousFlag,
      cancellationRate: aiResult.cancellationRate,
      negativeReviewRate: aiResult.negativeReviewRate,
    };
    await doctor.save();

    const revenueGenerated = revenueAgg?.[0]?.revenueGenerated || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments: aiResult.totalAppointments,
        completedAppointments: aiResult.completedAppointments,
        cancelledAppointments: aiResult.cancelledAppointments,
        rating: aiResult.rating,
        revenueGenerated,
        performanceScore: aiResult.performanceScore,
        suspiciousFlag: aiResult.suspiciousFlag,
        riskLevel: getDoctorRiskLevel(aiResult),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   C. BLOOD DONOR MANAGEMENT
===================================================== */

export const getAllDonors = async (req, res) => {
  try {
    const isActive = parseBoolean(req.query.isActive);
    const query = {};

    if (typeof isActive === "boolean") query.isActive = isActive;
    if (req.query.city) query.city = req.query.city;
    if (req.query.bloodGroup) query.bloodGroup = req.query.bloodGroup;

    const donors = await BloodDonor.find(query)
      .populate("user", "name email role isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: donors.length, donors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const blockDonor = async (req, res) => {
  try {
    const donorId = req.params.id;

    if (!isValidObjectId(donorId)) {
      return res.status(400).json({ success: false, message: "Invalid donor id" });
    }

    const donor = await BloodDonor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    donor.isActive = false;
    donor.isAvailable = false;
    await donor.save();

    return res.status(200).json({ success: true, message: "Donor blocked", donor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const viewDonationHistory = async (req, res) => {
  try {
    const donorId = req.params.id;

    if (!isValidObjectId(donorId)) {
      return res.status(400).json({ success: false, message: "Invalid donor id" });
    }

    const donor = await BloodDonor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    const history = await BloodRequest.find({
      donor: donor.user,
      status: "completed",
    })
      .populate("requester", "name email")
      .populate("donor", "name email")
      .sort({ completedAt: -1, createdAt: -1 });

    return res.status(200).json({ success: true, donorId, count: history.length, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDonor = async (req, res) => {
  try {
    const donorId = req.params.id;

    if (!isValidObjectId(donorId)) {
      return res.status(400).json({ success: false, message: "Invalid donor id" });
    }

    const donor = await BloodDonor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    donor.isActive = false;
    donor.isAvailable = false;
    await donor.save();

    await logAdminAction({
      req,
      action: "delete_donor",
      targetId: donor._id,
      targetType: "blood-donor",
    });

    return res.status(200).json({ success: true, message: "Donor soft deleted", donor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   D. BLOOD REQUEST MONITORING
===================================================== */

export const getAllBloodRequests = async (req, res) => {
  try {
    const query = {};
    const isActive = parseBoolean(req.query.isActive);
    if (typeof isActive === "boolean") query.isActive = isActive;
    if (req.query.status) query.status = req.query.status;

    const requests = await BloodRequest.find(query)
      .populate("requester", "name email")
      .populate("donor", "name email")
      .sort({ urgency: -1, createdAt: -1 });

    return res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const filterByUrgency = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ urgency: true, isActive: true })
      .populate("requester", "name email")
      .populate("donor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelFakeRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid request id" });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Blood request not found" });
    }

    request.isFake = true;
    request.isSpam = true;
    request.isActive = false;
    request.status = "cancelled";
    await request.save();

    return res.status(200).json({ success: true, message: "Fake request cancelled", request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   E. APPOINTMENT CONTROL
===================================================== */

export const getAllAppointments = async (req, res) => {
  try {
    const query = {};
    const isActive = parseBoolean(req.query.isActive);

    if (req.query.status) query.status = req.query.status;
    if (typeof isActive === "boolean") query.isActive = isActive;

    const appointments = await Appointment.find(query)
      .populate("doctorId", "name email")
      .populate("patientId", "name email")
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    if (!isValidObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    appointment.isActive = false;
    appointment.cancelledBy = "admin";
    await appointment.save();

    await logAdminAction({
      req,
      action: "cancel_appointment",
      targetId: appointment._id,
      targetType: "appointment",
    });

    return res.status(200).json({ success: true, message: "Appointment cancelled", appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsFraudulent = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    if (!isValidObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.isFraudulent = true;
    await appointment.save();

    return res.status(200).json({ success: true, message: "Appointment flagged as fraudulent", appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   F. PRODUCT MANAGEMENT
===================================================== */

export const getAllProducts = async (req, res) => {
  try {
    const query = {};
    const isActive = parseBoolean(req.query.isActive);
    const isHidden = parseBoolean(req.query.isHidden);

    if (typeof isActive === "boolean") query.isActive = isActive;
    if (typeof isHidden === "boolean") query.isHidden = isHidden;

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "name, category, price and stock are required",
      });
    }

    const product = await Product.create(req.body);

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const product = await Product.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    return res.status(200).json({ success: true, message: "Product soft deleted", product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const hideProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isHidden = true;
    await product.save();

    return res.status(200).json({ success: true, message: "Product hidden", product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   G. REVIEW MODERATION
===================================================== */

export const getAllReviews = async (req, res) => {
  try {
    const query = {};
    const isActive = parseBoolean(req.query.isActive);

    if (typeof isActive === "boolean") query.isActive = isActive;

    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isActive = false;
    await review.save();

    return res.status(200).json({ success: true, message: "Review soft deleted", review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const flagReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reason = "Flagged by admin" } = req.body || {};

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isFlagged = true;
    review.flaggedReason = String(reason || "").trim();
    await review.save();

    return res.status(200).json({ success: true, message: "Review flagged", review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   H. PAYMENT MONITORING
===================================================== */

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Appointment.find({ paymentAmount: { $gt: 0 } })
      .populate("doctorId", "name email")
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFailedPayments = async (req, res) => {
  try {
    const failedPayments = await Appointment.find({ paymentStatus: "failed" })
      .populate("doctorId", "name email")
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: failedPayments.length, failedPayments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveRefund = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    if (!isValidObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid transaction id" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    appointment.invoiceDetails = {
      ...(appointment.invoiceDetails || {}),
      refundApproved: true,
      refundApprovedAt: new Date().toISOString(),
      refundApprovedBy: String(req.user._id),
    };

    await appointment.save();

    await logAdminAction({
      req,
      action: "approve_refund",
      targetId: appointment._id,
      targetType: "transaction",
    });

    return res.status(200).json({
      success: true,
      message: "Refund approved",
      transaction: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const transactionLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find({
      $or: [{ targetType: "transaction" }, { action: "approve_refund" }],
    })
      .populate("adminId", "name email role")
      .sort({ timestamp: -1 });

    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   I. ADMIN STATS DASHBOARD
===================================================== */

export const getAdminStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalPatients,
      totalAppointments,
      totalBloodDonors,
      activeBloodRequests,
      blockedUsers,
      suspiciousPatients,
      suspiciousDoctors,
      appointmentsToday,
      revenueAgg,
      avgDoctorPerformanceAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "doctor", doctorStatus: "pending" }),
      User.countDocuments({ role: "patient" }),
      Appointment.countDocuments({ isActive: true }),
      BloodDonor.countDocuments({ isActive: true }),
      BloodRequest.countDocuments({ isActive: true, status: "pending" }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: "patient", suspiciousFlag: true }),
      User.countDocuments({ role: "doctor", "doctorAI.suspiciousFlag": true }),
      Appointment.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, isActive: true }),
      Appointment.aggregate([
        { $match: { paymentStatus: "paid", isActive: true } },
        { $group: { _id: null, total: { $sum: "$paymentAmount" } } },
      ]),
      User.aggregate([
        { $match: { role: "doctor" } },
        { $group: { _id: null, avgPerformanceScore: { $avg: "$doctorAI.performanceScore" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;
    const avgDoctorPerformanceScore = Number(avgDoctorPerformanceAgg?.[0]?.avgPerformanceScore || 0).toFixed(2);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        pendingDoctors,
        totalPatients,
        totalAppointments,
        totalBloodDonors,
        activeBloodRequests,
        totalRevenue,
        blockedUsers,
        suspiciousPatients,
        suspiciousDoctors,
        avgDoctorPerformanceScore: Number(avgDoctorPerformanceScore),
        appointmentsToday,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   STEP 8 - SMART SUSPICIOUS ACTIVITY DETECTION
===================================================== */

export const getAdminAlerts = async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [highRequesters, doctorRejectRates, uncompletedDonations, ipClusters, suspiciousDoctors, lowRatedDoctors, highCancellationDoctors] = await Promise.all([
      BloodRequest.aggregate([
        { $match: { createdAt: { $gte: oneHourAgo }, isActive: true } },
        { $group: { _id: "$requester", count: { $sum: 1 } } },
        { $match: { count: { $gt: 5 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
      ]),
      Appointment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$doctorId",
            total: { $sum: 1 },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
              },
            },
          },
        },
        {
          $addFields: {
            rejectRate: {
              $cond: [{ $eq: ["$total", 0] }, 0, { $divide: ["$cancelled", "$total"] }],
            },
          },
        },
        { $match: { total: { $gte: 5 }, rejectRate: { $gt: 0.8 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
      ]),
      BloodRequest.aggregate([
        {
          $match: {
            status: "accepted",
            acceptedAt: { $lte: oneDayAgo },
            isActive: true,
          },
        },
        { $group: { _id: "$donor", acceptedCount: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "donor",
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            lastLoginIp: { $nin: [null, ""] },
            isActive: true,
          },
        },
        {
          $group: {
            _id: "$lastLoginIp",
            count: { $sum: 1 },
            users: { $push: { _id: "$_id", name: "$name", email: "$email" } },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ]),
      User.find({ role: "doctor", "doctorAI.suspiciousFlag": true, isActive: true }).select("name email doctorAI doctorStats"),
      User.find({ role: "doctor", isActive: true }).select("name email doctorStats"),
      User.find({ role: "doctor", isActive: true }).select("name email doctorAI"),
    ]);

    const alerts = [];

    highRequesters.forEach((item) => {
      const user = item.user?.[0];
      alerts.push({
        type: "high_blood_requests",
        severity: "high",
        message: `${user?.name || "User"} sent ${item.count} blood requests in the last hour`,
        meta: { requesterId: item._id, count: item.count },
      });
    });

    doctorRejectRates.forEach((item) => {
      const doctor = item.doctor?.[0];
      alerts.push({
        type: "doctor_high_reject_rate",
        severity: "medium",
        message: `${doctor?.name || "Doctor"} has ${(item.rejectRate * 100).toFixed(0)}% cancelled appointments`,
        meta: {
          doctorId: item._id,
          total: item.total,
          cancelled: item.cancelled,
          rejectRate: item.rejectRate,
        },
      });
    });

    uncompletedDonations.forEach((item) => {
      const donor = item.donor?.[0];
      alerts.push({
        type: "uncompleted_donations",
        severity: "medium",
        message: `${donor?.name || "Donor"} accepted ${item.acceptedCount} donation requests without completion`,
        meta: { donorId: item._id, acceptedCount: item.acceptedCount },
      });
    });

    ipClusters.forEach((item) => {
      alerts.push({
        type: "multiple_accounts_same_ip",
        severity: "high",
        message: `${item.count} active accounts detected from IP ${item._id}`,
        meta: { ipAddress: item._id, users: item.users },
      });
    });

    suspiciousDoctors.forEach((doctor) => {
      alerts.push({
        type: "doctor_suspicious_behavior",
        severity: "high",
        message: `${doctor.name} flagged by AI for suspicious behavior`,
        meta: {
          doctorId: doctor._id,
          performanceScore: doctor.doctorAI?.performanceScore || 0,
        },
      });
    });

    lowRatedDoctors
      .filter((doctor) => Number(doctor?.doctorStats?.rating || 0) > 0 && Number(doctor?.doctorStats?.rating || 0) < 2.5)
      .forEach((doctor) => {
        alerts.push({
          type: "doctor_low_rating",
          severity: "medium",
          message: `${doctor.name} has low rating ${doctor.doctorStats?.rating || 0}`,
          meta: { doctorId: doctor._id, rating: doctor.doctorStats?.rating || 0 },
        });
      });

    highCancellationDoctors
      .filter((doctor) => Number(doctor?.doctorAI?.cancellationRate || 0) > 40)
      .forEach((doctor) => {
        alerts.push({
          type: "doctor_high_cancellation_rate",
          severity: "high",
          message: `${doctor.name} has high cancellation rate (${doctor.doctorAI?.cancellationRate || 0}%)`,
          meta: {
            doctorId: doctor._id,
            cancellationRate: doctor.doctorAI?.cancellationRate || 0,
          },
        });
      });

    return res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   STEP 9 - REPORT SYSTEM
===================================================== */

export const getAdminReports = async (req, res) => {
  try {
    const [monthlyUserGrowth, doctorStatusStats, bloodDonationStats, revenueSummary, appointmentTrends] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      User.aggregate([
        { $match: { role: "doctor" } },
        { $group: { _id: "$doctorStatus", total: { $sum: 1 } } },
      ]),
      BloodRequest.aggregate([
        { $group: { _id: "$status", total: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$paymentAmount" },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              status: "$status",
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const doctorsTotal = doctorStatusStats.reduce((acc, item) => acc + item.total, 0);
    const approvedTotal = doctorStatusStats.find((item) => item._id === "approved")?.total || 0;
    const doctorApprovalRate = doctorsTotal > 0 ? (approvedTotal / doctorsTotal) * 100 : 0;

    return res.status(200).json({
      success: true,
      reports: {
        monthlyUserGrowth,
        doctorApprovalRate,
        doctorStatusStats,
        bloodDonationStats,
        revenueSummary,
        appointmentTrends,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllUsers,
  getAllPatients,
  getPatientById,
  togglePatientStatus,
  getPatientStats,
  toggleUserStatus,
  deleteUserSoft,
  getAllDoctors,
  getDoctorById,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  suspendDoctor,
  activateDoctor,
  getDoctorStats,
  getAllDonors,
  blockDonor,
  viewDonationHistory,
  deleteDonor,
  getAllBloodRequests,
  filterByUrgency,
  cancelFakeRequest,
  getAllAppointments,
  cancelAppointment,
  markAsFraudulent,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  hideProduct,
  getAllReviews,
  deleteReview,
  flagReview,
  getAllTransactions,
  getFailedPayments,
  approveRefund,
  transactionLogs,
  getAdminStats,
  getAdminAlerts,
  getAdminReports,
};
