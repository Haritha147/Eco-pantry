import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Sparkles, Settings, ChefHat, LogOut, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { currentUser, inventory = [], recipes = [], handleProfileUpdate, handleLogout } = useAppContext();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState('None');
    const [householdSize, setHouseholdSize] = useState(2);
    const [picturePreview, setPicturePreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (!currentUser) return;
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setDietaryRestrictions(currentUser.dietaryRestrictions || 'None');
      setHouseholdSize(currentUser.householdSize || 2);
      setPicturePreview(currentUser.picture || null);
    }, [currentUser]);

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <div>
            <h2 className="header-title">User Profile & AI settings</h2>
            <p className="header-subtitle">Manage your personal credentials, eco status, and dietary recommendations.</p>
            
            <div className="profile-dashboard-grid">
              {/* Left Column: Stats & Badge Card */}
              <div className="glass-panel profile-summary-card">
                <div className="avatar-wrapper">
                  <div className="profile-large-avatar">
                    {picturePreview ? (
                      <img src={picturePreview} alt={currentUser.name} />
                    ) : (currentUser.picture ? (
                      <img src={currentUser.picture} alt={currentUser.name} />
                    ) : (
                      currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
                    ))}
                  </div>
                  <div className="glow-ring"></div>
                </div>

                <h2 className="profile-name">{currentUser.name}</h2>
                <p className="profile-email">{currentUser.email}</p>
                <div className="badge-tier-banner">
                  <Award size={18} />
                  <span>{currentUser.badge} Level Member</span>
                </div>

                <div className="profile-points-progress">
                  <div className="progress-labels">
                    <span>Points: {currentUser.points}</span>
                    <span>Next Rank: 500</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (currentUser.points / 500) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="stats-row">

                  <div className="stat-box">
                    <Sparkles size={20} color="var(--warning)" />
                    <span className="stat-val">{currentUser.points}</span>
                    <span className="stat-lbl">Eco Points</span>
                  </div>
                  <div className="stat-box">
                    <ChefHat size={20} color="var(--accent-teal)" />
                    <span className="stat-val">{inventory.length}</span>
                    <span className="stat-lbl">Pantry Items</span>
                  </div>
                </div>

                <div className="achievements-section">
                  <h4 className="achievements-title">Eco Badges Earned</h4>
                  <div className="achievements-grid">
                    <div className={`achievement-badge-card ${currentUser.points >= 150 ? 'active' : ''}`} title="Early Adopter: Complete signup & verification">
                      <div className="badge-icon">🌱</div>
                      <span>Adopter</span>
                    </div>
                    <div className={`achievement-badge-card ${currentUser.points >= 200 ? 'active' : ''}`} title="Zero-Waste Hero: Accumulate 200+ eco points">
                      <div className="badge-icon">⚡</div>
                      <span>Hero</span>
                    </div>
                    <div className={`achievement-badge-card ${inventory.length > 2 ? 'active' : ''}`} title="Pantry Master: Keep active pantry digitized">
                      <div className="badge-icon">📦</div>
                      <span>Pantry</span>
                    </div>
                    <div className={`achievement-badge-card ${recipes.length > 0 ? 'active' : ''}`} title="Green Chef: Generate Zero-Waste recipes">
                      <div className="badge-icon">🍳</div>
                      <span>Chef</span>
                    </div>
                  </div>
                </div>

                <button className="btn-logout" onClick={handleLogout}>
                  <LogOut size={16} /> Logout Account
                </button>
              </div>

              {/* Right Column: Update Preferences & AI System prompts */}
              <div className="glass-panel profile-settings-card">
                <h3 className="section-title" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  <Settings size={20} color="var(--accent-green)" />
                  Account Settings
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'var(--accent-green)', color: 'white' }} onClick={() => navigate('/settings/profile')}>Profile Info</button>
                  <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/security')}>Change Password</button>
                  <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/alerts')}>Alert Thresholds</button>
                  <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/ai')}>AI & Voice Config</button>
                  <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/help')}>FAQ & Help</button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    await handleProfileUpdate({ name, email, dietaryRestrictions, householdSize });
                  } finally {
                    setSaving(false);
                  }
                }} className="settings-form">
                  
                  <div className="input-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      name="profileName" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="settings-input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="profileEmail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="settings-input"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn-primary" type="submit" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Account Info'}
                    </button>
                    <label className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      Change Avatar
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                        const f = e.target.files && e.target.files[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = reader.result;
                          setPicturePreview(dataUrl);
                          handleProfileUpdate({ picture: dataUrl });
                        };
                        reader.readAsDataURL(f);
                      }} />
                    </label>
                  </div>
                </form>

                <h3 className="section-title" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', margin: '2rem 0 1.5rem 0' }}>
                  <Sparkles size={20} color="var(--accent-teal)" />
                  AI Preferences & Prompts
                </h3>

                <div className="preferences-settings" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dietary Restriction</label>
                    <select 
                      value={dietaryRestrictions}
                      onChange={(e) => { setDietaryRestrictions(e.target.value); handleProfileUpdate({ dietaryRestrictions: e.target.value }); }}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}
                    >
                      <option value="None">None</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Keto">Keto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Household Size</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {[1, 2, 3].map((size) => (
                        <button 
                          key={size}
                          className="btn-primary" 
                          style={{ 
                            flex: 1, 
                            background: (householdSize || 2) === size ? 'var(--accent-green)' : 'rgba(16, 185, 129, 0.2)' 
                          }}
                          onClick={() => { setHouseholdSize(size); handleProfileUpdate({ householdSize: size }); }}
                        >
                          {size === 3 ? '3+' : size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>LLM System Prompt Preview</label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8, marginBottom: '0.5rem' }}>This instruction is passed to Groq AI during Zero-Waste recipe generation:</p>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--accent-teal)' }}>
                      <code style={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                        {`"Ensure all generated recipes are 100% ${dietaryRestrictions || 'None'} and scaled exactly for ${householdSize || 2} portions. Prioritize expiring vegetables first."`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default ProfilePage;
