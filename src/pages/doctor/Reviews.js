import React from "react";

const demoReviews = [
  { id: 1, name: "S. Roy", text: "Very clear explanation and friendly consultation." },
  { id: 2, name: "R. Das", text: "Appointment process was smooth and quick." },
];

export default function DoctorReviews() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#0B3D91] mb-4">Reviews</h1>
      <div className="space-y-3">
        {demoReviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-slate-800 font-semibold">{r.name}</p>
            <p className="text-slate-600">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
