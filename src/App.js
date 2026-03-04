import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalLoader from "./components/GlobalLoader";

import Home from "./pages/Home";
import DepartmentDetail from "./pages/DepartmentDetail";
import Doctors from "./pages/doctors";
import Blog from "./pages/blog";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ContactPage from "./pages/Contact";
import RegisterWithOTP from "./pages/auth/RegisterWithOTP";
import TwoFactorVerify from "./pages/auth/TwoFactorVerify";

import AdminLayout from "./layouts/AdminLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import PatientLayout from "./layouts/PatientLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import PatientsManagement from "./pages/admin/PatientsManagement";
import PatientDetails from "./pages/admin/PatientDetails";
import DoctorsManagement from "./pages/admin/DoctorsManagement";
import DoctorDetails from "./pages/admin/DoctorDetails";
import DoctorApprovals from "./pages/admin/DoctorApprovals";
import BloodManagement from "./pages/admin/BloodManagement";
import AppointmentsManagement from "./pages/admin/AppointmentsManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import ReviewsManagement from "./pages/admin/ReviewsManagement";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import Reports from "./pages/admin/Reports";

import DoctorDashboard from "./pages/doctor/dashboard";
import DoctorAppointments from "./pages/appointments";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorProfileOverview from "./pages/doctor/ProfileOverview";
import DoctorProfileSettings from "./pages/doctor/ProfileSettings";
import DoctorAvailability from "./pages/doctor/Availability";
import DoctorReviews from "./pages/doctor/Reviews";
import DoctorBlogs from "./pages/blog";
import DoctorStore from "./pages/doctor/Store";
import PatientPrescriptions from "./pages/doctor/PatientPrescriptions";

import PatientDashboard from "./pages/patient/Dashboard";
import PatientAppointments from "./pages/appointments";
import BloodFinder from "./pages/patient/blood_finder";
import PatientProfile from "./pages/patient/Profile";
import PatientProfileSettings from "./pages/patient/ProfileSettings";
import PatientStore from "./pages/patient/Store";
import DonorDashboard from "./pages/patient/DonorDashboard";
import UploadPrescription from "./pages/patient/UploadPrescription";
import DoctorProfileBooking from "./pages/patient/DoctorProfileBooking";

import AdminRoute from "./utils/AdminRoute";
import DoctorRoute from "./utils/DoctorRoute";
import PatientRoute from "./utils/PatientRoute";

function App() {
  const location = useLocation();
  const hideShellNav = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalLoader />
      {!hideShellNav && <Navbar />}

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/departments/:slug" element={<DepartmentDetail />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register-otp" element={<RegisterWithOTP />} />
          <Route path="/verify-otp" element={<TwoFactorVerify />} />

          <Route
            path="/doctors/:id"
            element={
              <PatientRoute>
                <DoctorProfileBooking />
              </PatientRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="patients" element={<PatientsManagement />} />
            <Route path="patients/:id" element={<PatientDetails />} />
            <Route path="doctors" element={<DoctorsManagement />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />
            <Route path="doctor-approvals" element={<DoctorApprovals />} />
            <Route path="blood" element={<BloodManagement />} />
            <Route path="appointments" element={<AppointmentsManagement />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="reviews" element={<ReviewsManagement />} />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route
            path="/doctor"
            element={
              <DoctorRoute>
                <DoctorLayout />
              </DoctorRoute>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="profile" element={<DoctorProfileOverview />} />
            <Route path="profile-settings" element={<DoctorProfileSettings />} />
            <Route path="availability" element={<DoctorAvailability />} />
            <Route path="reviews" element={<DoctorReviews />} />
            <Route path="blogs" element={<DoctorBlogs />} />
            <Route path="store" element={<DoctorStore />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
          </Route>

          <Route
            path="/patient"
            element={
              <PatientRoute>
                <PatientLayout />
              </PatientRoute>
            }
          >
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="blood" element={<BloodFinder />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="profile-settings" element={<PatientProfileSettings />} />
            <Route path="store" element={<PatientStore />} />
            <Route path="donor-dashboard" element={<DonorDashboard />} />
            <Route path="upload-prescription" element={<UploadPrescription />} />
          </Route>
        </Routes>
      </div>

      <Footer />
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />
    </div>
  );
}

export default App;
