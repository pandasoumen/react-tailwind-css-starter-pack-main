import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const parseAllowedOrigins = () => {
  const raw = [
    process.env.CLIENT_URLS,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .join(",");

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Allow server-to-server tools and same-origin requests without Origin header.
    if (!origin) return callback(null, true);

    // If no origin config is provided, avoid blocking all requests in production by mistake.
    if (allowedOrigins.length === 0) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import doctorRoutes from "./routes/doctors.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";
import availabilityRoutes from "./routes/availability.js";
import blogRoutes from "./routes/blog.js";
import bloodRoutes from "./routes/blood.js";
import bloodRequestRoutes from "./routes/bloodRequests.js";
import productRoutes from "./routes/products.js";
import reviewRoutes from "./routes/reviews.js";
import aiRoutes from "./routes/ai.js";
import otpRoutes from "./routes/otp.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";

app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Smart AI Health Backend Running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME || "not set"}`);
});
