import Doctor from "../models/Doctor.js";

export const setAvailability = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only doctors can set availability" });
    }

    const { day, startTime, endTime } = req.body;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const slot = {
      day: String(day).trim(),
      startTime: String(startTime).trim(),
      endTime: String(endTime).trim(),
      slots: [],
    };

    const nextAvailability = Array.isArray(doctor.availability) ? [...doctor.availability] : [];
    const sameDayIndex = nextAvailability.findIndex(
      (item) => item?.day?.toLowerCase() === slot.day.toLowerCase()
    );

    if (sameDayIndex >= 0) {
      nextAvailability[sameDayIndex] = slot;
    } else {
      nextAvailability.push(slot);
    }

    doctor.availability = nextAvailability;
    await doctor.save();

    res.json({
      success: true,
      message: "Availability saved successfully",
      data: doctor.availability
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const doctorId = req.query?.doctorId;
    let doctor = null;

    if (doctorId) {
      doctor = (await Doctor.findById(doctorId)) || (await Doctor.findOne({ user: doctorId }));
    } else if (req.user?.role === "doctor") {
      doctor = await Doctor.findOne({ user: req.user._id });
    }

    if (!doctor) {
      return res.json({
        success: true,
        message: "No availability found",
        data: [],
      });
    }

    res.json({
      success: true,
      message: "Availability loaded",
      data: Array.isArray(doctor.availability) ? doctor.availability : []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
