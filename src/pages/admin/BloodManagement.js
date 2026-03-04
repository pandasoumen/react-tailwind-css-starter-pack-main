import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const BloodManagement = () => {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [donorsRes, requestsRes] = await Promise.all([
      axios.get(`${BASE_URL}/admin/blood/donors`, { headers }),
      axios.get(`${BASE_URL}/admin/blood/requests`, { headers }),
    ]);

    setDonors(donorsRes.data?.donors || []);
    setRequests(requestsRes.data?.requests || []);
  };

  useEffect(() => {
    fetchData().catch(() => {
      setDonors([]);
      setRequests([]);
    });
  }, []);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Blood Management</h1>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Blood Donors</h2>
        <div className="space-y-2 text-sm">
          {donors.map((donor) => (
            <div key={donor._id} className="rounded border p-3">
              <p className="font-medium">{donor.user?.name || "Donor"}</p>
              <p>{donor.bloodGroup} - {donor.city}</p>
              <p>Status: {donor.isActive ? "Active" : "Blocked"}</p>
            </div>
          ))}
          {donors.length === 0 ? <p className="text-slate-500">No donors found.</p> : null}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Blood Requests</h2>
        <div className="space-y-2 text-sm">
          {requests.map((request) => (
            <div key={request._id} className="rounded border p-3">
              <p className="font-medium">{request.bloodGroup} - {request.city}</p>
              <p>Requester: {request.requester?.name || "Unknown"}</p>
              <p>Status: {request.status}</p>
              <p>Urgency: {request.urgency ? "Urgent" : "Normal"}</p>
            </div>
          ))}
          {requests.length === 0 ? <p className="text-slate-500">No blood requests found.</p> : null}
        </div>
      </div>
    </section>
  );
};

export default BloodManagement;
