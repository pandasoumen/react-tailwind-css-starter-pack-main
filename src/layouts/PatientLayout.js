import React from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "../components/patient/PatientSidebar";

export default function PatientLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PatientSidebar />
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
