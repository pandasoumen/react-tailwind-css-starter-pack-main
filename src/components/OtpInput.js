import React, { useRef } from "react";

const OtpInput = ({ otp, setOtp, shake }) => {
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const otpArray = otp.split("");
    otpArray[index] = value;
    setOtp(otpArray.join(""));

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className={`flex gap-2 justify-center mt-4 ${shake ? "shake" : ""}`}>
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          maxLength="1"
          value={otp[index] || ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleBackspace(e, index)}
          ref={(el) => (inputs.current[index] = el)}
          className="w-12 h-12 text-center border rounded text-xl focus:ring-2 focus:ring-blue-500 transition-all"
        />
      ))}
    </div>
  );
};

export default OtpInput;
