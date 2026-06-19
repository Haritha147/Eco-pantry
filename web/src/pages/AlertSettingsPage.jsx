import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Bell, AlertTriangle, MessageSquare, ChefHat } from 'lucide-react';

const AlertSettingsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [expiryDays, setExpiryDays] = useState(3);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [donationMatch, setDonationMatch] = useState(true);

  const handleSave = () => {
    showToast('Alert preferences saved successfully!');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Bell color="var(--accent-green)" /> Notification & Alerts
      </h2>
      <p className="header-subtitle">Manage how and when you want to be notified about food freshness.</p>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/profile')}>Profile Info</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/security')}>Change Password</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'var(--accent-green)', color: 'white' }} onClick={() => navigate('/settings/alerts')}>Alert Thresholds</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/ai')}>AI & Voice Config</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/help')}>FAQ & Help</button>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Expiration Window (Days)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="range"
              min="1"
              max="7"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-green)' }}
            />
            <span style={{ fontSize: '1.1rem', minWidth: '40px', fontWeight: 'bold' }}>{expiryDays} days</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', opacity: 0.8 }}>
            Items with remaining shelf life less than or equal to this threshold will trigger "Red Zone" dashboard alerts.
          </p>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--glass-border)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
            />
            <div>
              <strong>Instant Freshness Alerts</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified immediately when items enter the Red Zone.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={donationMatch}
              onChange={(e) => setDonationMatch(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
            />
            <div>
              <strong>NGO Donation Matching</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive alerts when local charities are requesting items you have in excess.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
            />
            <div>
              <strong>Weekly Zero-Waste Summary</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>A weekly email summary of your Eco Points, pantry savings, and carbon offset logs.</div>
            </div>
          </label>
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ marginTop: '1rem', justifyContent: 'center' }}>
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default AlertSettingsPage;
