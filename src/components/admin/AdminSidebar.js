import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/patients", label: "Patients" },
  { to: "/admin/doctors", label: "Doctors" },
  { to: "/admin/doctor-approvals", label: "Doctor Approvals" },
  { to: "/admin/blood", label: "Blood" },
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-full bg-slate-900 p-4 text-slate-100 md:min-h-screen md:w-64">
      <h2 className="mb-6 text-xl font-bold">Admin Console</h2>
      <nav className="grid gap-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full rounded border border-rose-300 px-3 py-2 text-sm text-rose-200 hover:bg-rose-900"
      >
        Logout
      </button>
    </aside>
  );
}
