import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AlertCircle, Leaf, User, Users, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { authMode, setAuthMode, authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword, authFamilyCode, setAuthFamilyCode, authError, setAuthError, authLoading, handleAuthSubmit, renderToast } = useAppContext();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <div className="auth-fullscreen-container">
        {renderToast()}

        <div className="auth-decor-blob green"></div>
        <div className="auth-decor-blob teal"></div>
        
        <div className="glass-panel auth-card">
          <div className="auth-header">
            <Leaf size={42} className="auth-logo" />
            <h1 className="auth-title">Eco-Pantry</h1>
            <p className="auth-subtitle">Food Sustainability Command Center</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => { setAuthMode('signin'); setAuthError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="auth-error-box">
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'signup' && (
              <>
                <div className="input-group">
                  <label>Display Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Family Code (Optional)</label>
                  <div className="input-wrapper">
                    <Users size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter code to join a family" 
                      value={authFamilyCode}
                      onChange={e => setAuthFamilyCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="auth-btn btn-primary" type="submit" disabled={authLoading}>
              {authLoading ? (
                <div className="loader-spinner"></div>
              ) : (
                authMode === 'signin' ? 'Access Center' : 'Register Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
