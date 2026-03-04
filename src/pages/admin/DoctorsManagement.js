import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");

  const fetchDoctors = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/doctors`, {
      params: search.trim() ? { search: search.trim() } : {},
      headers: { Authorization: `Bearer ${token}` },
    });
    setDoctors(res.data?.doctors || []);
  };

  useEffect(() => {
    fetchDoctors().catch(() => setDoctors([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doctorAction = async (id, action) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${BASE_URL}/admin/doctors/${id}/${action}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchDoctors();
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Doctors Management</h1>

      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctor name/email/specialization"
          className="w-full max-w-lg rounded border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={fetchDoctors}
          className="rounded bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Doctor Name</th>
              <th className="p-3">Specialization</th>
              <th className="p-3">Hospital</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="border-t align-top">
                <td className="p-3">
                  <div className="font-semibold">{doctor.name}</div>
                  <div className="text-xs text-slate-500">{doctor.email}</div>
                </td>
                <td className="p-3">{doctor.specialization || "-"}</td>
                <td className="p-3">{doctor.hospital || "-"}</td>
                <td className="p-3">{doctor.experienceYears || 0} yrs</td>
                <td className="p-3">{doctor.rating || 0}</td>
                <td className="p-3">
                  <div>{doctor.doctorStatus}</div>
                  <div className="text-xs text-slate-500">
                    {doctor.suspended ? "Suspended" : "Active"}
                  </div>
                  <div className="text-xs">
                    AI Risk: <span className="font-semibold">{doctor.riskLevel || "LOW"}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/doctors/${doctor._id}`}
                      className="rounded bg-slate-700 px-2 py-1 text-xs text-white"
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => doctorAction(doctor._id, "approve")}
                      className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => doctorAction(doctor._id, "reject")}
                      className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => doctorAction(doctor._id, "suspend")}
                      className="rounded bg-amber-600 px-2 py-1 text-xs text-white"
                    >
                      Suspend
                    </button>
                    <button
                      type="button"
                      onClick={() => doctorAction(doctor._id, "activate")}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                    >
                      Activate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500">
                  No doctors found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
