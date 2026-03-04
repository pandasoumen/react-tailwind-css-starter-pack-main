import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const cardConfig = [
  { key: "totalUsers", label: "Total Users" },
  { key: "pendingDoctors", label: "Pending Doctors" },
  { key: "activeBloodRequests", label: "Active Blood Requests" },
  { key: "appointmentsToday", label: "Appointments Today" },
  { key: "totalRevenue", label: "Revenue" },
  { key: "blockedUsers", label: "Blocked Users" },
  { key: "suspiciousPatients", label: "Suspicious Patients" },
  { key: "suspiciousDoctors", label: "Suspicious Doctors" },
  { key: "avgDoctorPerformanceScore", label: "Doctor Performance Score" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);

  const doctorAlerts = alerts.filter((alert) =>
    ["doctor_suspicious_behavior", "doctor_low_rating", "doctor_high_cancellation_rate"].includes(alert.type)
  );
  const avgScore = Number(stats.avgDoctorPerformanceScore || 0);
  const riskLevel = avgScore < 40 ? "HIGH" : avgScore < 70 ? "MEDIUM" : "LOW";

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, alertsRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/stats`, { headers }),
        axios.get(`${BASE_URL}/admin/alerts`, { headers }),
      ]);

      setStats(statsRes.data?.stats || {});
      setAlerts(alertsRes.data?.alerts || []);
    };

    fetchDashboard().catch(() => {
      setStats({});
      setAlerts([]);
    });
  }, []);

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cardConfig.map((card) => (
          <div key={card.key} className="rounded-lg border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stats[card.key] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Admin Alerts Panel</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No suspicious activity detected.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={`${alert.type}-${idx}`} className="rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
                <p className="font-medium">{alert.type}</p>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">AI Doctor Monitoring</h2>
        <p className="mb-3 text-sm">
          AI Risk Level: <span className="font-semibold">{riskLevel}</span>
        </p>
        {doctorAlerts.length === 0 ? (
          <p className="text-sm text-slate-500">No doctor AI warnings currently.</p>
        ) : (
          <div className="space-y-3">
            {doctorAlerts.map((alert, idx) => (
              <div key={`${alert.type}-doctor-${idx}`} className="rounded border-l-4 border-rose-500 bg-rose-50 p-3 text-sm">
                <p className="font-medium">{alert.type}</p>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
