const API = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Items
  getItems: (params = '') => request(`/items${params ? '?' + params : ''}`),
  getItem: (code) => request(`/items/${encodeURIComponent(code)}`),
  getStats: () => request('/items/stats'),
  getCategories: () => request('/items/categories'),
  createItem: (data) => request('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (code, data) => request(`/items/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Transactions
  getTransactions: (params = '') => request(`/transactions${params ? '?' + params : ''}`),
  purchase: (data) => request('/transactions/purchase', { method: 'POST', body: JSON.stringify(data) }),
  sale: (data) => request('/transactions/sale', { method: 'POST', body: JSON.stringify(data) }),
  broken: (data) => request('/transactions/broken', { method: 'POST', body: JSON.stringify(data) }),

  // Production
  getRecipes: () => request('/production/recipes'),
  createRecipe: (data) => request('/production/recipes', { method: 'POST', body: JSON.stringify(data) }),
  produce: (data) => request('/production/produce', { method: 'POST', body: JSON.stringify(data) }),
};
