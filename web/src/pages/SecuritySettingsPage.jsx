import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';

const SecuritySettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAppContext();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.msg || 'Failed to change password', 'error');
      }
    } catch (err) {
      showToast('Server connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lock color="var(--accent-green)" /> Security & Password
      </h2>
      <p className="header-subtitle">Ensure your account credentials are secure.</p>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/profile')}>Profile Info</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'var(--accent-green)', color: 'white' }} onClick={() => navigate('/settings/security')}>Change Password</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/alerts')}>Alert Thresholds</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/ai')}>AI & Voice Config</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/help')}>FAQ & Help</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label>Current Password</label>
            <input
              type="password"
              className="settings-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              className="settings-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="settings-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
