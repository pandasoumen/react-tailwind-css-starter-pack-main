import React from "react";

const SuccessAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="mt-4 text-green-600 font-semibold">
        Verification Successful!
      </p>
    </div>
  );
};

export default SuccessAnimation;
