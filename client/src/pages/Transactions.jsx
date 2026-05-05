import { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, ArrowUpRight, ArrowDownRight, Trash2, CheckCircle } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === 'addition') params.set('direction', 'addition');
    else if (filter === 'subtraction') params.set('direction', 'subtraction');
    else if (filter !== 'all') params.set('type', filter);
    if (search) params.set('item_code', search);
    api.getTransactions(params.toString()).then(setTransactions).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, search]);

  const handleDelete = async (id) => {
    if (!confirm(`Delete transaction #${id}? This will reverse its stock effect.`)) return;
    try {
      await api.deleteTransaction(id);
      setMsg({ type: 'success', text: 'Transaction deleted and stock adjusted' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setTimeout(() => setMsg(null), 3000);
  };

  const fmt = (v) => '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0 });
  const typeBadge = (type) => {
    const map = { Purchase: 'badge-success', Sale: 'badge-info', Broken: 'badge-danger', Production: 'badge-purple' };
    return <span className={`badge ${map[type] || 'badge-neutral'}`}>{type}</span>;
  };
  const isAddition = (type) => ['Purchase', 'Production'].includes(type);

  return (
    <div>
      <div className="page-header"><h2>Transactions</h2><p>Chronological log of all stock movements</p></div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? <CheckCircle size={16}/> : null}{msg.text}</div>}

      <div className="search-filter-bar">
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input className="form-input" placeholder="Search by Item Code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          {[
            { key: 'all', label: 'All' },
            { key: 'addition', label: '↑ Additions' },
            { key: 'subtraction', label: '↓ Subtractions' },
            { key: 'Purchase', label: 'Purchases' },
            { key: 'Sale', label: 'Sales' },
            { key: 'Broken', label: 'Broken' },
            { key: 'Production', label: 'Production' },
          ].map(f => (
            <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Item Code</th><th>Item Name</th><th>Type</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Service</th><th>Notes</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="11"><div className="empty-state"><p>No transactions found</p></div></td></tr>
              ) : transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{t.id}</td>
                  <td><span className="item-code">{t.item_code}</span></td>
                  <td>{t.item_name}</td>
                  <td>{typeBadge(t.transaction_type)}</td>
                  <td>
                    <span className={`amount ${isAddition(t.transaction_type) ? 'amount-positive' : 'amount-negative'}`}>
                      {isAddition(t.transaction_type) ? <><ArrowUpRight size={14} /> +{t.quantity}</> : <><ArrowDownRight size={14} /> -{t.quantity}</>}
                    </span>
                  </td>
                  <td className="amount">{fmt(t.unit_price)}</td>
                  <td className="amount">{fmt(t.total_amount)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.service_charge > 0 ? fmt(t.service_charge) : '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(t.id)} title="Delete transaction" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
