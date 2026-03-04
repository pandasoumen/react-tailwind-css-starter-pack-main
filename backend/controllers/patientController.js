const Patient = require('../models/Patient');
const User = require('../models/User');

// GET /api/patients  - list patients (admin / doctor)
exports.listPatients = async (req, res) => {
  try {
    // guard: only doctor or admin
    if (!req.user || !['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const patients = await Patient.find().populate('user', 'name email profile');
    res.json({ success: true, patients });
  } catch (err) {
    console.error('listPatients error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/me - current patient profile
exports.getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email profile');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
    res.json({ success: true, patient });
  } catch (err) {
    console.error('getMyPatientProfile error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/patients/me - update patient's profile (patient only)
exports.updateMyPatientProfile = async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ success: false, message: 'Only patients' });
    const updates = req.body;

    // update nested user.profile and Patient document as needed
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { profile: updates.profile || {} } }, { new: true });
    const patient = await Patient.findOneAndUpdate({ user: req.user.id }, updates.patientFields || {}, { new: true, upsert: true });

    res.json({ success: true, user, patient });
  } catch (err) {
    console.error('updateMyPatientProfile error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
