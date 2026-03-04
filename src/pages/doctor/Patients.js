import React from "react";
import { useSelector } from "react-redux";

export default function DoctorPatients() {
  const patientsState = useSelector((state) => state.patients) || {};
  const patients = Array.isArray(patientsState.patients) ? patientsState.patients : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#0B3D91] mb-4">Patients</h1>
      {patients.length === 0 ? (
        <p className="text-slate-500">No patient records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2">Name</th>
                <th className="py-2">Age</th>
                <th className="py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-slate-100">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.age || "-"}</td>
                  <td className="py-2">{new Date(p.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
