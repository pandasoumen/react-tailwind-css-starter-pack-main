
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";

const createInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const getDoctorFromIdOrUser = async (doctorId) => {
  const doctorDocById = await Doctor.findById(doctorId).populate("user", "name email");
  const doctorDocByUser = doctorDocById ? null : await Doctor.findOne({ user: doctorId }).populate("user", "name email");
  return doctorDocById || doctorDocByUser;
};

const trySendBookingEmail = async ({ to, doctorName, date, time, invoiceNumber, paymentAmount, paymentMethod }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || !to) return false;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: "Healtron Appointment Booking Confirmation",
    text: `Booking successful.\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}\nPayment: ${paymentAmount} via ${paymentMethod}\nInvoice: ${invoiceNumber}`,
  });

  return true;
};

export const createRazorpayOrder = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can create payment orders" });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured on server",
      });
    }

    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: "doctorId is required" });
    }

    const doctorDoc = await getDoctorFromIdOrUser(doctorId);
    if (!doctorDoc?.user?._id) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    const doctorUser = await User.findById(doctorDoc.user._id).select("suspended doctorStatus isActive");
    if (!doctorUser || !doctorUser.isActive || doctorUser.suspended || doctorUser.doctorStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "This doctor is not available for appointments",
      });
    }

    const paymentAmount = Number(doctorDoc.consultationFee) || 0;
    if (paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid consultation fee for this doctor" });
    }

    const amountInPaise = Math.round(paymentAmount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `appt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      notes: {
        doctorId: String(doctorDoc.user._id),
        patientId: String(req.user._id),
      },
    });

    return res.status(200).json({
      success: true,
      order,
      amount: paymentAmount,
      doctorName: doctorDoc.user.name || "Doctor",
      keyId: process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// 1. Book Appointment (PATIENT)
// -------------------------------
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, paymentMethod = "Card", amount = 0 } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can book appointments" });
    }

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ success: false, message: "doctorId, date, time and reason are required" });
    }

    const doctorDoc = await getDoctorFromIdOrUser(doctorId);

    if (!doctorDoc?.user?._id) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    const doctorUser = await User.findById(doctorDoc.user._id).select("suspended doctorStatus isActive");
    if (!doctorUser || !doctorUser.isActive || doctorUser.suspended || doctorUser.doctorStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "This doctor is not available for appointments",
      });
    }

    const invoiceNumber = createInvoiceNumber();
    const paymentAmount = Number(amount) || Number(doctorDoc.consultationFee) || 0;

    const appointment = await Appointment.create({
      doctorId: doctorDoc.user._id,
      patientId: req.user._id,
      date,
      time,
      reason,
      status: "pending",
      paymentMethod,
      paymentStatus: "paid",
      paymentAmount,
      invoiceNumber,
      invoiceDetails: {
        invoiceNumber,
        amount: paymentAmount,
        method: paymentMethod,
        issuedAt: new Date().toISOString(),
      },
    });

    let emailSent = false;
    const patient = await User.findById(req.user._id).select("email name");
    try {
      emailSent = await trySendBookingEmail({
        to: patient?.email,
        doctorName: doctorDoc.user.name || "Doctor",
        date,
        time,
        invoiceNumber,
        paymentAmount,
        paymentMethod,
      });
    } catch {
      emailSent = false;
    }

    appointment.emailSent = emailSent;
    await appointment.save();

    res.status(201).json({ success: true, appointment });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyRazorpayAndBookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can book appointments" });
    }

    const {
      doctorId,
      date,
      time,
      reason,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ success: false, message: "doctorId, date, time and reason are required" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Razorpay payment details are required" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured on server" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Razorpay signature" });
    }

    const doctorDoc = await getDoctorFromIdOrUser(doctorId);
    if (!doctorDoc?.user?._id) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    const doctorUser = await User.findById(doctorDoc.user._id).select("suspended doctorStatus isActive");
    if (!doctorUser || !doctorUser.isActive || doctorUser.suspended || doctorUser.doctorStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "This doctor is not available for appointments",
      });
    }

    const invoiceNumber = createInvoiceNumber();
    const paymentAmount = Number(doctorDoc.consultationFee) || 0;

    const appointment = await Appointment.create({
      doctorId: doctorDoc.user._id,
      patientId: req.user._id,
      date,
      time,
      reason,
      status: "pending",
      paymentMethod: "Razorpay",
      paymentStatus: "paid",
      paymentAmount,
      invoiceNumber,
      invoiceDetails: {
        invoiceNumber,
        amount: paymentAmount,
        method: "Razorpay",
        issuedAt: new Date().toISOString(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    let emailSent = false;
    const patient = await User.findById(req.user._id).select("email name");
    try {
      emailSent = await trySendBookingEmail({
        to: patient?.email,
        doctorName: doctorDoc.user.name || "Doctor",
        date,
        time,
        invoiceNumber,
        paymentAmount,
        paymentMethod: "Razorpay",
      });
    } catch {
      emailSent = false;
    }

    appointment.emailSent = emailSent;
    await appointment.save();

    return res.status(201).json({ success: true, appointment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// 2. Get ALL Appointments (Doctor or Patient)
// -------------------------------
export const getAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter.patientId = req.user._id;
    }

    if (req.user.role === "doctor") {
      filter.doctorId = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    res.json({ success: true, appointments });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// 3. Update Appointment Status (DOCTOR)
// -------------------------------
export const updateAppointmentStatus = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only doctors can update status" });
    }

    const { status } = req.body;
    const id = req.params.id;

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, appointment: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------
// 4. My Appointments (PATIENT or DOCTOR)
// -------------------------------
export const getMyAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter.patientId = req.user._id;
    }

    if (req.user.role === "doctor") {
      filter.doctorId = req.user._id;
    }

    const myAppointments = await Appointment.find(filter)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    res.json({ success: true, appointments: myAppointments });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
