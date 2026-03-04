import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

export default function PatientsManagement() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPatients = async (nextPage = page) => {
    const token = localStorage.getItem("token");
    const params = { page: nextPage, limit: 10 };
    if (search.trim()) params.search = search.trim();
    if (city.trim()) params.city = city.trim();
    if (status) params.isActive = status;

    const res = await axios.get(`${BASE_URL}/admin/patients`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    setPatients(res.data?.patients || []);
    setPage(res.data?.page || nextPage);
    setTotalPages(res.data?.totalPages || 1);
  };

  useEffect(() => {
    fetchPatients(1).catch(() => {
      setPatients([]);
      setPage(1);
      setTotalPages(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${BASE_URL}/admin/patients/${id}/block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchPatients();
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Patients Management</h1>

      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city"
          className="rounded border px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Blocked</option>
        </select>
        <button
          type="button"
          onClick={() => fetchPatients(1)}
          className="rounded bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white"
        >
          Apply Filters
        </button>
      </div>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">City</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total Appointments</th>
              <th className="p-3">Suspicious</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className="border-t">
                <td className="p-3">{patient.name}</td>
                <td className="p-3">{patient.email}</td>
                <td className="p-3">{patient?.profile?.city || "-"}</td>
                <td className="p-3">{patient.isActive ? "Active" : "Blocked"}</td>
                <td className="p-3">{patient.totalAppointments || 0}</td>
                <td className="p-3">{patient.suspiciousFlag ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-2">
                  <Link
                    to={`/admin/patients/${patient._id}`}
                    className="rounded bg-slate-700 px-3 py-1 text-white"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggle(patient._id)}
                    className="rounded bg-rose-600 px-3 py-1 text-white"
                  >
                    {patient.isActive ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500">
                  No patients found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => fetchPatients(page - 1)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => fetchPatients(page + 1)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
