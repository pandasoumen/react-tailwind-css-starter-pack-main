import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const navItems = [
  { to: "/doctor/dashboard", label: "Dashboard" },
  { to: "/doctor/appointments", label: "Appointments" },
  { to: "/doctor/patients", label: "Patients" },
  { to: "/doctor/profile", label: "Profile" },
];

export default function DoctorSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sticky top-6">
        <h2 className="text-lg font-bold text-[#0B3D91] mb-3">Doctor Panel</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-[#0B3D91] text-white" : "text-slate-700 hover:bg-blue-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="mt-4 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
