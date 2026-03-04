import React, { useState } from "react";
import axios from "axios";
import OtpInput from "../../components/OtpInput";
import SuccessAnimation from "../../components/SuccessAnimation";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";

const RegisterWithOTP = () => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const sendOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/otp/send`,
        { email: form.email, name: form.name }
      );

      setStep(2);
      setTimer(60);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/otp/verify`,
        { ...form, otp }
      );

      setSuccess(true);

      setTimeout(() => {
        dispatch(setCredentials(response.data));
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
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold mb-4">Register</h2>

          <input
            placeholder="Name"
            className="w-full border p-2 mb-2"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            className="w-full border p-2 mb-2"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-2"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <select
            className="w-full border p-2 mb-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-4">
            Enter OTP
          </h2>

          <OtpInput otp={otp} setOtp={setOtp} shake={shake} />

          <button
            onClick={verifyOTP}
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 mt-4 rounded"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {timer > 0 ? (
            <p className="mt-2 text-center">
              Resend in {timer}s
            </p>
          ) : (
            <button
              onClick={sendOTP}
              className="text-blue-600 underline mt-2 w-full"
            >
              Resend OTP
            </button>
          )}
        </>
      )}

      {error && (
        <p className="text-red-500 mt-3 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default RegisterWithOTP;
