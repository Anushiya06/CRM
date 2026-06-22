import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Sidebar from "./components/Sidebar";

// Views/Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Khata from "./pages/Khata";

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      {/* Show sidebar navigation panel if user is authenticated */}
      {user && <Sidebar />}

      {/* Main workspace for current rendering view */}
      <main className={user ? "main-content-layout" : ""}>
        <Routes>
          {/* Public Authentication Views */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

          {/* Protected Internal CRM Views under RBAC checks */}
          <Route 
            path="/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER"]}>
                <Dashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER"]}>
                <Users />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER", "SALES_EXEC"]}>
                <Leads />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER", "SALES_EXEC"]}>
                <Customers />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER"]}>
                <Inventory />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/pos" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER", "CASHIER"]}>
                <POS />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/khata" 
            element={
              <RoleProtectedRoute allowedRoles={["OWNER", "CASHIER"]}>
                <Khata />
              </RoleProtectedRoute>
            } 
          />

          {/* Fallback route redirection */}
          <Route path="*" element={<Navigate to={user ? (user.role === "CASHIER" ? "/pos" : user.role === "SALES_EXEC" ? "/leads" : "/dashboard") : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
