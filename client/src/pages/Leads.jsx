import { RefreshCw, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api";

export default function Leads() {
  const [leads, setLeads] = useState([]);

  const load = () => api.get("/leads").then((res) => setLeads(res.data));

  useEffect(() => {
    load();
  }, []);

  const convert = async (lead) => {
    const name = window.prompt("Customer name", `Customer ${lead.phone}`);
    if (!name) return;
    await api.post(`/customers/from-lead/${lead._id}`, { name });
    load();
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Manager</h1>
          <p className="text-sm text-stone-500">WhatsApp webhook leads tagged by simple purchase intent.</p>
        </div>
        <button className="btn-soft" onClick={load} title="Refresh leads"><RefreshCw size={17} /> Refresh</button>
      </div>
      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Intent</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-semibold">{lead.phone}</td>
                <td className="px-4 py-3 text-stone-600">{lead.lastMessage}</td>
                <td className="px-4 py-3"><span className="rounded bg-stone-100 px-2 py-1 text-xs font-bold">{lead.status}</span></td>
                <td className="px-4 py-3">{lead.intent}</td>
                <td className="px-4 py-3">
                  <button className="btn-primary" disabled={lead.status === "CONVERTED"} onClick={() => convert(lead)} title="Convert lead">
                    <UserPlus size={16} /> Convert
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads.length && <p className="p-4 text-sm text-stone-500">No leads captured yet.</p>}
      </div>
    </section>
  );
}
