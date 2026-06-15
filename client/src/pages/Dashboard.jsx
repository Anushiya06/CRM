import { IndianRupee, Flame, PackageX, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const cards = [
    { label: "Revenue", value: currency.format(data?.totalRevenue || 0), icon: IndianRupee, color: "bg-emerald-50 text-emerald-700" },
    { label: "Debt", value: currency.format(data?.outstandingCredits || 0), icon: WalletCards, color: "bg-amber-50 text-amber-700" },
    { label: "Hot Leads", value: data?.hotLeadsCount || 0, icon: Flame, color: "bg-rose-50 text-rose-700" },
    { label: "Low Stock", value: data?.lowStockCount || 0, icon: PackageX, color: "bg-sky-50 text-sky-700" }
  ];

  const chartRows = [
    { name: "Revenue", amount: data?.totalRevenue || 0 },
    { name: "Debt", amount: data?.outstandingCredits || 0 },
    { name: "Hot Leads", amount: data?.hotLeadsCount || 0 },
    { name: "Low Stock", amount: data?.lowStockCount || 0 }
  ];

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-stone-500">Sales health, dues, lead intent, and stock alerts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="panel p-4">
            <div className={`mb-4 grid h-10 w-10 place-items-center rounded-md ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel p-4">
          <h2 className="mb-4 font-bold">Business Snapshot</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#2bbf8f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-4">
          <h2 className="mb-4 font-bold">Recent Sales</h2>
          <div className="space-y-3">
            {(data?.recentSales || []).map((sale) => (
              <div key={sale._id} className="flex items-center justify-between rounded-md bg-stone-50 p-3">
                <div>
                  <p className="font-semibold">{sale.invoiceNo}</p>
                  <p className="text-sm text-stone-500">{sale.customerId?.name || "Customer"} · {sale.paymentMode}</p>
                </div>
                <span className="font-bold">{currency.format(sale.totalAmount)}</span>
              </div>
            ))}
            {!data?.recentSales?.length && <p className="text-sm text-stone-500">No sales yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
