import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const patientNavLinks = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blogs" },
  { to: "/doctors", label: "Find Doctor" },
  { to: "/patient/blood", label: "Blood" },
  { to: "/patient/store", label: "Store" },
  { to: "/patient/dashboard", label: "Dashboard" },
  { to: "/patient/appointments", label: "Appointments" },
  { to: "/patient/profile", label: "Profile" },
];

export default function PatientSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-[#0B3D91] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
        {patientNavLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm ${isActive ? "bg-white text-[#0B3D91] font-semibold" : "hover:bg-blue-700"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto rounded border border-white/40 px-3 py-2 text-sm hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
