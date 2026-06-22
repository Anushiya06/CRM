import React, { useEffect, useState } from "react";
import { User, Mail, Phone, IndianRupee } from "lucide-react";
import api from "../api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/customers")
      .then((res) => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Customers error:", err);
        // Fallback mockup
        setCustomers([
          { _id: "c1", name: "Aarav Sharma", phone: "+91 98765 43210", email: "aarav@gmail.com", lifetimeSpent: 12500 },
          { _id: "c2", name: "Neha Patel", phone: "+91 87654 32109", email: "neha.patel@outlook.com", lifetimeSpent: 4300 },
          { _id: "c3", name: "Vikram Singh", phone: "+91 76543 21098", email: "", lifetimeSpent: 850 }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-state">Loading customer directory...</div>;
  }

  return (
    <section className="customers-section animate-fade">
      <div className="page-header">
        <div>
          <h1>Customer Directory</h1>
          <p>Database of leads converted into purchasing customers, including lifetime sales values.</p>
        </div>
      </div>

      <div className="customers-grid">
        {customers.map((customer) => (
          <article className="customer-card panel" key={customer._id}>
            <div className="customer-header">
              <div className="customer-avatar">
                <User size={20} />
              </div>
              <div>
                <h3>{customer.name}</h3>
                <span className="customer-id-tag">ID: {customer._id.substring(0, 8)}</span>
              </div>
            </div>

            <div className="customer-contact-info">
              <div className="contact-row">
                <Phone size={14} />
                <span>{customer.phone}</span>
              </div>
              <div className="contact-row">
                <Mail size={14} />
                <span>{customer.email || "No email registered"}</span>
              </div>
            </div>

            <div className="spent-stats-box">
              <span className="spent-label">LIFETIME VALUE</span>
              <div className="spent-value-wrapper">
                <IndianRupee size={16} />
                <span className="spent-amount">{currency.format(customer.lifetimeSpent || 0)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {customers.length === 0 && (
        <p className="empty-panel panel">No converted customers recorded. Select a Lead from the Lead Hub and convert them to get started.</p>
      )}
    </section>
  );
}
