import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user, token } = useSelector((state) => state.auth);
  const effectiveToken = token || localStorage.getItem("token");

  if (!effectiveToken || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  if (user.isActive === false) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
