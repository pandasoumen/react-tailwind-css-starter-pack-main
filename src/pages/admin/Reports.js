import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const Reports = () => {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data?.reports || null);
    };

    fetchReports().catch(() => setReports(null));
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Reports</h1>
      {!reports ? (
        <p className="text-sm text-slate-500">No report data available.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Monthly User Growth</h2>
            <p className="mt-2 text-sm">Points: {reports.monthlyUserGrowth?.length || 0}</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Doctor Approval Rate</h2>
            <p className="mt-2 text-sm">{Number(reports.doctorApprovalRate || 0).toFixed(2)}%</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Blood Donation Statistics</h2>
            <p className="mt-2 text-sm">Status groups: {reports.bloodDonationStats?.length || 0}</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Revenue Summary</h2>
            <p className="mt-2 text-sm">Months: {reports.revenueSummary?.length || 0}</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm md:col-span-2">
            <h2 className="font-semibold">Appointment Trends</h2>
            <p className="mt-2 text-sm">Trend points: {reports.appointmentTrends?.length || 0}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reports;
