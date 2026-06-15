import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Khata() {
  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState({});

  const load = () => api.get("/khata").then((res) => setAccounts(res.data));

  useEffect(() => {
    load();
  }, []);

  const pay = async (account) => {
    const amount = Number(payments[account.customerId._id] || 0);
    if (amount <= 0) return;
    await api.post("/khata", { customerId: account.customerId._id, amount });
    setPayments({ ...payments, [account.customerId._id]: "" });
    load();
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Khata Ledger</h1>
        <p className="text-sm text-stone-500">Track customers who owe money and record payments against dues.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {accounts.map((account) => (
          <article key={account._id} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{account.customerId?.name}</p>
                <p className="text-sm text-stone-500">{account.customerId?.phone}</p>
              </div>
              <div className="rounded-md bg-amber-50 px-3 py-2 text-right text-amber-800">
                <p className="text-xs font-semibold uppercase">Due</p>
                <p className="text-xl font-bold">{currency.format(account.creditBalance)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input className="input" type="number" placeholder="Payment amount" value={payments[account.customerId._id] || ""} onChange={(e) => setPayments({ ...payments, [account.customerId._id]: e.target.value })} />
              <button className="btn-primary whitespace-nowrap" onClick={() => pay(account)} title="Record payment"><CheckCircle2 size={17} /> Pay</button>
            </div>
            <div className="mt-4 max-h-32 overflow-auto rounded-md bg-stone-50 p-3">
              {account.transactionHistory.slice().reverse().map((entry) => (
                <div key={`${entry.date}-${entry.amount}-${entry.type}`} className="flex justify-between py-1 text-sm">
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className={entry.type === "CREDIT" ? "text-amber-700" : "text-emerald-700"}>{entry.type} · {currency.format(entry.amount)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      {!accounts.length && <p className="panel p-4 text-sm text-stone-500">No active credit accounts.</p>}
    </section>
  );
}
