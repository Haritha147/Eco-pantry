import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, Award, Users, ChefHat, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityPage = () => {
    const { currentUser, familyScans, familyChat, familyRecipes, familyChatInput, setFamilyChatInput, handleSendFamilyMessage, setSelectedRecipe } = useAppContext();
    if (!currentUser) return null;
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <div>
            <h2 className="header-title">Eco Community & Family Hub</h2>
            <p className="header-subtitle">Coordinate with your household and share your Zero-Waste victories.</p>
            
            <div className="dashboard-grid">
              <div className="glass-panel" style={{ gridColumn: 'span 8' }}>
                <h3 className="section-title"><Award size={20} color="var(--warning)" /> Local Leaderboard</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { rank: 1, name: 'Sarah J.', score: '425 Pts', isMe: false },
                    { rank: 2, name: `${currentUser.name} (You)`, score: `${currentUser.points} Pts`, isMe: true },
                    { rank: 3, name: 'Alex M.', score: '98 Pts', isMe: false },
                    { rank: 4, name: 'David W.', score: '51 Pts', isMe: false }
                  ].map((user, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '1rem', 
                      background: user.isMe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: user.isMe ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>#{user.rank} {user.name}</span>
                      <span style={{ color: 'var(--accent-teal)' }}>{user.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>
                  <Award size={40} color="var(--bg-color)" />
                </div>
                <h3>Current Rank: {currentUser.badge}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {currentUser.badge === 'Bronze' && "Earn 150 points to reach Silver Tier!"}
                  {currentUser.badge === 'Silver' && "Earn 300 points to reach Gold Tier!"}
                  {currentUser.badge === 'Gold' && "Earn 500 points to reach Platinum Tier!"}
                  {currentUser.badge === 'Platinum' && "Incredible! You are at the highest Eco tier."}
                </p>
                <button className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)' }}>
                  View Rewards
                </button>
              </div>
            </div>

            {/* Family Hub Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Family Household Hub</h3>
              {currentUser?.familyCode && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--accent-green)" />
                  <span>Family Code: <strong style={{ color: 'var(--accent-green)', letterSpacing: '2px' }}>{currentUser.familyCode}</strong></span>
                </div>
              )}
            </div>
            <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
              
              {/* Latest Scan */}
              <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={18} color="var(--accent-teal)" /> Latest Fridge Scan</h4>
                {familyScans.length > 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <img src={familyScans[0].imageUrl} alt="Latest scan" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Uploaded on {new Date(familyScans[0].createdAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No scans yet.</div>
                )}
              </div>

              {/* Family Chat */}
              <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', height: '300px' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={18} color="var(--accent-green)" /> Family Chat</h4>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                  {familyChat.map((msg, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginBottom: '0.2rem' }}>{msg.senderName}</div>
                      <div style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendFamilyMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={familyChatInput} onChange={e => setFamilyChatInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem' }}>Send</button>
                </form>
              </div>

              {/* Shared Recipes */}
              <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChefHat size={18} color="var(--warning)" /> Shared Recipes</h4>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {familyRecipes.map((r, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent' }} onClick={() => setSelectedRecipe(r)}>
                      <strong style={{ fontSize: '0.95rem' }}>{r.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.2rem' }}>{r.matchScore}% Match</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
    );
};

export default CommunityPage;
