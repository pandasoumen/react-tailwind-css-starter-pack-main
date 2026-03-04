import User from "../models/User.js";

// -----------------------------------------
// PATIENT: View own profile
// -----------------------------------------
export const getMyPatientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user || user.role !== "patient") {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------
// PATIENT: Update own profile
// -----------------------------------------
export const updateMyPatientProfile = async (req, res) => {
  try {
    const updates = req.body;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json({ success: true, user: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------
// DOCTOR/ADMIN: Get all patients
// -----------------------------------------
export const listPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");

    res.json({ success: true, patients });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------
// DOCTOR/ADMIN: Get patient by ID
// -----------------------------------------
export const getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({ success: true, patient });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
