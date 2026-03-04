import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI Symptom Checker",
    desc: "Instant medical guidance using AI-powered diagnostic models.",
    img: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png",
  },
  {
    title: "Doctor Booking",
    desc: "Find verified doctors, book appointments instantly.",
    img: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
  },
  {
    title: "Health Prediction",
    desc: "ML-based predictions for disease risk & vitals monitoring.",
    img: "https://cdn-icons-png.flaticon.com/512/2904/2904979.png",
  },
];

export default function FeaturesSection() {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-blue-50">
      <h2 className="text-4xl font-bold text-center text-[#0B3D91] mb-10">
        Powerful AI Features
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 w-11/12 mx-auto">
        {features.map((f, index) => (
          <motion.div
            key={index}
            className="bg-white border border-blue-100 rounded-xl shadow-md p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src={f.img} alt={f.title} className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
