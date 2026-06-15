import { useEffect, useState } from "react";
import api from "../api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
  }, []);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Directory</h1>
        <p className="text-sm text-stone-500">Converted customers and their lifetime purchase value.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <article className="panel p-4" key={customer._id}>
            <p className="text-lg font-bold">{customer.name}</p>
            <p className="text-sm text-stone-500">{customer.phone}</p>
            <p className="text-sm text-stone-500">{customer.email || "No email"}</p>
            <div className="mt-4 rounded-md bg-emerald-50 p-3 text-emerald-800">
              <p className="text-xs font-semibold uppercase">Lifetime spent</p>
              <p className="text-xl font-bold">{currency.format(customer.lifetimeSpent || 0)}</p>
            </div>
          </article>
        ))}
      </div>
      {!customers.length && <p className="panel p-4 text-sm text-stone-500">No customers yet. Convert a lead to get started.</p>}
    </section>
  );
}
