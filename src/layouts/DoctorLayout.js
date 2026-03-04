import React from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/doctor/DoctorSidebar";

export default function DoctorLayout() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 flex gap-6">
        <DoctorSidebar />

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
