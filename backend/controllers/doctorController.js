const Doctor = require('../models/Doctor');
const User = require('../models/User');

// GET /api/doctors  - list doctors (public)
exports.listDoctors = async (req, res) => {
  try {
    // optional filters: specialty, region, minRating
    const { specialty, region, minRating } = req.query;
    let filter = {};
    if (specialty) filter.specialty = specialty;
    if (region) filter.region = region;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const doctors = await Doctor.find(filter).populate('user', 'name email doctorProfile');
    res.json({ success: true, doctors });
  } catch (err) {
    console.error('listDoctors error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id - doctor by id
exports.getDoctorById = async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).populate('user', 'name email doctorProfile');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, doctor: doc });
  } catch (err) {
    console.error('getDoctorById error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/me - current doctor's profile
exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    console.error('getMyDoctorProfile error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/me - update doctor's profile (doctor only)
exports.updateMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ success: false, message: 'Only doctors' });
    const updates = req.body;
    const doctor = await Doctor.findOneAndUpdate({ user: req.user.id }, updates, { new: true, upsert: true });
    res.json({ success: true, doctor });
  } catch (err) {
    console.error('updateMyDoctorProfile error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
