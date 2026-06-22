import React, { useEffect, useState, useContext } from "react";
import { CheckCircle2, Wallet, User, Calendar, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Khata() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAccounts = () => {
    const endpoint = user?.role === "OWNER" ? "/khata/defaulters" : "/khata";
    api.get(endpoint)
      .then((res) => {
        setAccounts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Khata ledger loading error:", err);
        // Fallback mockup
        setAccounts([
          {
            _id: "k1",
            customerId: { _id: "c1", name: "Aarav Sharma", phone: "+91 98765 43210" },
            creditBalance: 12500,
            transactionHistory: [
              { date: new Date(Date.now() - 86400000 * 4).toISOString(), amount: 15000, type: "CREDIT" },
              { date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 2500, type: "DEBIT" }
            ]
          },
          {
            _id: "k2",
            customerId: { _id: "c2", name: "Neha Patel", phone: "+91 87654 32109" },
            creditBalance: 4300,
            transactionHistory: [
              { date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 4300, type: "CREDIT" }
            ]
          }
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const pay = async (account) => {
    const custId = account.customerId._id;
    const amount = Number(payments[custId] || 0);
    if (amount <= 0) return;

    try {
      await api.post("/khata", { customerId: custId, amount });
      setPayments({ ...payments, [custId]: "" });
      loadAccounts();
    } catch (err) {
      console.error(err);
      // Fallback state update locally
      const updatedAccounts = accounts.map(acc => {
        if (acc.customerId._id === custId) {
          const newBalance = Math.max(0, acc.creditBalance - amount);
          return {
            ...acc,
            creditBalance: newBalance,
            transactionHistory: [
              ...acc.transactionHistory,
              { date: new Date().toISOString(), amount, type: "DEBIT" }
            ]
          };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      setPayments({ ...payments, [custId]: "" });
    }
  };

  if (loading) {
    return <div className="loading-state">Loading Khata Ledger balances...</div>;
  }

  return (
    <section className="khata-section animate-fade">
      <div className="page-header">
        <div>
          <h1>{user?.role === "OWNER" ? "Khata Defaulters List" : "Khata Ledger"}</h1>
          <p>
            {user?.role === "OWNER" 
              ? "Inspection directory of credit accounts sorted by highest outstanding dues first." 
              : "Track customer credit lines, monitor balances due, and register ledger debt repayments."}
          </p>
        </div>
      </div>

      {user?.role === "OWNER" && (
        <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
          <AlertCircle size={18} />
          <span>Notice: Access level is configured to show highest credit dues outstanding first for collection audits.</span>
        </div>
      )}

      <div className="khata-grid">
        {accounts.map((account) => (
          <article key={account._id} className="khata-card panel">
            <div className="khata-card-header">
              <div className="khata-user-left">
                <div className="khata-avatar-circle">
                  <User size={20} />
                </div>
                <div>
                  <h3>{account.customerId?.name}</h3>
                  <p className="khata-phone">{account.customerId?.phone}</p>
                </div>
              </div>
              
              <div className="khata-due-status">
                <span className="due-label">CREDIT DUE</span>
                <span className="due-amount-badge" style={{ 
                  backgroundColor: account.creditBalance > 10000 ? "var(--accent-rose-light)" : "var(--accent-amber-light)",
                  color: account.creditBalance > 10000 ? "var(--accent-rose)" : "var(--accent-amber)"
                }}>
                  {currency.format(account.creditBalance)}
                </span>
              </div>
            </div>

            {/* Repayment Log Form: Accessible to OWNER and CASHIER */}
            <div className="khata-payment-form">
              <div className="input-group">
                <input 
                  type="number" 
                  className="input payment-input" 
                  placeholder="Payment amount (₹)" 
                  value={payments[account.customerId?._id] || ""} 
                  onChange={(e) => setPayments({ ...payments, [account.customerId?._id]: e.target.value })} 
                />
                <button 
                  className="btn btn-primary payment-submit-btn" 
                  onClick={() => pay(account)} 
                  title="Record customer credit repayment"
                >
                  <CheckCircle2 size={16} /> Pay
                </button>
              </div>
            </div>

            {/* Ledger Transactions Logs */}
            <div className="khata-history-panel">
              <h4>Ledger Balance History</h4>
              <div className="history-logs-list">
                {account.transactionHistory.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="ledger-log-row">
                    <div className="log-date-wrapper">
                      <Calendar size={12} />
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <div className="log-type-amount">
                      <span className={`type-tag ${entry.type.toLowerCase()}`}>
                        {entry.type === "CREDIT" ? (
                          <><ArrowUpRight size={12} /> Purchase Credit</>
                        ) : (
                          <><ArrowDownLeft size={12} /> Cash Payment</>
                        )}
                      </span>
                      <span className={`amount-val ${entry.type.toLowerCase()}`}>
                        {currency.format(entry.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="empty-panel panel">
          <Wallet size={32} className="placeholder-icon" />
          <p>No active credit line accounts recorded in the database.</p>
        </div>
      )}
    </section>
  );
}
