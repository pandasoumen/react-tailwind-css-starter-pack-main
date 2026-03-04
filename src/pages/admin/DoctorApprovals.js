import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

export default function DoctorApprovals() {
  const [doctors, setDoctors] = useState([]);

  const fetchPendingDoctors = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/doctors/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDoctors(res.data?.doctors || []);
  };

  useEffect(() => {
    fetchPendingDoctors().catch(() => setDoctors([]));
  }, []);

  const handleAction = async (id, action) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${BASE_URL}/admin/doctors/${id}/${action}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchPendingDoctors();
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Doctor Approvals</h1>
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="rounded border bg-white p-4">
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-sm text-slate-600">{doctor.email}</p>
            <p className="text-sm">
              {doctor?.doctorVerification?.specialization || doctor?.doctorProfile?.specialty || "-"}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleAction(doctor._id, "approve")}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleAction(doctor._id, "reject")}
                className="rounded bg-rose-600 px-3 py-1 text-sm text-white"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {doctors.length === 0 ? <p className="text-sm text-slate-500">No pending approvals.</p> : null}
      </div>
    </section>
  );
}
