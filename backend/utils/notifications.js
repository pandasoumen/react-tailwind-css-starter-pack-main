import nodemailer from "nodemailer";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const sendEmail = async ({ to, subject, text }) => {
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
    subject,
    text,
  });

  return true;
};

export const notifyUser = async ({
  recipientId,
  type,
  title,
  message,
  relatedId,
  emailSubject,
  emailText,
}) => {
  if (!recipientId || !type || !title || !message) return { emailSent: false, notification: null };

  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    relatedId,
    relatedModel: "BloodRequest",
  });

  let emailSent = false;
  try {
    const recipient = await User.findById(recipientId).select("email");
    emailSent = await sendEmail({
      to: recipient?.email,
      subject: emailSubject || title,
      text: emailText || message,
    });
  } catch {
    emailSent = false;
  }

  return { emailSent, notification };
};
