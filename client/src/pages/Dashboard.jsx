import React, { useEffect, useState } from "react";
import { IndianRupee, Flame, PackageX, WalletCards, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        // Fallback mock data for testing
        setData({
          totalRevenue: 45000,
          outstandingCredits: 12500,
          hotLeadsCount: 5,
          lowStockCount: 2,
          recentSales: [
            { _id: "s1", invoiceNo: "INV-001", totalAmount: 1500, paymentMode: "CASH", customerId: { name: "Aarav Sharma" } },
            { _id: "s2", invoiceNo: "INV-002", totalAmount: 3200, paymentMode: "CREDIT", customerId: { name: "Neha Patel" } },
            { _id: "s3", invoiceNo: "INV-003", totalAmount: 850, paymentMode: "CASH", customerId: { name: "Vikram Singh" } }
          ]
        });
        setLoading(false);
      });
  }, []);

  const cards = [
    { label: "Revenue", value: currency.format(data?.totalRevenue || 0), icon: IndianRupee, statusClass: "revenue" },
    { label: "Dues Outstanding", value: currency.format(data?.outstandingCredits || 0), icon: WalletCards, statusClass: "debt" },
    { label: "Hot Leads", value: data?.hotLeadsCount || 0, icon: Flame, statusClass: "leads" },
    { label: "Low Stock Items", value: data?.lowStockCount || 0, icon: PackageX, statusClass: "stock" }
  ];

  const chartRows = [
    { name: "Revenue", amount: data?.totalRevenue || 0 },
    { name: "Debt", amount: data?.outstandingCredits || 0 },
    { name: "Hot Leads Value", amount: (data?.hotLeadsCount || 0) * 1000 }, // Scaled value for display
    { name: "Low Stock Value", amount: (data?.lowStockCount || 0) * 500 }
  ];

  if (loading) {
    return <div className="loading-state">Loading dashboard analytics...</div>;
  }

  return (
    <section className="dashboard-section animate-fade">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Sales, credits, hot leads, and critical stock level indicators at a glance.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stat-cards-grid">
        {cards.map(({ label, value, icon: Icon, statusClass }) => (
          <article key={label} className={`stat-card ${statusClass} panel`}>
            <div className="stat-icon-wrapper">
              <Icon size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Main Analytics Content */}
      <div className="dashboard-charts-layout">
        
        {/* Business snapshot chart */}
        <div className="chart-panel panel">
          <div className="panel-header">
            <TrendingUp size={18} />
            <h2>Business Snapshot</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="amount" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent sales list */}
        <div className="sales-panel panel">
          <div className="panel-header">
            <h2>Recent Orders</h2>
          </div>
          <div className="recent-sales-list">
            {(data?.recentSales || []).map((sale) => (
              <div key={sale._id} className="sale-item">
                <div className="sale-info">
                  <p className="sale-invoice">{sale.invoiceNo}</p>
                  <p className="sale-customer">
                    {sale.customerId?.name || "Walk-in Customer"} · <span className="payment-badge">{sale.paymentMode}</span>
                  </p>
                </div>
                <span className="sale-amount">{currency.format(sale.totalAmount)}</span>
              </div>
            ))}
            {(!data?.recentSales || data.recentSales.length === 0) && (
              <p className="empty-msg">No sales transactions logged today.</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
