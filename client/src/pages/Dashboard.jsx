import { useState, useEffect } from 'react';
import { api } from '../api';
import { TrendingUp, Package, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!stats) return <div className="empty-state"><p>Failed to load dashboard data</p></div>;

  const fmt = (v) => '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0 });

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Real-time overview of your inventory operations</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon green"><DollarSign size={20} /></div>
          <div className="kpi-value">{fmt(stats.totalStockValue)}</div>
          <div className="kpi-label">Total Stock Value</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><TrendingUp size={20} /></div>
          <div className="kpi-value">{fmt(stats.totalRevenue)}</div>
          <div className="kpi-label">Total Revenue</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><Package size={20} /></div>
          <div className="kpi-value">{stats.totalItems}</div>
          <div className="kpi-label">Total Items</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange"><AlertTriangle size={20} /></div>
          <div className="kpi-value">{stats.lowStockCount}</div>
          <div className="kpi-label">Low Stock Alerts</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Sales</div>
            </div>
            <span className="badge badge-info">Last 10</span>
          </div>
          {stats.recentSales.length === 0 ? (
            <div className="empty-state"><p>No sales recorded yet</p></div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Amount</th><th>Service</th></tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="item-code">{s.item_code}</span>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.item_name}</div>
                      </td>
                      <td><span className="amount amount-negative"><ArrowDownRight size={14} /> {s.quantity}</span></td>
                      <td className="amount">{fmt(s.total_amount)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.service_charge > 0 ? fmt(s.service_charge) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Low Stock Alerts</div>
            </div>
            <span className="badge badge-warning">{stats.lowStockItems.length} items</span>
          </div>
          {stats.lowStockItems.length === 0 ? (
            <div className="empty-state"><p>All stock levels are healthy</p></div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Stock</th><th>Reorder At</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {stats.lowStockItems.map((item) => (
                    <tr key={item.item_code}>
                      <td>
                        <span className="item-code">{item.item_code}</span>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.name}</div>
                      </td>
                      <td className="amount">{item.stock_qty}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.reorder_level}</td>
                      <td>
                        {item.stock_qty === 0
                          ? <span className="badge badge-danger">Out of Stock</span>
                          : <span className="badge badge-warning">Low Stock</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
