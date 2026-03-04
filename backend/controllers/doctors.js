import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// -------------------------------
// LIST ALL DOCTORS (Public)
// -------------------------------
export const listDoctors = async (req, res) => {
  try {
    const { search = "", gender = "", specialty = "" } = req.query || {};
    const filters = {};

    if (typeof gender === "string" && gender.trim()) {
      filters.sex = { $regex: new RegExp(`^${gender.trim()}$`, "i") };
    }

    if (typeof specialty === "string" && specialty.trim()) {
      filters.specialty = { $regex: specialty.trim(), $options: "i" };
    }

    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      const matchedUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select("_id");

      const userIds = matchedUsers.map((u) => u._id);
      filters.$or = [{ user: { $in: userIds } }, { specialty: searchRegex }];
    }

    const doctors = await Doctor.find(filters).populate("user", "name email profileImage");
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// GET SINGLE DOCTOR BY ID (Public)
// -------------------------------
export const getDoctorById = async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).populate("user", "name email profileImage");
    if (!doc) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctor: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// DOCTOR: VIEW OWN PROFILE
// -------------------------------
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    ).populate("user", "name email phone profile profileImage");
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// DOCTOR: UPDATE OWN PROFILE
// -------------------------------
export const updateMyDoctorProfile = async (req, res) => {
  try {
    const {
      name,
      sex,
      specialty,
      qualification,
      qualifications,
      collegeUniversity,
      research,
      bio,
      experience,
      offlineChamberLocation,
      offlineChamberStart,
      offlineChamberEnd,
      nationality,
      countryCode,
      countryFlag,
      consultationCurrency,
      phone,
      phoneCountryCode,
      languages,
      region,
      consultationFee,
    } = req.body || {};

    const doctorUpdates = {};

    if (typeof sex === "string") doctorUpdates.sex = sex.trim();
    if (typeof specialty === "string") doctorUpdates.specialty = specialty.trim();
    if (typeof collegeUniversity === "string") doctorUpdates.collegeUniversity = collegeUniversity.trim();
    if (typeof research === "string") doctorUpdates.research = research.trim();
    if (typeof bio === "string") doctorUpdates.bio = bio.trim();
    if (typeof offlineChamberLocation === "string") {
      doctorUpdates.offlineChamberLocation = offlineChamberLocation.trim();
    }
    if (typeof offlineChamberStart === "string") doctorUpdates.offlineChamberStart = offlineChamberStart.trim();
    if (typeof offlineChamberEnd === "string") doctorUpdates.offlineChamberEnd = offlineChamberEnd.trim();
    if (typeof nationality === "string") doctorUpdates.nationality = nationality.trim();
    if (typeof countryCode === "string") doctorUpdates.countryCode = countryCode.trim().toUpperCase();
    if (typeof countryFlag === "string") doctorUpdates.countryFlag = countryFlag.trim();
    if (typeof phoneCountryCode === "string" && phoneCountryCode.trim()) {
      doctorUpdates.phoneCountryCode = phoneCountryCode.trim();
    }
    if (typeof consultationCurrency === "string" && consultationCurrency.trim()) {
      doctorUpdates.consultationCurrency = consultationCurrency.trim().toUpperCase();
    }
    if (typeof region === "string") doctorUpdates.region = region.trim();

    const qualificationInput = qualifications ?? qualification;
    if (qualificationInput !== undefined) {
      doctorUpdates.qualifications = toStringArray(qualificationInput);
    }

    if (languages !== undefined) {
      doctorUpdates.languages = toStringArray(languages);
    }

    if (experience !== undefined) {
      const parsedExperience = Number(experience);
      if (!Number.isNaN(parsedExperience)) doctorUpdates.experience = parsedExperience;
    }

    if (consultationFee !== undefined) {
      const parsedFee = Number(consultationFee);
      if (!Number.isNaN(parsedFee)) doctorUpdates.consultationFee = parsedFee;
    }

    const userUpdates = {};
    if (typeof name === "string" && name.trim()) {
      userUpdates.name = name.trim();
    }
    if (typeof phone === "string") {
      const cleanedPhone = phone.trim();
      userUpdates.phone = cleanedPhone;
      userUpdates["profile.phone"] = cleanedPhone;
    }
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      {
        $setOnInsert: { user: req.user._id },
        $set: doctorUpdates,
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name email phone profile profileImage");
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
