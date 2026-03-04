import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  addProduct,
  activateDoctor,
  approveDoctor,
  approveRefund,
  blockDonor,
  cancelAppointment,
  cancelFakeRequest,
  deleteDonor,
  deleteProduct,
  deleteReview,
  deleteUserSoft,
  filterByUrgency,
  flagReview,
  getAdminAlerts,
  getAdminReports,
  getAdminStats,
  getAllAppointments,
  getAllBloodRequests,
  getAllDoctors,
  getAllDonors,
  getAllProducts,
  getAllReviews,
  getAllTransactions,
  getAllPatients,
  getPatientById,
  getPatientStats,
  getAllUsers,
  getFailedPayments,
  getPendingDoctors,
  getDoctorById,
  getDoctorStats,
  hideProduct,
  markAsFraudulent,
  rejectDoctor,
  suspendDoctor,
  toggleUserStatus,
  togglePatientStatus,
  transactionLogs,
  updateProduct,
  viewDonationHistory,
} from "../controllers/admin.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/alerts", getAdminAlerts);
router.get("/reports", getAdminReports);

router.get("/users", getAllUsers);
router.put("/users/:id/block", toggleUserStatus);
router.put("/users/:id/soft-delete", deleteUserSoft);

router.get("/patients", getAllPatients);
router.get("/patients/:id", getPatientById);
router.put("/patients/:id/block", togglePatientStatus);
router.get("/patients/:id/stats", getPatientStats);

router.get("/doctors", getAllDoctors);
router.get("/doctors/pending", getPendingDoctors);
router.get("/doctors/:id", getDoctorById);
router.get("/doctors/:id/stats", getDoctorStats);
router.put("/doctors/:id/approve", approveDoctor);
router.put("/doctors/:id/reject", rejectDoctor);
router.put("/doctors/:id/suspend", suspendDoctor);
router.put("/doctors/:id/activate", activateDoctor);

router.get("/blood/donors", getAllDonors);
router.put("/blood/donors/:id/block", blockDonor);
router.get("/blood/donors/:id/history", viewDonationHistory);
router.put("/blood/donors/:id/delete", deleteDonor);

router.get("/blood/requests", getAllBloodRequests);
router.get("/blood/requests/urgency", filterByUrgency);
router.put("/blood/requests/:id/cancel", cancelFakeRequest);

router.get("/appointments", getAllAppointments);
router.put("/appointments/:id/cancel", cancelAppointment);
router.put("/appointments/:id/fraud", markAsFraudulent);

router.get("/products", getAllProducts);
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.put("/products/:id/delete", deleteProduct);
router.put("/products/:id/hide", hideProduct);

router.get("/reviews", getAllReviews);
router.put("/reviews/:id/delete", deleteReview);
router.put("/reviews/:id/flag", flagReview);

router.get("/payments", getAllTransactions);
router.get("/payments/failed", getFailedPayments);
router.put("/payments/:id/refund/approve", approveRefund);
router.get("/payments/logs", transactionLogs);

export default router;

