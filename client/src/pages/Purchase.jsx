import { useState, useEffect } from 'react';
import { api } from '../api';
import { ShoppingCart, Plus, CheckCircle } from 'lucide-react';

export default function Purchase() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_code: '', quantity: '', unit_price: '', supplier: '', notes: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItem, setNewItem] = useState({ item_code: '', name: '', category: 'General', unit_price: '', reorder_level: '10' });
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => { api.getItems().then(setItems); }, []);

  const handleCodeChange = (val) => {
    const upper = val.toUpperCase();
    setForm({ ...form, item_code: upper });
    if (upper.length > 0) {
      const filtered = items.filter(i => i.item_code.includes(upper) || i.name.toUpperCase().includes(upper));
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
    const match = items.find(i => i.item_code === upper);
    if (match) {
      setSelectedItem(match);
      setForm(f => ({ ...f, unit_price: match.unit_price.toString() }));
    } else {
      setSelectedItem(null);
    }
  };

  const selectSuggestion = (item) => {
    setForm({ ...form, item_code: item.item_code, unit_price: item.unit_price.toString() });
    setSelectedItem(item);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.purchase({
        item_code: form.item_code,
        quantity: parseInt(form.quantity),
        unit_price: parseFloat(form.unit_price),
        supplier: form.supplier,
        notes: form.notes,
      });
      setMsg({ type: 'success', text: `${res.message}. New stock level: ${res.newStockLevel}` });
      setForm({ item_code: '', quantity: '', unit_price: '', supplier: '', notes: '' });
      setSelectedItem(null);
      api.getItems().then(setItems);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setLoading(false);
    setTimeout(() => setMsg(null), 4000);
  };

  const handleNewItem = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createItem({
        ...newItem,
        unit_price: parseFloat(newItem.unit_price) || 0,
        reorder_level: parseInt(newItem.reorder_level) || 10,
      });
      setShowNewItem(false);
      setForm({ ...form, item_code: created.item_code, unit_price: created.unit_price.toString() });
      setSelectedItem(created);
      setNewItem({ item_code: '', name: '', category: 'General', unit_price: '', reorder_level: '10' });
      api.getItems().then(setItems);
      setMsg({ type: 'success', text: 'New item created! Now fill in purchase details.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const fmt = (v) => '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const total = form.quantity && form.unit_price ? parseFloat(form.quantity) * parseFloat(form.unit_price) : 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Purchase Entry</h2>
          <p>Add new stock to your inventory</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowNewItem(true)}>
          <Plus size={16} /> Register New Item
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? <CheckCircle size={16} /> : null}{msg.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><ShoppingCart size={18} style={{ marginRight: 8 }} />Purchase Details</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Item Code (SKU)</label>
              <input className="form-input" required value={form.item_code} onChange={e => handleCodeChange(e.target.value)} placeholder="Type to search items..." autoComplete="off" />
              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', zIndex: 10, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {suggestions.map(s => (
                    <div key={s.item_code} onClick={() => selectSuggestion(s)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}>
                      <span><span className="item-code">{s.item_code}</span> <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>{s.name}</span></span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Stock: {s.stock_qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="1" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (₹)</label>
                <input className="form-input" type="number" step="0.01" min="0" required value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <input className="form-input" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional remarks..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Total: <span className="amount" style={{ fontSize: 20, color: 'var(--text-primary)', marginLeft: 8 }}>{fmt(total)}</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Record Purchase'}</button>
            </div>
          </form>
        </div>

        <div>
          {selectedItem ? (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Item Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Code</span><div><span className="item-code">{selectedItem.item_code}</span></div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Name</span><div style={{ fontWeight: 600 }}>{selectedItem.name}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Category</span><div style={{ color: 'var(--text-secondary)' }}>{selectedItem.category}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Current Stock</span><div className="kpi-value" style={{ fontSize: 24 }}>{selectedItem.stock_qty}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Unit Price</span><div className="amount">{fmt(selectedItem.unit_price)}</div></div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state" style={{ padding: 32 }}>
                <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p>Select an item to see details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Item Modal */}
      {showNewItem && (
        <div className="modal-overlay" onClick={() => setShowNewItem(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Item</h3>
              <button className="modal-close" onClick={() => setShowNewItem(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleNewItem}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Item Code</label>
                  <input className="form-input" required value={newItem.item_code} onChange={e => setNewItem({ ...newItem, item_code: e.target.value.toUpperCase() })} placeholder="e.g. RAW-006" />
                </div>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price</label>
                  <input className="form-input" type="number" step="0.01" value={newItem.unit_price} onChange={e => setNewItem({ ...newItem, unit_price: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewItem(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
