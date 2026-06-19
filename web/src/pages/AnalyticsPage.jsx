import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Leaf, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
    const { inventory, userDonations, userLocation, setShowDonationModal } = useAppContext();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <div>
            <h2 className="header-title">Sustainability Analytics</h2>
            <p className="header-subtitle">Real-time data visualization of your environmental contribution.</p>
            
            <div className="dashboard-grid">
              <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h3 className="section-title">Smart Waste Prediction & Trends</h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  
                  {/* Left: Alerts */}
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Smart Alerts</h4>
                    {inventory.filter(i => {
                      const days = Math.ceil((new Date(i.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return days > 0 && days <= 5;
                    }).length > 0 ? (
                      inventory.filter(i => {
                        const days = Math.ceil((new Date(i.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return days > 0 && days <= 5;
                      }).slice(0, 3).map((item, idx) => {
                        const days = Math.ceil((new Date(item.expirationDate) - new Date()) / 86400000);
                        return (
                          <div key={idx} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', marginBottom: '0.5rem', borderRadius: '4px' }}>
                            <strong style={{ color: '#ef4444' }}>{item.name} may expire in {days} days.</strong> Consider adding to a zero-waste recipe!
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--accent-green)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--accent-green)' }}>No items expiring soon. Great job!</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Bar Chart */}
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Weekly Food Waste (kg)</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                      {[
                        { week: '3 Wks Ago', value: 4.2, h: '80%' },
                        { week: '2 Wks Ago', value: 3.1, h: '60%' },
                        { week: 'Last Wk', value: 2.0, h: '40%' },
                        { week: 'This Wk', value: 0.5, h: '15%' }
                      ].map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 'bold' }}>{data.value}kg</span>
                          <div style={{ width: '60%', height: data.h, background: idx === 3 ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{data.week}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 className="section-title">
                      <Leaf size={20} color="var(--accent-green)" /> 
                      Emergency Food Donation 
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Have extra food? Request a pickup from a local NGO before it expires.</p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowDonationModal(true)} style={{ background: 'var(--accent-teal)' }}>
                    <Sparkles size={18} /> New Donation Request
                  </button>
                </div>

                {userDonations.length > 0 && (
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Active Donation Tracking</h4>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {userDonations.map((don, i) => (
                        <div key={i} style={{ minWidth: '250px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--accent-green)' }}>{don.ngoName}</strong>
                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--warning)', color: '#000', borderRadius: '10px', fontWeight: 'bold' }}>{don.status}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {don.items.length} items donated
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  {userLocation ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=NGO,food bank near ${userLocation.lat},${userLocation.lng}&z=13&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      <p>Allow location access to view nearby NGOs on the map.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default AnalyticsPage;
