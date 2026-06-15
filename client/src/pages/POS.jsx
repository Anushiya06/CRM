import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function POS() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => {
    api.get("/customers").then((res) => setCustomers(res.data));
    api.get("/products").then((res) => setProducts(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const add = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.productId === product._id);
      if (existing) return items.map((item) => item.productId === product._id ? { ...item, qty: item.qty + 1 } : item);
      return [...items, { productId: product._id, name: product.name, qty: 1, price: product.price }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((items) =>
      items
        .map((item) => item.productId === productId ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
        .filter((item) => item.qty > 0)
    );
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.qty * item.price, 0), [cart]);

  const submit = async () => {
    setMessage("");
    await api.post("/sales", { customerId, paymentMode, items: cart });
    setCart([]);
    setMessage("Sale recorded successfully.");
    load();
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">POS Billing</h1>
        <p className="text-sm text-stone-500">Add products to cart, choose cash or Khata credit, and record the order.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="panel p-4">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name} · {customer.phone}</option>)}
            </select>
            <div className="grid grid-cols-2 rounded-md bg-stone-100 p-1">
              {["CASH", "CREDIT"].map((mode) => (
                <button key={mode} type="button" className={`rounded px-3 py-2 text-sm font-bold ${paymentMode === mode ? "bg-white shadow-sm" : "text-stone-600"}`} onClick={() => setPaymentMode(mode)}>
                  {mode === "CREDIT" ? "Khata" : "Cash"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <button key={product._id} className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-left hover:border-mint" onClick={() => add(product)} disabled={product.stockQuantity <= 0}>
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-stone-500">{product.sku}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span>{currency.format(product.price)}</span>
                  <span>{product.stockQuantity} left</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <aside className="panel p-4">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="font-bold">Cart</h2>
          </div>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="rounded-md bg-stone-50 p-3">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold">{item.name}</p>
                  <p>{currency.format(item.qty * item.price)}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button className="btn-soft h-8 w-8 p-0" onClick={() => updateQty(item.productId, -1)} title="Decrease quantity"><Minus size={15} /></button>
                  <span className="w-8 text-center font-bold">{item.qty}</span>
                  <button className="btn-soft h-8 w-8 p-0" onClick={() => updateQty(item.productId, 1)} title="Increase quantity"><Plus size={15} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-stone-200 pt-4">
            <div className="mb-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{currency.format(total)}</span>
            </div>
            {message && <p className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            <button className="btn-primary w-full" disabled={!customerId || !cart.length} onClick={submit}>Submit order</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
