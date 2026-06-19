import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Camera, AlertCircle, Clock, Sparkles,
  RefreshCw, LogOut, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const { inventory, shoppingList, currentUser, inventorySearchQuery, setInventorySearchQuery, editingItem, setEditingItem, handleDeleteItem, handleGenerateRecipes } = useAppContext();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <div>
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="header-title">Eco-Pantry</h1>
                <p className="header-subtitle">Your food sustainability command center</p>
              </div>
              {currentUser && (
                <div className="user-greeting">
                  <span>Welcome, <strong>{currentUser.name}</strong></span>
                  <div className="badge-chip"><Award size={14} /> {currentUser.badge} Tier</div>
                </div>
              )}
            </div>
            
            <div className="dashboard-grid">


              <div className="glass-panel horizontal-scroll-container">
                <h3 className="section-title">
                  <Clock size={20} color="var(--warning)" />
                  Expiring Soon
                </h3>
                <div className="horizontal-scroll">
                  {inventory.length > 0 ? [...inventory].sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate)).map((item, index) => {
                     const daysToExpire = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                     let heatClass = 'heat-green';
                     if (daysToExpire <= 3) heatClass = 'heat-red';
                     else if (daysToExpire <= 7) heatClass = 'heat-yellow';
                     
                     return (
                        <div key={index} className={`item-card ${heatClass}`}>
                          <div className="item-icon-wrapper">
                            {daysToExpire <= 3 ? <AlertCircle size={20} /> : <Clock size={20} />}
                          </div>
                          <div className="item-name">{item.name}</div>
                          <div className="item-expiry">Expires in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}</div>
                        </div>
                     )
                  }) : (
                     <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No items. Scan your fridge to begin!</div>
                  )}
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" onClick={() => { navigate('/recipes'); handleGenerateRecipes(); }}>
                    <Sparkles size={18} />
                    Auto-Generate Recipes
                  </button>
                  <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} onClick={() => { navigate('/scanner'); }}>
                    <Camera size={18} />
                    Scan New Items
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="section-title">My Eco-Pantry</h3>
                  <input 
                    type="text" 
                    placeholder="Search pantry..." 
                    className="input-field" 
                    style={{ width: '250px' }} 
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                  />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>View, search, edit, and delete your scanned items.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {inventory
                    .filter(i => i.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || i.category.toLowerCase().includes(inventorySearchQuery.toLowerCase()))
                    .map((item, index) => {
                      const daysToExpire = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={index} className="item-card" style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                             <div className="item-name">{item.name}</div>
                             <div style={{ display: 'flex', gap: '0.5rem' }}>
                               <button onClick={() => setEditingItem(item)} style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer' }} title="Edit"><RefreshCw size={14} /></button>
                               <button onClick={() => handleDeleteItem(item._id || item.id, item.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><LogOut size={14} /></button>
                             </div>
                          </div>
                          <div className="item-expiry" style={{ marginTop: '0.5rem' }}>Expires in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{item.category}</div>
                        </div>
                      )
                    })
                  }
                  {inventory.length > 0 && inventory.filter(i => i.name.toLowerCase().includes(inventorySearchQuery.toLowerCase())).length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No items match your search.</div>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 12' }}>
                <h3 className="section-title">Smart Grocery Anti-List</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Prevents duplicate buying by cross-referencing your scanned fridge items.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {shoppingList.map((item, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: item.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: item.inStock ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: item.inStock ? 'line-through' : 'none',
                      border: item.inStock ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      {item.name}
                      {item.inStock && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>IN STOCK</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default DashboardPage;
