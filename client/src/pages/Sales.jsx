import { useState, useEffect } from 'react';
import { api } from '../api';
import { Receipt, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Sales() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_code: '', quantity: '', unit_price: '', service_charge: '0', notes: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => { api.getItems().then(setItems); }, []);

  const handleCodeChange = (val) => {
    const upper = val.toUpperCase();
    setForm({ ...form, item_code: upper });
    if (upper.length > 0) {
      setSuggestions(items.filter(i => i.item_code.includes(upper) || i.name.toUpperCase().includes(upper)).slice(0, 6));
    } else { setSuggestions([]); }
    const match = items.find(i => i.item_code === upper);
    if (match) { setSelectedItem(match); setForm(f => ({ ...f, unit_price: match.unit_price.toString() })); }
    else { setSelectedItem(null); }
  };

  const selectSuggestion = (item) => {
    setForm({ ...form, item_code: item.item_code, unit_price: item.unit_price.toString() });
    setSelectedItem(item); setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.sale({ item_code: form.item_code, quantity: parseInt(form.quantity), unit_price: parseFloat(form.unit_price), service_charge: parseFloat(form.service_charge) || 0, notes: form.notes });
      setMsg({ type: 'success', text: `${res.message}. Grand Total: ₹${res.grandTotal.toLocaleString('en-IN')}` });
      setForm({ item_code: '', quantity: '', unit_price: '', service_charge: '0', notes: '' });
      setSelectedItem(null); api.getItems().then(setItems);
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setLoading(false); setTimeout(() => setMsg(null), 4000);
  };

  const fmt = (v) => '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const subtotal = form.quantity && form.unit_price ? parseFloat(form.quantity) * parseFloat(form.unit_price) : 0;
  const svcCharge = parseFloat(form.service_charge) || 0;
  const grandTotal = subtotal + svcCharge;
  const qtyExceedsStock = selectedItem && form.quantity && parseInt(form.quantity) > selectedItem.stock_qty;

  return (
    <div>
      <div className="page-header"><h2>Sales / Billing</h2><p>Record sales transactions and service charges</p></div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}{msg.text}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div className="card">
          <div className="card-header"><div className="card-title"><Receipt size={18} style={{ marginRight: 8 }}/>Sale Details</div></div>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Item Code (SKU)</label>
              <input className="form-input" required value={form.item_code} onChange={e => handleCodeChange(e.target.value)} placeholder="Type to search..." autoComplete="off"/>
              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', zIndex: 10, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {suggestions.map(s => (
                    <div key={s.item_code} onClick={() => selectSuggestion(s)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                      <span><span className="item-code">{s.item_code}</span> <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>{s.name}</span></span>
                      <span style={{ color: s.stock_qty === 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: 12 }}>Stock: {s.stock_qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="1" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" style={qtyExceedsStock ? { borderColor: 'var(--danger)' } : {}}/>
                {qtyExceedsStock && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>Exceeds available stock ({selectedItem.stock_qty})</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (₹)</label>
                <input className="form-input" type="number" step="0.01" min="0" required value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Service Charges (₹)</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.service_charge} onChange={e => setForm({ ...form, service_charge: e.target.value })} placeholder="0.00"/>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Labor, installation, or non-tangible costs</div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Client name, order reference..."/>
            </div>
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}><span>Subtotal</span><span className="amount">{fmt(subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}><span>Service Charges</span><span className="amount">{fmt(svcCharge)}</span></div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16 }}><span style={{ fontWeight: 600 }}>Grand Total</span><span className="amount" style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt(grandTotal)}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={loading || qtyExceedsStock}>{loading ? 'Processing...' : 'Record Sale'}</button>
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
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Available Stock</span><div className="kpi-value" style={{ fontSize: 24, color: selectedItem.stock_qty <= selectedItem.reorder_level ? 'var(--warning)' : 'var(--success)' }}>{selectedItem.stock_qty}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Unit Price</span><div className="amount">{fmt(selectedItem.unit_price)}</div></div>
              </div>
            </div>
          ) : (
            <div className="card"><div className="empty-state" style={{ padding: 32 }}><Receipt size={32} style={{ opacity: 0.2, marginBottom: 12 }}/><p>Select an item to see details</p></div></div>
          )}
        </div>
      </div>
    </div>
  );
}
