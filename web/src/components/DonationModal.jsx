import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Camera, ChefHat, LineChart, Leaf, AlertCircle, Clock, Sparkles, Upload, 
  ArrowRight, Settings, Users, Activity, Award, User, Lock, Mail, ArrowLeft, CheckCircle, 
  RefreshCw, LogOut, TrendingUp, AlertTriangle, MessageSquare, Send, Mic 
} from 'lucide-react';

const DonationModal = () => {
    const context = useAppContext();
    const { activeSlide, setActiveSlide, isScanning, setIsScanning, hasScanned, setHasScanned, inventory, setInventory, recipes, setRecipes, isGenerating, setIsGenerating, isRecording, setIsRecording, uploadedImage, setUploadedImage, lastVoiceTranscript, setLastVoiceTranscript, lastVoiceReply, setLastVoiceReply, audioVolume, setAudioVolume, chatAudioVolume, setChatAudioVolume, scannedTags, setScannedTags, selectedRecipe, setSelectedRecipe, shoppingList, setShoppingList, currentUser, setCurrentUser, authView, setAuthView, authMode, setAuthMode, authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword, authFamilyCode, setAuthFamilyCode, inventorySearchQuery, setInventorySearchQuery, editingItem, setEditingItem, authError, setAuthError, authLoading, setAuthLoading, otpArray, setOtpArray, verificationEmail, setVerificationEmail, demoOtp, setDemoOtp, otpTimer, setOtpTimer, resendActive, setResendActive, verifySuccess, setVerifySuccess, toast, setToast, showGoogleSim, setShowGoogleSim, googleSimCustom, setGoogleSimCustom, googleSimEmail, setGoogleSimEmail, googleSimName, setGoogleSimName, chatOpen, setChatOpen, chatMessages, setChatMessages, chatInput, setChatInput, chatLoading, setChatLoading, ngos, setNgos, userDonations, setUserDonations, showDonationModal, setShowDonationModal, selectedNgo, setSelectedNgo, donationCart, setDonationCart, userLocation, setUserLocation, scanHistory, setScanHistory, familyScans, setFamilyScans, familyChat, setFamilyChat, familyChatInput, setFamilyChatInput, familyRecipes, setFamilyRecipes, isChatRecording, setIsChatRecording, audioContextRef, analyserRef, animationFrameRef, chatAudioContextRef, chatAnalyserRef, chatAnimationFrameRef, fileInputRef, mediaRecorderRef, recognitionRef, chatRecognitionRef, chatMediaRecorderRef, showToast, handleHashChange, decodeJWT, simulateGoogleLoginLocal, calculateLocalAnalytics, loadLocalInventory, loadLocalRecipes, updateShoppingList, triggerScan, getCoords, saveLocalScan, saveLocalRecipes, updateVolume, simulateLocalAuth, handleLogout, simulateLocalChatResponse, handleOtpChange, handleOtpKeyDown, renderToast, saved, tempEmail, slideHashes, hash, index, base64Url, base64, jsonPayload, handleGoogleCredentialResponse, payload, res, data, localUsers, clientId, key, local, defaultInv, found, fetchAnalytics, headers, fetchInventory, fetchRecipes, handleCookRecipe, fetchNgos, coords, fetchScanHistory, fetchUserDonations, fetchFamilyData, handleSendFamilyMessage, submitDonation, handleFileChange, file, imageUrl, formData, startChatVoiceRecordingMediaRecorder, stream, audioChunks, audioCtx, source, analyser, bufferLength, dataArray, mimeType, audioBlob, startChatVoiceRecording, SpeechRecognition, rec, resultText, startVoiceRecordingMediaRecorder, transcriptText, names, utterance, startVoiceRecording, processVoiceTranscript, handleGenerateRecipes, awardPoints, updatedUser, userIdx, handleMarkPreserved, targetId, filtered, handleDeleteItem, handleUpdateItemSubmit, idx, handleAuthSubmit, user, exists, otp, newUser, handleVerifySubmit, code, handleResendOtp, handleProfileUpdate, merged, handleChatSubmit, messageToProcess, historyToSend, cleanText, msgLower, newOtp, nextInput, prevInput, navItems } = context;

    return (
        <>
            {/* Donation Request Modal Overlay */}
      {showDonationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={() => setShowDonationModal(false)}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', border: '1px solid var(--accent-teal)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDonationModal(false)} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '2rem' }}>&times;</button>
            <h2 style={{ color: 'var(--accent-teal)', marginBottom: '0.5rem' }}>Create Donation Request</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select expiring items from your pantry to donate to local NGOs.</p>
            
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>1. Select Items to Donate</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem', maxHeight: '150px', overflowY: 'auto' }}>
              {inventory.length > 0 ? inventory.map((item, idx) => {
                const days = Math.ceil((new Date(item.expirationDate) - new Date()) / 86400000);
                const isSelected = donationCart.some(i => i.name === item.name);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ color: days <= 5 ? '#ef4444' : 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(Expires in {days}d) - Qty: {item.quantity || 1}</span>
                    </div>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: isSelected ? 'var(--warning)' : 'var(--accent-green)' }}
                      onClick={() => {
                        if (isSelected) {
                          setDonationCart(donationCart.filter(i => i.name !== item.name));
                        } else {
                          setDonationCart([...donationCart, { name: item.name, quantity: 1, expirationDate: item.expirationDate }]);
                        }
                      }}
                    >
                      {isSelected ? 'Added' : 'Add'}
                    </button>
                  </div>
                );
              }) : (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Your pantry is empty.</div>
              )}
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>2. Select NGO Destination</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {ngos.map((ngo, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: selectedNgo?.id === ngo.id ? '2px solid var(--accent-green)' : '1px solid var(--glass-border)',
                    background: selectedNgo?.id === ngo.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedNgo(ngo)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{ngo.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>{ngo.distance}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type: {ngo.type}</div>
                </div>
              ))}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: (!selectedNgo || donationCart.length === 0) ? '#555' : 'var(--accent-teal)' }}
              disabled={!selectedNgo || donationCart.length === 0}
              onClick={submitDonation}
            >
              Submit Donation Request
            </button>
          </div>
        </div>
      )}
        </>
    );
};

export default DonationModal;
