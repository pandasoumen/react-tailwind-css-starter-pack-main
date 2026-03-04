import React, { useState } from "react";
import axios from "axios";
import OtpInput from "../../components/OtpInput";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";

const TwoFactorVerify = ({ email }) => {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyOTP = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/otp/verify`,
        { email, otp }
      );

      dispatch(setCredentials(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">
        Two-Factor Authentication
      </h2>

      <OtpInput otp={otp} setOtp={setOtp} />

      <button
        onClick={verifyOTP}
        disabled={loading}
        className="w-full bg-green-600 text-white p-2 mt-4 rounded"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {error && (
        <p className="text-red-500 mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default TwoFactorVerify;
