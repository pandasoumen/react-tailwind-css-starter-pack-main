import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAppointments(res.data?.appointments || []);
  };

  useEffect(() => {
    fetchAppointments().catch(() => setAppointments([]));
  }, []);

  const cancelAppointment = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${BASE_URL}/admin/appointments/${id}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Appointments Management</h1>
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="rounded-lg border bg-white p-4 shadow-sm text-sm">
            <p><span className="font-semibold">Doctor:</span> {appointment.doctorId?.name || "-"}</p>
            <p><span className="font-semibold">Patient:</span> {appointment.patientId?.name || "-"}</p>
            <p><span className="font-semibold">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> {appointment.status}</p>
            <button
              className="mt-2 rounded bg-rose-600 px-3 py-1 text-white"
              onClick={() => cancelAppointment(appointment._id)}
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AppointmentsManagement;
