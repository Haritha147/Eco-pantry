import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sliders, Sparkles, Mic, Play } from 'lucide-react';

const AiConfigSettingsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState(
    'Ensure all generated recipes are 100% healthy and scaled exactly for household portions. Prioritize expiring vegetables first.'
  );

  const handleSave = () => {
    showToast('AI and Voice preferences updated!');
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Hello! I am your Eco-Pantry voice assistant. Speech rates and pitch levels have been verified.');
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Speech synthesis not supported in this browser', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sliders color="var(--accent-green)" /> AI & Voice Config
      </h2>
      <p className="header-subtitle">Customize default LLM models and text-to-speech feedback variables.</p>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/profile')}>Profile Info</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/security')}>Change Password</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/settings/alerts')}>Alert Thresholds</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'var(--accent-green)', color: 'white' }} onClick={() => navigate('/settings/ai')}>AI & Voice Config</button>
          <button className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => navigate('/help')}>FAQ & Help</button>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Groq LLM Engine Model
          </label>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}
          >
            <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Default text/chat)</option>
            <option value="llama-3.2-90b-vision-preview">llama-3.2-90b-vision-preview (Multimodal scans)</option>
            <option value="whisper-large-v3">whisper-large-v3 (Whisper speech fallback)</option>
          </select>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--glass-border)' }} />

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Text-to-Speech Rate
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-green)' }}
            />
            <span style={{ fontSize: '1.1rem', minWidth: '40px', fontWeight: 'bold' }}>{speechRate}x</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Text-to-Speech Pitch
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-green)' }}
            />
            <span style={{ fontSize: '1.1rem', minWidth: '40px', fontWeight: 'bold' }}>{speechPitch}x</span>
          </div>
          <button 
            className="btn-primary" 
            onClick={testVoice} 
            style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.25rem' }}
          >
            <Mic size={14} /> Test Voice Playback <Play size={10} />
          </button>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--glass-border)' }} />

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Global System Prompt Customization
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(20,20,20,0.4)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', resize: 'none', fontFamily: 'sans-serif', lineHeight: '1.4' }}
            placeholder="Type instructions to override recipe output characteristics..."
          />
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ marginTop: '1rem', justifyContent: 'center' }}>
          Save AI Settings
        </button>
      </div>
    </div>
  );
};

export default AiConfigSettingsPage;
