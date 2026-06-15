import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api";

const emptyProduct = { name: "", sku: "", price: "", stockQuantity: "" };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);

  const load = () => api.get("/products").then((res) => setProducts(res.data));

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/products", {
      ...form,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity)
    });
    setForm(emptyProduct);
    load();
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Catalog</h1>
        <p className="text-sm text-stone-500">Product list, stock levels, and low stock alerts.</p>
      </div>
      <form onSubmit={submit} className="panel mb-6 grid gap-3 p-4 md:grid-cols-5">
        <input className="input" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <input className="input" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="input" placeholder="Stock" type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required />
        <button className="btn-primary" type="submit"><Plus size={17} /> Add</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article className="panel p-4" key={product._id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-stone-500">{product.sku}</p>
              </div>
              {product.stockQuantity <= 5 && <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-700">LOW</span>}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-stone-50 p-3">
                <p className="label">Price</p>
                <p className="font-bold">₹{product.price}</p>
              </div>
              <div className="rounded-md bg-stone-50 p-3">
                <p className="label">Stock</p>
                <p className="font-bold">{product.stockQuantity}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
