import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Flame, 
  Package, 
  ShoppingCart, 
  WalletCards, 
  LogOut 
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// Sidebar navigation component with active state highlights
export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>CRM Khata</h2>
        {user && <span className="user-role-badge">{user.role}</span>}
      </div>
      
      {user && (
        <div className="sidebar-user">
          <div className="avatar-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Flame size={18} />
          <span>Leads Hub</span>
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={18} />
          <span>Customers</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Package size={18} />
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/pos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <ShoppingCart size={18} />
          <span>POS Billing</span>
        </NavLink>
        <NavLink to="/khata" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <WalletCards size={18} />
          <span>Khata Ledger</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
