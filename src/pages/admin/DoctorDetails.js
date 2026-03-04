import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

export default function DoctorDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchDoctorDetails = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const [detailsRes, statsRes] = await Promise.all([
      axios.get(`${BASE_URL}/admin/doctors/${id}`, { headers }),
      axios.get(`${BASE_URL}/admin/doctors/${id}/stats`, { headers }),
    ]);

    setData(detailsRes.data || null);
    setStats(statsRes.data?.stats || null);
  };

  useEffect(() => {
    fetchDoctorDetails().catch(() => {
      setData(null);
      setStats(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!data?.doctor) {
    return <p className="text-sm text-slate-500">Doctor details unavailable.</p>;
  }

  const doctor = data.doctor;
  const doctorProfile = data.doctorProfile || {};
  const analytics = data.analytics || {};
  const ai = data.aiMonitoring || {};
  const certificates = data.certificates || [];
  const availability = data.availability || [];

  return (
    <section className="space-y-6">
      <div className="rounded border bg-white p-4">
        <h1 className="text-2xl font-bold">Doctor Information</h1>
        <p className="mt-2"><b>Name:</b> {doctor.name}</p>
        <p><b>Email:</b> {doctor.email}</p>
        <p><b>Specialization:</b> {doctor?.doctorVerification?.specialization || doctor?.doctorProfile?.specialty || "-"}</p>
        <p><b>Hospital:</b> {doctor?.doctorVerification?.hospital || "-"}</p>
        <p><b>Experience:</b> {doctor?.doctorVerification?.experienceYears || doctor?.doctorProfile?.experience || 0} years</p>
        <p><b>Status:</b> {doctor.doctorStatus} / {doctor.suspended ? "Suspended" : "Active"}</p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-sm text-slate-500">No certificates uploaded.</p>
        ) : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {certificates.map((file, index) => (
              <li key={`${file}-${index}`}>{file}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">Availability</h2>
        {availability.length === 0 ? (
          <p className="text-sm text-slate-500">No availability records.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {availability.map((slot, idx) => (
              <div key={idx} className="rounded border p-2">
                <p><b>Day:</b> {slot.day}</p>
                <p><b>Time:</b> {slot.startTime} - {slot.endTime}</p>
              </div>
            ))}
          </div>
        )}
        {doctorProfile?.region ? <p className="mt-2 text-sm"><b>Region:</b> {doctorProfile.region}</p> : null}
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <p>Total Appointments: {stats?.totalAppointments ?? analytics.totalAppointments ?? 0}</p>
        <p>
          Completion Rate:{" "}
          {stats?.totalAppointments
            ? (((stats.completedAppointments || 0) / stats.totalAppointments) * 100).toFixed(2)
            : (analytics.completionRate || 0).toFixed(2)}
          %
        </p>
        <p>Average Rating: {stats?.rating ?? analytics.averageRating ?? 0}</p>
        <p>Revenue Generated: {stats?.revenueGenerated ?? analytics.revenueGenerated ?? 0}</p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">AI Monitoring Panel</h2>
        <p>Performance Score: {ai.performanceScore ?? stats?.performanceScore ?? 0}</p>
        <p>AI Risk Level: {ai.riskLevel ?? stats?.riskLevel ?? "LOW"}</p>
        <p>Suspicious Flag: {String(ai.suspiciousFlag ?? stats?.suspiciousFlag ?? false)}</p>
        <p>Recommendation: {ai.recommendation || "No recommendation"}</p>
        {(ai.warnings || []).length > 0 ? (
          <ul className="mt-2 list-disc pl-5 text-sm text-rose-700">
            {ai.warnings.map((warning, idx) => (
              <li key={`${warning}-${idx}`}>{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No active warnings.</p>
        )}
      </div>
    </section>
  );
}
