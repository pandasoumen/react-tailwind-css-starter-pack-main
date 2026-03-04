import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const analyzeDoctorBehavior = async (doctor) => {
  const doctorId = doctor?._id;
  if (!doctorId) {
    return {
      performanceScore: 0,
      suspiciousFlag: false,
      cancellationRate: 0,
      negativeReviewRate: 0,
      recommendation: "Insufficient doctor data",
      warnings: [],
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      totalReviews: 0,
      negativeReviews: 0,
      rating: 0,
      multipleLoginLocations: false,
    };
  }

  const [appointments, reviews] = await Promise.all([
    Appointment.find({ doctorId, isActive: true }).select("status cancelledBy"),
    Review.find({ doctor: doctorId, isActive: true }).select("rating"),
  ]);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((item) => item.status === "completed").length;
  const cancelledAppointments = appointments.filter((item) => item.status === "cancelled").length;
  const rejectedByDoctor = appointments.filter(
    (item) => item.status === "cancelled" && item.cancelledBy === "doctor"
  ).length;

  const totalReviews = reviews.length;
  const negativeReviews = reviews.filter((item) => Number(item.rating) <= 2).length;
  const rating =
    totalReviews > 0
      ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalReviews
      : Number(doctor?.doctorProfile?.rating || doctor?.doctorStats?.rating || 0);

  const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
  const negativeReviewRate = totalReviews > 0 ? (negativeReviews / totalReviews) * 100 : 0;
  const reviewQualityScore = Math.max(0, 100 - negativeReviewRate);
  const ratingScore = Math.max(0, Math.min(100, (Number(rating) / 5) * 100));

  const performanceScore =
    0.5 * ratingScore + 0.3 * completionRate + 0.2 * reviewQualityScore;

  const multipleLoginLocations =
    Boolean(doctor.registrationIp) &&
    Boolean(doctor.lastLoginIp) &&
    doctor.registrationIp !== doctor.lastLoginIp;

  const warnings = [];
  if (cancellationRate > 40) warnings.push("Doctor has high cancellation rate");
  if (negativeReviews > 5) warnings.push("Doctor is receiving many negative reviews");
  if (Number(rating) < 2.5) warnings.push("Doctor rating is below 2.5");
  if (rejectedByDoctor > 10) warnings.push("Doctor has too many rejected appointments");
  if (multipleLoginLocations) warnings.push("Doctor has multiple login locations detected");

  const suspiciousFlag = performanceScore < 40 || warnings.length > 0;

  let recommendation = "Doctor performance appears stable";
  if (performanceScore < 40 || warnings.length >= 3) recommendation = "Immediate manual review recommended";
  else if (warnings.length > 0) recommendation = "Monitor doctor closely";

  return {
    performanceScore: round2(performanceScore),
    suspiciousFlag,
    cancellationRate: round2(cancellationRate),
    negativeReviewRate: round2(negativeReviewRate),
    recommendation,
    warnings,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    totalReviews,
    negativeReviews,
    rating: round2(rating),
    multipleLoginLocations,
  };
};

export default {
  analyzeDoctorBehavior,
};
