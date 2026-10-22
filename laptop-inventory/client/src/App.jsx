import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = '/api';

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const buttonClass = 'rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Tech Centre</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Laptop Inventory</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/receive" label="Receive Laptop" />
            <NavLink to="/send" label="Send Laptop" />
            <NavLink to="/inventory" label="View Inventory" />
            <NavLink to="/transactions" label="View Transactions" />
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function NavLink({ to, label }) {
  return (
    <Link to={to} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
      {label}
    </Link>
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/dashboard`);
      setDashboard(data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const exportExcel = async () => {
    try {
      const response = await axios.get(`${API}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Inventory_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Excel report exported');
    } catch (error) {
      toast.error('Unable to export Excel file');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current Inventory" value={dashboard?.currentInventory ?? 0} accent="indigo" />
        <MetricCard label="Total Received" value={dashboard?.totalReceived ?? 0} accent="emerald" />
        <MetricCard label="Total Sent Out" value={dashboard?.totalSentOut ?? 0} accent="rose" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/receive" className={buttonClass}>Receive Laptop</Link>
        <Link to="/send" className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500">Send Laptop</Link>
        <Link to="/inventory" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400">View Inventory</Link>
        <Link to="/transactions" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400">View Transactions</Link>
        <button type="button" className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100" onClick={exportExcel}>Export Excel</button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }) {
  const palette = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className={cardClass}>
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[accent]}`}>{label}</div>
      <p className="mt-4 text-4xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ReceivePage() {
  return <LaptopForm mode="IN" title="Receive Laptop" buttonLabel="Receive Laptop" />;
}

function SendPage() {
  return <LaptopForm mode="OUT" title="Send Laptop" buttonLabel="Send Laptop" />;
}

function LaptopForm({ mode, title, buttonLabel }) {
  const [form, setForm] = useState({ laptopNumber: '', purpose: 'NEW STOCK', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        laptopNumber: form.laptopNumber.trim(),
        purpose: form.purpose,
        notes: form.notes.trim(),
      };

      if (!payload.laptopNumber) {
        toast.error('Laptop number is required');
        return;
      }

      const { data } = await axios.post(`${API}/${mode.toLowerCase()}`, payload);
      if (data.success) {
        toast.success(`${title} recorded successfully`);
        setForm({ laptopNumber: '', purpose: mode === 'IN' ? 'NEW STOCK' : 'USER ISSUE', notes: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Laptop Number *</label>
          <input
            value={form.laptopNumber}
            onChange={(event) => setForm({ ...form, laptopNumber: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400"
            placeholder="LT001"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Purpose</label>
          <select
            value={form.purpose}
            onChange={(event) => setForm({ ...form, purpose: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400"
          >
            <option value="NEW STOCK">NEW STOCK</option>
            <option value="RETURNED">RETURNED</option>
            <option value="USER ISSUE">USER ISSUE</option>
            <option value="WAREHOUSE">WAREHOUSE</option>
            <option value="REPAIR">REPAIR</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            rows="4"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400"
            placeholder="Notes..."
          />
        </div>

        <button disabled={loading} type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60">
          {loading ? 'Processing...' : buttonLabel}
        </button>
      </form>
    </div>
  );
}

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/inventory`);
        setInventory(data);
      } catch (error) {
        toast.error('Unable to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const filtered = useMemo(() => {
    const searchTerm = query.trim().toUpperCase();
    if (!searchTerm) return inventory;
    return inventory.filter((item) => item.laptopNumber.includes(searchTerm));
  }, [inventory, query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Laptop Inventory</h2>
        <div className="w-full md:max-w-xs">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Laptop Number"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="mb-4 text-sm font-medium text-slate-600">Total Inventory: {filtered.length}</div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState text="No laptops currently in the Tech Centre." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => (
            <div key={item.laptopNumber} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {item.laptopNumber}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState({ items: [], page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/transactions`, {
          params: { page, limit: 10 },
        });
        setTransactions(data);
      } catch (error) {
        toast.error('Unable to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Transaction History</h2>

      {loading ? (
        <LoadingState />
      ) : transactions.items.length === 0 ? (
        <EmptyState text="No transactions recorded yet." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Laptop Number</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.items.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-600">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.laptopNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.action === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.purpose || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">
              Previous
            </button>
            <span className="text-sm text-slate-600">Page {transactions.page} of {transactions.totalPages}</span>
            <button type="button" disabled={page >= transactions.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
      <div className="flex items-center gap-3 text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
        Loading...
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
      {text}
    </div>
  );
}

export default App;
