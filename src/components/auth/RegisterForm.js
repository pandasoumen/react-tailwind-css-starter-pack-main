import React, { useState } from "react";
import axios from "axios";
import OtpInput from "../OtpInput";
import SuccessAnimation from "../SuccessAnimation";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // STEP 1 → SEND OTP
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/otp/send`,
        { email: form.email }
      );

      setStep(2);
    } catch (err) {
      console.log(err.response?.data);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }

  };

  // STEP 2 → VERIFY OTP
  const verifyOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Verify Payload:", { ...form, otp });

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/otp/verify`,
        { ...form, otp }
      );

      console.log("Sending OTP to backend:", {
        email: form.email,
        otp: otp,
      });

      dispatch(setCredentials(response.data));


setSuccess(true);

setTimeout(() => {
  const role = response.data.user.role;

  if (role === "admin") {
    navigate("/admin/dashboard");
  } else if (role === "doctor") {
    navigate("/doctor/dashboard");
  } else {
    navigate("/patient/dashboard");
  }

}, 1500);
    } catch (err) {
  setShake(true);
  setError(err.response?.data?.message || "OTP verification failed");
  setTimeout(() => setShake(false), 500);
} finally {
  setLoading(false);
}
  };

if (success) return <SuccessAnimation />;

return (
  <div>
    {step === 1 && (
      <form onSubmit={handleRegister} className="space-y-4">

        <input
          name="name"
          placeholder="Full Name"
          className="w-full p-3 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={form.role}
          className="w-full p-3 border rounded"
          onChange={handleChange}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}
      </form>
    )}

    {step === 2 && (
      <div>
        <h3 className="text-xl font-semibold text-center mb-4">
          Enter OTP
        </h3>

        <OtpInput otp={otp} setOtp={setOtp} shake={shake} />

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded mt-4"
        >
          {loading ? "Verifying..." : "Verify & Create Account"}
        </button>

        {error && (
          <p className="text-red-500 text-center mt-2">
            {error}
          </p>
        )}
      </div>
    )}
  </div>
);
};

export default RegisterForm;
