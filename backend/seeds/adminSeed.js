import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  const adminName = process.env.ADMIN_NAME || "Admin BSDK";
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!mongoUri) {
    console.error("MONGO_URI is missing in backend/.env");
    process.exit(1);
  }

  if (!adminEmail || !adminPassword) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true,
        doctorStatus: "approved",
        loginAttempts: 0,
      });
      console.log(`Admin created: ${admin.email}`);
    } else {
      admin.name = adminName;
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isActive = true;
      admin.doctorStatus = "approved";
      admin.loginAttempts = 0;
      await admin.save();
      console.log(`Admin updated: ${admin.email}`);
    }
  } catch (error) {
    console.error(`Failed to seed admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin()
  .then(() => {
    if (!process.exitCode) console.log("Admin seeding completed");
  })
  .catch((error) => {
    console.error(`Admin seeding crashed: ${error.message}`);
    process.exit(1);
  });
