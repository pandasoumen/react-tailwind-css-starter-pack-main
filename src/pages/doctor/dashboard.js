import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppointments } from "../../store/slices/appointmentSlice";
import { getPatients } from "../../store/slices/patientSlice";

export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const appointmentsState = useSelector((state) => state.appointments) || {};
  const patientsState = useSelector((state) => state.patients) || {};
  const authState = useSelector((state) => state.auth) || {};
  const appointments = Array.isArray(appointmentsState.appointments)
    ? appointmentsState.appointments
    : [];
  const patients = Array.isArray(patientsState.patients) ? patientsState.patients : [];
  const user = authState.user || null;

  useEffect(() => {
    dispatch(getAppointments());
    dispatch(getPatients());
  }, [dispatch]);

  const earnings = appointments.length * 5;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-3xl font-bold text-[#0B3D91] mb-2">
        Welcome, Dr. {user?.name || "User"}
      </h1>
      <p className="text-slate-600 mb-8">Here is your dashboard overview for today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg text-slate-500">Appointments Today</h3>
          <p className="text-4xl font-bold text-[#0B3D91] mt-2">{appointments.length}</p>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg text-slate-500">Total Patients</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{patients.length}</p>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg text-slate-500">Earnings (Today)</h3>
          <p className="text-4xl font-bold text-emerald-600 mt-2">Rs {earnings}</p>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg text-slate-500">Blogs Published</h3>
          <p className="text-4xl font-bold text-amber-500 mt-2">3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0B3D91] mb-4">Upcoming Appointments</h2>

          {appointments.length === 0 ? (
            <p className="text-slate-500">No appointments scheduled.</p>
          ) : (
            <ul className="space-y-4">
              {appointments.slice(0, 5).map((appt) => (
                <li
                  key={appt._id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-slate-900 font-semibold">{appt.patientName}</p>
                    <p className="text-slate-500 text-sm">
                      {new Date(appt.date).toLocaleDateString()} - {appt.time}
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-emerald-500 rounded-full text-white text-sm">
                    Confirmed
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0B3D91] mb-4">Recent Patients</h2>

          {patients.length === 0 ? (
            <p className="text-slate-500">No patient records found.</p>
          ) : (
            <table className="w-full text-left text-slate-700">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2">Name</th>
                  <th className="py-2">Age</th>
                  <th className="py-2">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((p) => (
                  <tr key={p._id} className="border-b border-slate-100">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.age}</td>
                    <td className="py-2">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
