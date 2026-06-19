import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Activity, Table, Info, BookOpen, Heart, Clock, Award, HelpCircle, 
  MapPin, Clipboard, Flame, BarChart2, Share2, Compass, AlertCircle, 
  Sparkles, CheckSquare, Trash2, Send, Plus, Search, MapPinCheck 
} from 'lucide-react';

const GenericSubPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const path = location.pathname;
  const { 
    inventory, handleDeleteItem, shoppingList, setShoppingList, showToast, recipes, 
    currentUser, awardPoints, chatMessages, setChatMessages 
  } = useAppContext();

  // Local states
  const [shoppingInput, setShoppingInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  // 1. Audit & Activity Logs
  if (path === '/dashboard/audit') {
    const logs = [
      { id: 1, user: 'Aharitha', action: 'Uploaded Receipt Scan', item: 'Milk & Apples', points: '+50 points', time: '10 mins ago' },
      { id: 2, user: 'Eco Chef', action: 'Marked Preserved', item: 'Spinach', points: '+30 points', time: '1 hour ago' },
      { id: 3, user: 'Aharitha', action: 'Cooked zero-waste recipe', item: 'Veggie Stir Fry', points: '+100 points', time: '4 hours ago' },
      { id: 4, user: 'System', action: 'Auto-expiring warning', item: 'Bananas entering Red Zone', points: '', time: 'Yesterday' }
    ];
    return (
      <div>
        <h2 className="header-title"><Activity color="var(--accent-teal)" /> Family Activity & Audit Logs</h2>
        <p className="header-subtitle">Real-time logs of food management actions across your household.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <strong>{log.user}</strong> <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span> - <span style={{ color: 'var(--accent-teal)' }}>{log.item}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{log.time}</div>
                </div>
                <div style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{log.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Pantry Inventory List
  if (path === '/inventory') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="header-title"><Table color="var(--accent-green)" /> Detailed Pantry Inventory</h2>
            <p className="header-subtitle">Comprehensive tabular view of all food items registered.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/scanner')}>
            <Plus size={16} /> Scan New
          </button>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                <th style={{ padding: '1rem 0.5rem' }}>Category</th>
                <th style={{ padding: '1rem 0.5rem' }}>Quantity</th>
                <th style={{ padding: '1rem 0.5rem' }}>Expires On</th>
                <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{item.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}><span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.85rem' }}>{item.category}</span></td>
                  <td style={{ padding: '1rem 0.5rem' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '1rem 0.5rem', color: new Date(item.expirationDate) < new Date() ? 'var(--warning)' : 'white' }}>
                    {new Date(item.expirationDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--accent-green)', marginRight: '1rem', cursor: 'pointer' }} onClick={() => navigate(`/inventory/${item._id}`)}>View</button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--warning)', cursor: 'pointer' }} onClick={() => handleDeleteItem(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 3. Food Item Details
  if (path.startsWith('/inventory/')) {
    const item = inventory.find(i => i._id === id) || { name: 'Sample Item', category: 'Produce', quantity: 2, expirationDate: new Date(), preservationTip: 'Store in airtight container.' };
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><Info color="var(--accent-teal)" /> Item Details</h2>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{item.category}</span>
            <h1 style={{ margin: '0.25rem 0', fontSize: '2rem' }}>{item.name}</h1>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quantity</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{item.quantity || 1} units</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expires On</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{new Date(item.expirationDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-green)' }}>
            <strong>Preservation Tip:</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', lineHeight: '1.4' }}>{item.preservationTip}</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/inventory')} style={{ alignSelf: 'flex-start' }}>Back to List</button>
        </div>
      </div>
    );
  }

  // 4. Receipt Scanner View
  if (path === '/scanner/receipt') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><Compass color="var(--accent-green)" /> Receipt Photo OCR</h2>
        <p className="header-subtitle">Extract and register food items from grocery checkout paper receipts.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '3rem', cursor: 'pointer', marginBottom: '1.5rem' }} onClick={() => navigate('/scanner')}>
            <Share2 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Upload checkout receipt image or PDF</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/scanner')} style={{ margin: '0 auto' }}>Navigate to Scanner</button>
        </div>
      </div>
    );
  }

  // 5. Fridge Scanner View
  if (path === '/scanner/fridge') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><Compass color="var(--accent-teal)" /> Fridge Object Detection</h2>
        <p className="header-subtitle">Detect fresh ingredients directly from a picture of your open fridge.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '3rem', cursor: 'pointer', marginBottom: '1.5rem' }} onClick={() => navigate('/scanner')}>
            <Sparkles size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Upload photo of open fridge shelves</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/scanner')} style={{ margin: '0 auto' }}>Navigate to Scanner</button>
        </div>
      </div>
    );
  }

  // 6. AR Tag Viewer
  if (path === '/scanner/ar') {
    return (
      <div>
        <h2 className="header-title"><Sparkles color="var(--accent-green)" /> AR Tag Overlay Simulation</h2>
        <p className="header-subtitle">Simulated Augmented Reality tags mapping detected ingredients in 3D space.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <Flame size={64} style={{ animation: 'bounce 2s infinite', color: 'var(--accent-green)', marginBottom: '1.5rem' }} />
          <h3>Simulated AR Camera View</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center', marginTop: '0.5rem' }}>Upload an image on the scanner tab first to view overlays of tags matching locations on your ingredients.</p>
          <button className="btn-primary" onClick={() => navigate('/scanner')} style={{ marginTop: '1.5rem' }}>Upload Image</button>
        </div>
      </div>
    );
  }

  // 7. Voice Command Logs
  if (path === '/scanner/voice') {
    const speechLogs = [
      { id: 1, text: "Add 2 bananas and 1 yogurt pack", parsed: "Intent: ADD_ITEM", status: "Processed" },
      { id: 2, text: "What is expiring in my fridge?", parsed: "Intent: CHECK_EXPIRY", status: "Answered" },
      { id: 3, text: "Add eggs to shopping list", parsed: "Intent: ADD_SHOPPING", status: "Added" }
    ];
    return (
      <div>
        <h2 className="header-title"><Clock color="var(--accent-teal)" /> Voice Assistant Command History</h2>
        <p className="header-subtitle">Review transcripts and intents parsed by Llama from your speech inputs.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {speechLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <strong>"{log.text}"</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', marginTop: '0.25rem' }}>{log.parsed}</div>
                </div>
                <div style={{ color: 'var(--accent-green)' }}>{log.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 8. Saved Recipes
  if (path === '/recipes/saved') {
    return (
      <div>
        <h2 className="header-title"><Heart color="var(--warning)" /> Saved Recipes Bookmark</h2>
        <p className="header-subtitle">Your bookmarked zero-waste AI recipes for quick access.</p>
        <div className="recipe-grid" style={{ marginTop: '1.5rem' }}>
          {recipes.slice(0, 2).map((recipe, index) => (
            <div key={index} className="glass-panel recipe-card">
              <h3 style={{ fontSize: '1.2rem' }}>{recipe.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{recipe.description}</p>
              <button className="btn-primary" onClick={() => navigate('/recipes')} style={{ marginTop: 'auto' }}>View Steps</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. Cooking History Logs
  if (path === '/recipes/history') {
    const cooks = [
      { id: 1, title: 'Zero-Waste Veggie Stir Fry', date: 'June 15, 2026', savings: '₹120 saved', points: '+100 Eco Points' },
      { id: 2, title: 'Leftover Potato Hash', date: 'June 10, 2026', savings: '₹80 saved', points: '+100 Eco Points' }
    ];
    return (
      <div>
        <h2 className="header-title"><Clock color="var(--accent-green)" /> Cooked Recipes Log</h2>
        <p className="header-subtitle">History of zero-waste recipes cooked and sustainability points claimed.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          {cooks.map(cook => (
            <div key={cook.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <strong>{cook.title}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cooked on {cook.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>{cook.savings}</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>{cook.points}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 10. Cooking Step-by-Step
  if (path.startsWith('/recipes/')) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><BookOpen color="var(--accent-teal)" /> Dynamic Recipe Directions</h2>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <h3>Zero-Waste Veggie Delight</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>Step 1 of 4: Chop all fresh items nearing expiration into uniform slices.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => showToast('Directions completed!')}>Next Step</button>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/recipes')}>Back to Recipes</button>
          </div>
        </div>
      </div>
    );
  }

  // 11. Shopping List
  if (path === '/shopping-list') {
    const handleAdd = (e) => {
      e.preventDefault();
      if (!shoppingInput.trim()) return;
      setShoppingList(prev => [...prev, { name: shoppingInput, inStock: false }]);
      setShoppingInput('');
      showToast('Item added to shopping list!');
    };

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><CheckSquare color="var(--accent-green)" /> Collaborative Grocery Shopping List</h2>
        <p className="header-subtitle">Anti-list containing items you need to restock.</p>

        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              className="settings-input" 
              style={{ flex: 1 }}
              placeholder="Add needed grocery item..."
              value={shoppingInput}
              onChange={e => setShoppingInput(e.target.value)}
            />
            <button className="btn-primary" type="submit"><Plus size={18} /></button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {shoppingList.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <span>{item.name}</span>
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--warning)', cursor: 'pointer' }}
                  onClick={() => {
                    setShoppingList(prev => prev.filter((_, idx) => idx !== i));
                    showToast('Item removed.');
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 12. Carbon Footprint reports
  if (path === '/analytics/co2') {
    return (
      <div>
        <h2 className="header-title"><BarChart2 color="var(--accent-green)" /> Carbon Footprint Reports</h2>
        <p className="header-subtitle">Monthly breakdown of carbon offsets and environmental contribution.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-green)' }}>14.8 kg</div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>CO₂ Saved This Month</span>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-teal)' }}>3.2 kg</div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Water Footprint Saved</span>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning)' }}>24 units</div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Landfill Units Diverted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 13. Waste Log
  if (path === '/analytics/waste') {
    return (
      <div>
        <h2 className="header-title"><BarChart2 color="var(--warning)" /> Food Waste Log & Auditing</h2>
        <p className="header-subtitle">Visual details tracking food that spoiled vs food successfully consumed.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-green)' }}>
            <span><strong>Food Saved / Consumed</strong></span>
            <span>88% (42 items)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
            <span><strong>Food Spoiled / Discarded</strong></span>
            <span>12% (6 items)</span>
          </div>
        </div>
      </div>
    );
  }

  // 14. NGO Bank Directory
  if (path === '/donations/ngos') {
    const ngosList = [
      { name: 'Eco-Pantry Rescue Alliance', address: '1.4 km, Community Food Bank' },
      { name: 'Robin Hood Rescue Kitchen', address: '2.8 km, Soup Kitchen' },
      { name: 'Care Home & Shelter', address: '4.2 km, Homeless Shelter' }
    ];
    return (
      <div>
        <h2 className="header-title"><MapPin color="var(--accent-teal)" /> NGO Partner Directory</h2>
        <p className="header-subtitle">Locate local organizations that accept surplus pantry donations.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ngosList.map((ngo, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{ngo.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ngo.address}</div>
                </div>
                <button className="btn-primary" onClick={() => showToast(`Contacting ${ngo.name}...`)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Contact</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 15. Donation History
  if (path === '/donations/history') {
    return (
      <div>
        <h2 className="header-title"><Clipboard color="var(--accent-green)" /> Food Donation History</h2>
        <p className="header-subtitle">Log of your past surplus ingredient donations and verification letters.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <strong>3 Apples & 1 Bread Loaf</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Donated to Care Home & Shelter on June 12, 2026</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>Status: Picked Up & Verified</span>
          </div>
        </div>
      </div>
    );
  }

  // 16. Family Chat
  if (path === '/community/chat') {
    const handleSend = (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      setChatMessages(prev => [...prev, { text: chatInput, role: 'user' }]);
      setChatInput('');
      setTimeout(() => {
        setChatMessages(prev => [...prev, { text: "Got it! Your family has been updated about the pantry.", role: 'bot' }]);
      }, 1000);
    };

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><Share2 color="var(--accent-teal)" /> Family Messaging Board</h2>
        <p className="header-subtitle">Send alerts or announcements about pantry updates directly to your group.</p>
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {chatMessages.slice(-5).map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '80%', fontSize: '0.95rem' }}>
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="settings-input"
              style={{ flex: 1 }}
              placeholder="Send alert to family..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button className="btn-primary" type="submit"><Send size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

  // 17. Shared Scans Log
  if (path === '/community/scans') {
    return (
      <div>
        <h2 className="header-title"><Compass color="var(--accent-green)" /> Family Shared Scans Log</h2>
        <p className="header-subtitle">Inspect receipt and shelf photo scans registered by all household members.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <strong>Aharitha uploaded: local-tensorflow-scan.jpg</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scanned on June 18, 2026</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-teal)' }}>Added: Apples, Milk</span>
          </div>
        </div>
      </div>
    );
  }

  // 18. Badges & Levels Guide
  if (path === '/community/badges') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="header-title"><Award color="var(--warning)" /> Badge Milestones & Rewards</h2>
        <p className="header-subtitle">Discover active Eco-Badge levels and unlock new reward tiers.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🌱</div>
            <div>
              <strong>Adopter Tier (150+ points)</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unlocked by completing signup and verifying your profile.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>⚡</div>
            <div>
              <strong>Waste Hero Tier (200+ points)</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unlocked by completing zero-waste recipes and avoiding items expiration.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>👑</div>
            <div>
              <strong>Sustainability Legend Tier (500+ points)</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>The highest badge rank for flawless zero-waste food preservation auditing.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 19. FAQ Help Center
  if (path === '/help') {
    return (
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <h2 className="header-title"><HelpCircle color="var(--accent-teal)" /> FAQ & Help Center</h2>
        <p className="header-subtitle">Find answers to basic questions about food sustainability tracking.</p>
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <strong>How do I earn Eco Points?</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Scan new grocery receipts (+50 pts), generate zero-waste recipe options (+30 pts), or mark ingredients as cooked instead of throwing them out (+20 pts).
            </p>
          </div>
          <div>
            <strong>How does Groq Vision scan receipts?</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              When you upload a receipt photo on the scanner page, Groq's multimodal Llama vision model identifies written text, extracts food names, confidence scores, and shelf lives automatically.
            </p>
          </div>
          <div>
            <strong>Can I connect multiple devices?</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Yes! Share your 6-character Family Code (found in your profile settings) with household members to sync your pantry catalog in real-time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <AlertCircle size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
      <h3>View Not Found</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>The requested sub-screen route path does not exist.</p>
      <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem', margin: '1rem auto 0 auto' }}>Back to Dashboard</button>
    </div>
  );
};

export default GenericSubPage;
