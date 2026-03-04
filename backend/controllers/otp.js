import Otp from "../models/Otp.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// console.log("SMTP USER:", process.env.SMTP_USER);
// console.log("SMTP PASS:", process.env.SMTP_PASS);

const generateOTP = () =>
  crypto.randomInt(100000, 999999).toString();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const createTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials are missing. Set SMTP_USER and SMTP_PASS in backend/.env");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const buildOtpEmail = ({ otp, name }) => {
  const appName = process.env.APP_NAME || "Healtronn";
  const appUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000";
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
  const displayName =
    typeof name === "string" && name.trim().length > 0 ? name.trim() : "there";

  return {
    subject: `${appName} verification code`,
    text: `Hi ${displayName},\n\nYour OTP for ${appName} is ${otp}.\nThis code expires in 5 minutes.\n\nWebsite: ${appUrl}\nSupport: ${supportEmail}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">${appName}</h2>
        <p style="margin-top: 0;">Hi ${displayName},</p>
        <p>Your one-time verification code is:</p>
        <div style="font-size: 30px; font-weight: 700; letter-spacing: 6px; padding: 12px 16px; background: #f3f4f6; border-radius: 8px; display: inline-block;">
          ${otp}
        </div>
        <p style="margin-top: 16px;">This code expires in <strong>5 minutes</strong>.</p>
        <p style="margin: 8px 0;">Website: <a href="${appUrl}" target="_blank" rel="noreferrer">${appUrl}</a></p>
        <p style="margin: 8px 0;">Support: ${supportEmail}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280;">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `,
  };
};

export const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const emailContent = buildOtpEmail({ otp, name });
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${process.env.APP_NAME || "Healtronn"}" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    // Save OTP in DB (hash it) only after mail is accepted by SMTP
    const hashedOTP = await bcrypt.hash(otp, 10);
    await Otp.create({
      email: normalizedEmail,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    let { email, otp, name, password, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    email = email.trim().toLowerCase();
    otp = otp.trim().replace(/\s/g, "");

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }

    console.log("Email from frontend:", email);
    console.log("OTP from frontend:", otp);

    const otpRecord = await Otp.findOne({ email })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log("OTP not found in DB");
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteMany({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    console.log("Stored hashed OTP:", otpRecord.otp);

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    console.log("Match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await Otp.deleteMany({ email });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "patient",
    });

    if (user.role === "doctor") {
      await Doctor.findOneAndUpdate(
        { user: user._id },
        { $setOnInsert: { user: user._id } },
        { upsert: true }
      );
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};


export const otpLogin = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "User not found" });

  // send OTP same as signup flow
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "User not found" });

  // send OTP same as signup flow

};
