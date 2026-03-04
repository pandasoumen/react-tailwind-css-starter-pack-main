import React from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

const reviews = [
  "This AI assistant helped me understand my symptoms instantly!",
  "Very accurate predictions and easy doctor's appointment booking.",
  "Great tool for preliminary assessment before medical consultation.",
];

export default function ReviewsSection() {
  const [reviewers, setReviewers] = useState([]);

  useEffect(() => {
    const loadReviewers = async () => {
      const token = localStorage.getItem("token");
      const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const [doctorsRes, patientsRes] = await Promise.allSettled([
        axios.get(`${process.env.REACT_APP_BASE_URL}/doctors`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/patients`, authConfig),
      ]);

      const doctors =
        doctorsRes.status === "fulfilled" && Array.isArray(doctorsRes.value?.data?.doctors)
          ? doctorsRes.value.data.doctors.map((doctor) => ({
              role: "doctor",
              user: doctor?.user || {},
              specialty: doctor?.specialty || "",
              qualifications: Array.isArray(doctor?.qualifications) ? doctor.qualifications : [],
              collegeUniversity: doctor?.collegeUniversity || "",
            }))
          : [];

      const rawPatients =
        patientsRes.status === "fulfilled"
          ? Array.isArray(patientsRes.value?.data?.patients)
            ? patientsRes.value.data.patients
            : Array.isArray(patientsRes.value?.data)
              ? patientsRes.value.data
              : []
          : [];

      const patients = rawPatients.map((patient) => ({
        role: "patient",
        user: patient?.user || { name: patient?.name || "" },
      }));

      setReviewers([...doctors, ...patients].slice(0, reviews.length));
    };

    loadReviewers();
  }, []);

  return (
    <div className="py-20 bg-white">
      <h2 className="text-4xl font-bold text-[#0B3D91] text-center mb-12">
        User Reviews
      </h2>

      <div className="flex flex-wrap justify-center gap-8 px-4">
        {reviews.map((reviewText, index) => {
          const reviewer = reviewers[index] || {};
          const reviewerRole = (reviewer?.user?.role || reviewer?.role || "").toLowerCase();
          const reviewerName = reviewer?.user?.name || `User ${index + 1}`;
          const specialty = reviewer?.specialty || "Specialty not added";
          const degree = Array.isArray(reviewer?.qualifications) && reviewer.qualifications.length > 0
            ? reviewer.qualifications.join(", ")
            : "Degree not added";
          const college = reviewer?.collegeUniversity || "College not added";
          const isDoctor = reviewerRole === "doctor";
          const reviewerMeta = isDoctor
            ? `${reviewerName}, ${specialty}, ${degree}, ${college}`
            : `${reviewerName}, Patient`;

          return (
          <motion.div
            key={index}
            className="w-80 bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-700 italic mb-4">"{reviewText}"</p>
            <h4 className="font-semibold text-right text-[#0B3D91]">
              - {reviewerMeta}
            </h4>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}
