import { useState, useEffect } from 'react';
import { api } from '../api';
import { Factory, Plus, Play, CheckCircle, X } from 'lucide-react';

export default function Production() {
  const [recipes, setRecipes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [produceModal, setProduceModal] = useState(null);
  const [produceQty, setProduceQty] = useState('1');
  const [newRecipe, setNewRecipe] = useState({ finished_item_code: '', ingredients: [{ ingredient_item_code: '', quantity_required: '' }] });

  const load = () => {
    Promise.all([api.getRecipes(), api.getItems()]).then(([r, i]) => {
      setRecipes(r); setItems(i); setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const addIngredient = () => {
    setNewRecipe({ ...newRecipe, ingredients: [...newRecipe.ingredients, { ingredient_item_code: '', quantity_required: '' }] });
  };

  const updateIngredient = (idx, field, val) => {
    const ings = [...newRecipe.ingredients];
    ings[idx][field] = val;
    setNewRecipe({ ...newRecipe, ingredients: ings });
  };

  const removeIngredient = (idx) => {
    if (newRecipe.ingredients.length <= 1) return;
    setNewRecipe({ ...newRecipe, ingredients: newRecipe.ingredients.filter((_, i) => i !== idx) });
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    try {
      await api.createRecipe({
        finished_item_code: newRecipe.finished_item_code,
        ingredients: newRecipe.ingredients.map(i => ({ ingredient_item_code: i.ingredient_item_code, quantity_required: parseInt(i.quantity_required) })),
      });
      setShowAdd(false);
      setNewRecipe({ finished_item_code: '', ingredients: [{ ingredient_item_code: '', quantity_required: '' }] });
      setMsg({ type: 'success', text: 'Recipe created successfully' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleProduce = async () => {
    try {
      const res = await api.produce({ finished_item_code: produceModal.finished_item_code, quantity: parseInt(produceQty) });
      setMsg({ type: 'success', text: res.message });
      setProduceModal(null); setProduceQty('1');
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setTimeout(() => setMsg(null), 4000);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h2>Production Module</h2><p>Manage recipes and produce finished goods</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16}/> New Recipe</button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? <CheckCircle size={16}/> : null}{msg.text}</div>}

      {recipes.length === 0 ? (
        <div className="card"><div className="empty-state"><Factory size={40} style={{ opacity: 0.2, marginBottom: 12 }}/><p>No recipes defined yet. Create one to start production.</p></div></div>
      ) : (
        recipes.map(recipe => (
          <div className="recipe-card" key={recipe.finished_item_code}>
            <div className="recipe-header">
              <div className="recipe-title"><Factory size={18} style={{ color: 'var(--accent)' }}/><span className="item-code">{recipe.finished_item_code}</span>{recipe.finished_name}</div>
              <button className="btn btn-primary btn-sm" onClick={() => setProduceModal(recipe)}><Play size={14}/> Produce</button>
            </div>
            <div className="ingredient-list">
              {recipe.ingredients.map(ing => {
                const sufficient = ing.ingredient_stock >= ing.quantity_required;
                return (
                  <div className="ingredient-row" key={ing.id}>
                    <span><span className="item-code" style={{ marginRight: 8 }}>{ing.ingredient_item_code}</span>{ing.ingredient_name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className="qty">×{ing.quantity_required}</span>
                      <div className="stock-indicator"><div className={`dot ${sufficient ? 'sufficient' : 'insufficient'}`}></div><span style={{ color: sufficient ? 'var(--success)' : 'var(--danger)' }}>Stock: {ing.ingredient_stock}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Create Recipe Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Recipe (BOM)</h3>
              <button className="modal-close" onClick={() => setShowAdd(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateRecipe}>
              <div className="form-group">
                <label className="form-label">Finished Product</label>
                <select className="form-input form-select" required value={newRecipe.finished_item_code} onChange={e => setNewRecipe({ ...newRecipe, finished_item_code: e.target.value })}>
                  <option value="">Select finished product...</option>
                  {items.map(i => <option key={i.item_code} value={i.item_code}>{i.item_code} — {i.name}</option>)}
                </select>
              </div>
              <label className="form-label">Ingredients</label>
              {newRecipe.ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select className="form-input form-select" required value={ing.ingredient_item_code} onChange={e => updateIngredient(idx, 'ingredient_item_code', e.target.value)} style={{ flex: 2 }}>
                    <option value="">Select ingredient...</option>
                    {items.map(i => <option key={i.item_code} value={i.item_code}>{i.item_code} — {i.name}</option>)}
                  </select>
                  <input className="form-input" type="number" min="1" required value={ing.quantity_required} onChange={e => updateIngredient(idx, 'quantity_required', e.target.value)} placeholder="Qty" style={{ flex: 1 }}/>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeIngredient(idx)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addIngredient} style={{ marginTop: 4 }}><Plus size={14}/> Add Ingredient</button>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Recipe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Produce Modal */}
      {produceModal && (
        <div className="modal-overlay" onClick={() => setProduceModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Produce: {produceModal.finished_name}</h3>
              <button className="modal-close" onClick={() => setProduceModal(null)}><X size={18}/></button>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity to Produce</label>
              <input className="form-input" type="number" min="1" value={produceQty} onChange={e => setProduceQty(e.target.value)}/>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Required Ingredients</label>
              {produceModal.ingredients.map(ing => {
                const needed = ing.quantity_required * (parseInt(produceQty) || 0);
                const enough = ing.ingredient_stock >= needed;
                return (
                  <div className="ingredient-row" key={ing.id} style={{ marginBottom: 4 }}>
                    <span>{ing.ingredient_name}</span>
                    <span style={{ color: enough ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{needed} / {ing.ingredient_stock}</span>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setProduceModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleProduce}><Play size={14}/> Execute Production</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
