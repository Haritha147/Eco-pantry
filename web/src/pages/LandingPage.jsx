import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield, Sparkles, Flame, Users, TrendingUp, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-fullscreen-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', minHeight: '100vh', overflowY: 'auto' }}>
      <div className="auth-decor-blob green" style={{ top: '10%', left: '10%' }}></div>
      <div className="auth-decor-blob teal" style={{ bottom: '15%', right: '10%' }}></div>

      <div className="glass-panel" style={{ maxWidth: '800px', padding: '3rem', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent-green)', marginBottom: '1.5rem' }}>
          <Leaf size={64} className="auth-logo" />
        </div>
        
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>
          Welcome to <span style={{ color: 'var(--accent-green)' }}>Eco-Pantry</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          Digitize your pantry, generate zero-waste AI recipes, track your carbon savings, and collaborate with your family to stop food waste.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem', textAlign: 'left' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Sparkles size={24} color="var(--accent-teal)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Groq AI Powered</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Instant zero-waste recipe generation and voice control.</p>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <TrendingUp size={24} color="var(--accent-green)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Eco Analytics</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Track your food waste reduction and CO2 footprint offset.</p>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Users size={24} color="var(--warning)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Family Sharing</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Sync your grocery lists, scans, and chat collaboratively.</p>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => navigate('/auth')} 
          style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '8px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          Access Command Center <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
