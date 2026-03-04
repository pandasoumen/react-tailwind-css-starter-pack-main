
import React from "react";

export default function AnimatedLogo({ size = 70 }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer Blue Circle */}
      <div
        className="rounded-full bg-[#0B3D91] flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Inner White Circle */}
        <div
          className="rounded-full bg-[#E8E8E8] flex items-center justify-center"
          style={{
            width: size * 0.75,
            height: size * 0.75,
          }}
        >
          {/* + Sign (Perfectly Centered) */}
          <span
            className="text-red-600 font-extrabold animate-heartbeat"
            style={{
              fontSize: size * 0.45,
              lineHeight: 1,
            }}
          >
            +
          </span>
        </div>
      </div>
    </div>
  );
}
