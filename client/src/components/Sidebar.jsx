import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowRightLeft, ShoppingCart, Receipt, Factory, Database } from 'lucide-react';

const navItems = [
  { section: 'Overview', items: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Inventory', items: [
    { path: '/inventory', icon: Package, label: 'Stock Master' },
    { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  ]},
  { section: 'Operations', items: [
    { path: '/purchase', icon: ShoppingCart, label: 'Purchase Entry' },
    { path: '/sales', icon: Receipt, label: 'Sales / Billing' },
    { path: '/production', icon: Factory, label: 'Production' },
  ]},
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><Database size={20} /></div>
        <div>
          <h1>StockFlow</h1>
          <p>Inventory Management</p>
        </div>
      </div>

      {navItems.map((section) => (
        <div className="sidebar-section" key={section.section}>
          <div className="sidebar-section-title">{section.section}</div>
          <nav className="sidebar-nav">
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="icon" size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-dot"></div>
          <span className="sidebar-footer-text">System Online — v1.0</span>
        </div>
      </div>
    </aside>
  );
}
