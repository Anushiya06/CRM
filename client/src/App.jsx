import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { BarChart3, Boxes, ContactRound, LayoutDashboard, LogOut, ReceiptText, ScrollText, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import api from "./api";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Khata from "./pages/Khata";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: ContactRound },
  { to: "/customers", label: "Customers", icon: UsersRound },
  { to: "/pos", label: "POS Billing", icon: ReceiptText },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/khata", label: "Khata", icon: ScrollText }
];

function Login({ onAuth }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(url, form);
      localStorage.setItem("crm_token", data.token);
      localStorage.setItem("crm_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#edf4ef] px-4">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">CRM Khata</h1>
            <p className="text-sm text-stone-500">Sign in to manage sales, leads, and credit.</p>
          </div>
        </div>
        {mode === "register" && (
          <label className="mb-3 block">
            <span className="label">Name</span>
            <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        )}
        <label className="mb-3 block">
          <span className="label">Email</span>
          <input className="input mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="mb-4 block">
          <span className="label">Password</span>
          <input className="input mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" type="submit">{mode === "login" ? "Login" : "Create account"}</button>
        <button className="mt-3 w-full text-sm font-semibold text-stone-600" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create a new account" : "Use existing account"}
        </button>
      </form>
    </main>
  );
}

function Layout({ user, onLogout }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    onLogout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-stone-200 bg-white p-4 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="font-bold">CRM Khata</p>
            <p className="text-xs text-stone-500">{user?.role || "STAFF"}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-100"}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div>
            <p className="text-sm text-stone-500">Welcome back</p>
            <h2 className="text-lg font-bold">{user?.name || "Operator"}</h2>
          </div>
          <button className="btn-soft" onClick={logout} title="Logout">
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>
        <div className="px-4 py-6 md:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/khata" element={<Khata />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  if (!localStorage.getItem("crm_token")) return <Login onAuth={setUser} />;
  return <Layout user={user} onLogout={() => setUser(null)} />;
}
