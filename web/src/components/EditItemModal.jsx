import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Camera, ChefHat, LineChart, Leaf, AlertCircle, Clock, Sparkles, Upload, 
  ArrowRight, Settings, Users, Activity, Award, User, Lock, Mail, ArrowLeft, CheckCircle, 
  RefreshCw, LogOut, TrendingUp, AlertTriangle, MessageSquare, Send, Mic 
} from 'lucide-react';

const EditItemModal = () => {
    const context = useAppContext();
    const { activeSlide, setActiveSlide, isScanning, setIsScanning, hasScanned, setHasScanned, inventory, setInventory, recipes, setRecipes, isGenerating, setIsGenerating, isRecording, setIsRecording, uploadedImage, setUploadedImage, lastVoiceTranscript, setLastVoiceTranscript, lastVoiceReply, setLastVoiceReply, audioVolume, setAudioVolume, chatAudioVolume, setChatAudioVolume, scannedTags, setScannedTags, selectedRecipe, setSelectedRecipe, shoppingList, setShoppingList, currentUser, setCurrentUser, authView, setAuthView, authMode, setAuthMode, authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword, authFamilyCode, setAuthFamilyCode, inventorySearchQuery, setInventorySearchQuery, editingItem, setEditingItem, authError, setAuthError, authLoading, setAuthLoading, otpArray, setOtpArray, verificationEmail, setVerificationEmail, demoOtp, setDemoOtp, otpTimer, setOtpTimer, resendActive, setResendActive, verifySuccess, setVerifySuccess, toast, setToast, showGoogleSim, setShowGoogleSim, googleSimCustom, setGoogleSimCustom, googleSimEmail, setGoogleSimEmail, googleSimName, setGoogleSimName, chatOpen, setChatOpen, chatMessages, setChatMessages, chatInput, setChatInput, chatLoading, setChatLoading, ngos, setNgos, userDonations, setUserDonations, showDonationModal, setShowDonationModal, selectedNgo, setSelectedNgo, donationCart, setDonationCart, userLocation, setUserLocation, scanHistory, setScanHistory, familyScans, setFamilyScans, familyChat, setFamilyChat, familyChatInput, setFamilyChatInput, familyRecipes, setFamilyRecipes, isChatRecording, setIsChatRecording, audioContextRef, analyserRef, animationFrameRef, chatAudioContextRef, chatAnalyserRef, chatAnimationFrameRef, fileInputRef, mediaRecorderRef, recognitionRef, chatRecognitionRef, chatMediaRecorderRef, showToast, handleHashChange, decodeJWT, simulateGoogleLoginLocal, calculateLocalAnalytics, loadLocalInventory, loadLocalRecipes, updateShoppingList, triggerScan, getCoords, saveLocalScan, saveLocalRecipes, updateVolume, simulateLocalAuth, handleLogout, simulateLocalChatResponse, handleOtpChange, handleOtpKeyDown, renderToast, saved, tempEmail, slideHashes, hash, index, base64Url, base64, jsonPayload, handleGoogleCredentialResponse, payload, res, data, localUsers, clientId, key, local, defaultInv, found, fetchAnalytics, headers, fetchInventory, fetchRecipes, handleCookRecipe, fetchNgos, coords, fetchScanHistory, fetchUserDonations, fetchFamilyData, handleSendFamilyMessage, submitDonation, handleFileChange, file, imageUrl, formData, startChatVoiceRecordingMediaRecorder, stream, audioChunks, audioCtx, source, analyser, bufferLength, dataArray, mimeType, audioBlob, startChatVoiceRecording, SpeechRecognition, rec, resultText, startVoiceRecordingMediaRecorder, transcriptText, names, utterance, startVoiceRecording, processVoiceTranscript, handleGenerateRecipes, awardPoints, updatedUser, userIdx, handleMarkPreserved, targetId, filtered, handleDeleteItem, handleUpdateItemSubmit, idx, handleAuthSubmit, user, exists, otp, newUser, handleVerifySubmit, code, handleResendOtp, handleProfileUpdate, merged, handleChatSubmit, messageToProcess, historyToSend, cleanText, msgLower, newOtp, nextInput, prevInput, navItems } = context;

    return (
        <>
            {/* Edit Item Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Edit Pantry Item</h3>
            <form onSubmit={handleUpdateItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Item Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingItem.name || ''} 
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingItem.category || ''} 
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expiration Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={editingItem.expirationDate ? new Date(editingItem.expirationDate).toISOString().split('T')[0] : ''} 
                  onChange={(e) => setEditingItem({ ...editingItem, expirationDate: new Date(e.target.value) })} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
    );
};

export default EditItemModal;
