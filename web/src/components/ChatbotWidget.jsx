import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Camera, ChefHat, LineChart, Leaf, AlertCircle, Clock, Sparkles, Upload, 
  ArrowRight, Settings, Users, Activity, Award, User, Lock, Mail, ArrowLeft, CheckCircle, 
  RefreshCw, LogOut, TrendingUp, AlertTriangle, MessageSquare, Send, Mic 
} from 'lucide-react';

const ChatbotWidget = () => {
    const context = useAppContext();
    const { activeSlide, setActiveSlide, isScanning, setIsScanning, hasScanned, setHasScanned, inventory, setInventory, recipes, setRecipes, isGenerating, setIsGenerating, isRecording, setIsRecording, uploadedImage, setUploadedImage, lastVoiceTranscript, setLastVoiceTranscript, lastVoiceReply, setLastVoiceReply, audioVolume, setAudioVolume, chatAudioVolume, setChatAudioVolume, scannedTags, setScannedTags, selectedRecipe, setSelectedRecipe, shoppingList, setShoppingList, currentUser, setCurrentUser, authView, setAuthView, authMode, setAuthMode, authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword, authFamilyCode, setAuthFamilyCode, inventorySearchQuery, setInventorySearchQuery, editingItem, setEditingItem, authError, setAuthError, authLoading, setAuthLoading, otpArray, setOtpArray, verificationEmail, setVerificationEmail, demoOtp, setDemoOtp, otpTimer, setOtpTimer, resendActive, setResendActive, verifySuccess, setVerifySuccess, toast, setToast, showGoogleSim, setShowGoogleSim, googleSimCustom, setGoogleSimCustom, googleSimEmail, setGoogleSimEmail, googleSimName, setGoogleSimName, chatOpen, setChatOpen, chatMessages, setChatMessages, chatInput, setChatInput, chatLoading, setChatLoading, ngos, setNgos, userDonations, setUserDonations, showDonationModal, setShowDonationModal, selectedNgo, setSelectedNgo, donationCart, setDonationCart, userLocation, setUserLocation, scanHistory, setScanHistory, familyScans, setFamilyScans, familyChat, setFamilyChat, familyChatInput, setFamilyChatInput, familyRecipes, setFamilyRecipes, isChatRecording, setIsChatRecording, audioContextRef, analyserRef, animationFrameRef, chatAudioContextRef, chatAnalyserRef, chatAnimationFrameRef, fileInputRef, mediaRecorderRef, recognitionRef, chatRecognitionRef, chatMediaRecorderRef, showToast, handleHashChange, decodeJWT, simulateGoogleLoginLocal, calculateLocalAnalytics, loadLocalInventory, loadLocalRecipes, updateShoppingList, triggerScan, getCoords, saveLocalScan, saveLocalRecipes, updateVolume, simulateLocalAuth, handleLogout, simulateLocalChatResponse, handleOtpChange, handleOtpKeyDown, renderToast, saved, tempEmail, slideHashes, hash, index, base64Url, base64, jsonPayload, handleGoogleCredentialResponse, payload, res, data, localUsers, clientId, key, local, defaultInv, found, fetchAnalytics, headers, fetchInventory, fetchRecipes, handleCookRecipe, fetchNgos, coords, fetchScanHistory, fetchUserDonations, fetchFamilyData, handleSendFamilyMessage, submitDonation, handleFileChange, file, imageUrl, formData, startChatVoiceRecordingMediaRecorder, stream, audioChunks, audioCtx, source, analyser, bufferLength, dataArray, mimeType, audioBlob, startChatVoiceRecording, SpeechRecognition, rec, resultText, startVoiceRecordingMediaRecorder, transcriptText, names, utterance, startVoiceRecording, processVoiceTranscript, handleGenerateRecipes, awardPoints, updatedUser, userIdx, handleMarkPreserved, targetId, filtered, handleDeleteItem, handleUpdateItemSubmit, idx, handleAuthSubmit, user, exists, otp, newUser, handleVerifySubmit, code, handleResendOtp, handleProfileUpdate, merged, handleChatSubmit, messageToProcess, historyToSend, cleanText, msgLower, newOtp, nextInput, prevInput, navItems } = context;

    return (
        <>
            {/* Floating AI Chatbot Widget */}
      {currentUser && (
        <div className={`eco-chatbot-widget ${chatOpen ? 'open' : ''}`}>
          {/* Chat Pane */}
          {chatOpen && (
            <div className="glass-panel chat-pane">
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--accent-green)" />
                  <strong style={{ fontFamily: 'Outfit, sans-serif' }}>Eco-Assistant</strong>
                </div>
                <button className="chat-close-btn" onClick={() => setChatOpen(false)}>&times;</button>
              </div>

              {/* Chat Message List */}
              <div className="chat-messages-container">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-bubble">
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message bot loading">
                    <div className="chat-message-bubble">
                      <div className="chat-dots-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="chat-quick-prompts">
                <button 
                  onClick={() => {
                    setChatInput("What zero-waste recipe can I make?");
                  }}
                  className="quick-prompt-chip"
                >
                  🍳 Recipes
                </button>
                <button 
                  onClick={() => {
                    setChatInput("Give me a storage hack to save food.");
                  }}
                  className="quick-prompt-chip"
                >
                  💡 Food Hacks
                </button>
                <button 
                  onClick={() => {
                    setChatInput("How do I earn more Eco Points?");
                  }}
                  className="quick-prompt-chip"
                >
                  🌱 Eco Points
                </button>
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleChatSubmit} className="chat-input-form" style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder={isChatRecording ? "Listening..." : "Ask Eco-Bot anything..."}
                  disabled={chatLoading || isChatRecording}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={startChatVoiceRecording} 
                  disabled={chatLoading} 
                  className="chat-send-btn" 
                  style={{ 
                    background: isChatRecording ? '#ef4444' : 'rgba(255,255,255,0.05)', 
                    color: isChatRecording ? 'white' : 'var(--text-secondary)',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    transform: isChatRecording ? `scale(${1 + (chatAudioVolume / 255) * 0.4})` : 'none',
                    boxShadow: isChatRecording ? `0 0 ${10 + (chatAudioVolume / 255) * 40}px rgba(239, 68, 68, 0.6)` : 'none',
                    transition: 'transform 0.05s ease, box-shadow 0.05s ease'
                  }}
                  title="Hold to talk"
                >
                  <Mic size={16} />
                </button>
                <button type="submit" disabled={chatLoading || isChatRecording} className="chat-send-btn" style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--accent-green)', color: 'white' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* Floating Bubble Button */}
          <button 
            className="chatbot-float-bubble" 
            onClick={() => setChatOpen(!chatOpen)}
            title="Chat with Eco-Assistant"
          >
            <MessageSquare size={26} />
            <span className="chatbot-pulse-ring"></span>
          </button>
        </div>
      )}
        </>
    );
};

export default ChatbotWidget;
