import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

export default function PatientDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [detailsRes, statsRes] = await Promise.all([
      axios.get(`${BASE_URL}/admin/patients/${id}`, { headers }),
      axios.get(`${BASE_URL}/admin/patients/${id}/stats`, { headers }),
    ]);

    setData(detailsRes.data || null);
    setStats(statsRes.data?.stats || null);
  };

  useEffect(() => {
    fetchAll().catch(() => {
      setData(null);
      setStats(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onToggle = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${BASE_URL}/admin/patients/${id}/block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAll();
  };

  if (!data?.patient) {
    return <p className="text-sm text-slate-500">Patient data unavailable.</p>;
  }

  const { patient, appointmentHistory = [], bloodRequestHistory = [], paymentHistory = [], activityLogs = [] } = data;

  return (
    <section className="space-y-6">
      <div className="rounded border bg-white p-4">
        <h1 className="text-2xl font-bold">Patient Details</h1>
        <p className="mt-2"><b>Name:</b> {patient.name}</p>
        <p><b>Email:</b> {patient.email}</p>
        <p><b>City:</b> {patient?.profile?.city || "-"}</p>
        <p><b>Status:</b> {patient.isActive ? "Active" : "Blocked"}</p>
        <p><b>Suspicious:</b> {stats?.suspiciousFlag ? "Yes" : "No"}</p>
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {patient.isActive ? "Block Patient" : "Unblock Patient"}
        </button>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">Stats</h2>
        <p>Total Appointments: {stats?.totalAppointments || 0}</p>
        <p>Completed Appointments: {stats?.completedAppointments || 0}</p>
        <p>Cancelled Appointments: {stats?.cancelledAppointments || 0}</p>
        <p>Total Blood Requests: {stats?.totalBloodRequests || 0}</p>
        <p>Last Login: {stats?.lastLogin ? new Date(stats.lastLogin).toLocaleString() : "-"}</p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Appointment History</h2>
        <div className="space-y-2 text-sm">
          {appointmentHistory.map((item) => (
            <div key={item._id} className="rounded border p-2">
              <p>Date: {item.date ? new Date(item.date).toLocaleDateString() : "-"}</p>
              <p>Status: {item.status}</p>
              <p>Doctor: {item?.doctorId?.name || "-"}</p>
            </div>
          ))}
          {appointmentHistory.length === 0 ? <p className="text-slate-500">No appointments found.</p> : null}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Blood Request History</h2>
        <div className="space-y-2 text-sm">
          {bloodRequestHistory.map((item) => (
            <div key={item._id} className="rounded border p-2">
              <p>Blood Group: {item.bloodGroup}</p>
              <p>Status: {item.status}</p>
              <p>City: {item.city}</p>
            </div>
          ))}
          {bloodRequestHistory.length === 0 ? <p className="text-slate-500">No blood requests found.</p> : null}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Payment History</h2>
        <div className="space-y-2 text-sm">
          {paymentHistory.map((item) => (
            <div key={item._id} className="rounded border p-2">
              <p>Invoice: {item.invoiceNumber || "-"}</p>
              <p>Amount: {item.paymentAmount || 0}</p>
              <p>Status: {item.paymentStatus || "-"}</p>
              <p>Method: {item.paymentMethod || "-"}</p>
            </div>
          ))}
          {paymentHistory.length === 0 ? <p className="text-slate-500">No payments found.</p> : null}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Activity Logs</h2>
        <div className="space-y-2 text-sm">
          {activityLogs.map((log) => (
            <div key={log._id} className="rounded border p-2">
              <p>Action: {log.action}</p>
              <p>By: {log?.adminId?.name || "-"}</p>
              <p>At: {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}</p>
            </div>
          ))}
          {activityLogs.length === 0 ? <p className="text-slate-500">No logs found.</p> : null}
        </div>
      </div>
    </section>
  );
}
