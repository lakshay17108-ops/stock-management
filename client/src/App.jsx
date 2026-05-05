import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Purchase from './pages/Purchase';
import Sales from './pages/Sales';
import Production from './pages/Production';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/production" element={<Production />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
