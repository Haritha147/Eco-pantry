import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, Clock, Sparkles, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
    const { isScanning, isRecording, uploadedImage, audioVolume, scannedTags, hasScanned, inventory, scanHistory, fileInputRef, handleFileChange, triggerScan, handleMarkPreserved, lastVoiceTranscript, lastVoiceReply, startVoiceRecording } = useAppContext();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <div>
            <h2 className="header-title">Vision & OCR Scanner</h2>
            <p className="header-subtitle">Upload a picture of your fridge or a grocery receipt to automatically digitize your grocery lifecycle.</p>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ color: 'var(--accent-green)', fontSize: '1.1rem' }}>Voice-to-Pantry 🎙️</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tap the microphone and say: "I just bought 3 apples and a carton of milk"</span>
              </div>
              <button 
                className="btn-primary" 
                style={{ 
                  marginLeft: 'auto', 
                  borderRadius: '50%', 
                  width: '50px', 
                  height: '50px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  background: isRecording ? '#ef4444' : 'var(--accent-green)', 
                  transform: isRecording ? `scale(${1 + (audioVolume / 255) * 0.4})` : 'none',
                  boxShadow: isRecording ? `0 0 ${10 + (audioVolume / 255) * 40}px rgba(239, 68, 68, 0.6)` : 'none',
                  transition: 'transform 0.05s ease, box-shadow 0.05s ease'
                }}
                onClick={startVoiceRecording}
                disabled={isScanning}
              >
                <Mic size={24} color="white" />
              </button>
            </div>

            {(lastVoiceTranscript || lastVoiceReply) && (
              <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem', borderLeft: '4px solid var(--accent-green)', background: 'rgba(255, 255, 255, 0.02)' }}>
                {lastVoiceTranscript && (
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    <strong>You said:</strong> "{lastVoiceTranscript}"
                  </p>
                )}
                {lastVoiceReply && (
                  <p style={{ margin: '0', color: 'var(--accent-green)', fontSize: '0.95rem' }}>
                    <strong>Reply:</strong> {lastVoiceReply}
                  </p>
                )}
              </div>
            )}
            
            <div className="dashboard-grid">
              <div className="glass-panel" style={{ gridColumn: 'span 8' }}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                <div 
                  className={`ar-scanner-container ${isScanning ? 'scanning' : ''} ${hasScanned ? 'done-scanning' : ''}`} 
                  onClick={triggerScan}
                  style={uploadedImage ? { 
                    backgroundImage: `url(${uploadedImage})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                  } : {}}
                >
                  <div className="hud-brackets"></div>
                  <div className="hud-brackets-bottom"></div>
                  <div className="ar-laser"></div>
                  
                  {hasScanned && scannedTags.length > 0 && scannedTags.map((item, index) => {
                     const box = item.box || [500, 500, 500, 500];
                     
                     let topPercent, leftPercent;
                     
                     // If it's a receipt [0,0,0,0], scatter them randomly in a visually pleasing way
                     if (box[0] === 0 && box[1] === 0 && box[2] === 0 && box[3] === 0) {
                         // Create a deterministic pseudo-random spread based on index
                         topPercent = 15 + ((index * 27) % 70); 
                         leftPercent = 10 + ((index * 37) % 70);
                     } else {
                         topPercent = ((box[0] + box[2]) / 20);
                         leftPercent = ((box[1] + box[3]) / 20);
                     }
                     
                     const top = Math.max(5, Math.min(90, topPercent)) + '%';
                     const left = Math.max(5, Math.min(90, leftPercent)) + '%';
                     
                     return (
                       <div key={index} className="floating-tag" style={{ top, left, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                           <span className="tag-match">{item.confidenceScore}%</span>
                         </div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.2rem' }}>
                           <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />
                           Expires in {item.expirationDays || 7} days
                         </div>
                         <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontStyle: 'italic', maxWidth: '150px', whiteSpace: 'normal' }}>
                           💡 {item.preservationTip || 'Store properly.'}
                         </div>
                       </div>
                     );
                  })}

                  <div className="processing-overlay">
                    <div className="glass-loader"></div>
                    <div className="processing-text">Analyzing Inventory</div>
                  </div>

                  <div className="scanner-prompt">
                    <Camera size={48} color="var(--accent-teal)" />
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '1px' }}>INITIATE SCAN</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Click to upload an image of your fridge or a receipt</p>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel" style={{ gridColumn: 'span 4' }}>
                <h3 className="section-title">Detected Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {isScanning ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Waiting for vision model...</div>
                  ) : (
                    inventory.length > 0 ? [...inventory].sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate)).map((item, index) => {
                      const daysToExpire = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                      let heatColor = 'var(--accent-green)';
                      if (daysToExpire <= 3) heatColor = '#ef4444';
                      else if (daysToExpire <= 7) heatColor = 'var(--warning)';

                      return (
                        <div key={index} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: heatColor }}>{item.name}</span>
                            <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>{item.confidenceScore}% match</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.2rem' }}>
                            💡 {item.preservationTip || 'Store properly to extend life.'}
                          </div>
                          <button 
                            className="btn-primary" 
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.75rem', 
                              background: 'rgba(16, 185, 129, 0.12)', 
                              border: '1px solid rgba(16, 185, 129, 0.3)', 
                              color: 'var(--accent-green)',
                              borderRadius: '4px',
                              alignSelf: 'flex-start',
                              cursor: 'pointer',
                              fontWeight: '600',
                              width: 'auto'
                            }}
                            onClick={() => handleMarkPreserved(item._id || item.id, item.name)}
                          >
                            Mark as Preserved (+10 XP)
                          </button>
                        </div>
                      )
                    }) : (
                      <div style={{ color: 'var(--text-secondary)' }}>No items detected yet.</div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Past Scans Gallery */}
            {scanHistory.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 className="section-title">Past Scans History</h3>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem' }}>
                  {scanHistory.map((scan) => (
                    <div key={scan._id || scan.id} style={{ minWidth: '150px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={scan.imageUrl} alt="Scan" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    );
};

export default ScannerPage;
