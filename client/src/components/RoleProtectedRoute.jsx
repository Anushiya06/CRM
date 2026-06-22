import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Wrap routes to verify the user has authorization for specific role categories
export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their primary landing sections
    if (user.role === "CASHIER") {
      return <Navigate to="/pos" replace />;
    } else if (user.role === "SALES_EXEC") {
      return <Navigate to="/leads" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
