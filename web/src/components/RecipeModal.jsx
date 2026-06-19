import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Camera, ChefHat, LineChart, Leaf, AlertCircle, Clock, Sparkles, Upload, 
  ArrowRight, Settings, Users, Activity, Award, User, Lock, Mail, ArrowLeft, CheckCircle, 
  RefreshCw, LogOut, TrendingUp, AlertTriangle, MessageSquare, Send, Mic 
} from 'lucide-react';

const RecipeModal = () => {
    const context = useAppContext();
    const { activeSlide, setActiveSlide, isScanning, setIsScanning, hasScanned, setHasScanned, inventory, setInventory, recipes, setRecipes, isGenerating, setIsGenerating, isRecording, setIsRecording, uploadedImage, setUploadedImage, lastVoiceTranscript, setLastVoiceTranscript, lastVoiceReply, setLastVoiceReply, audioVolume, setAudioVolume, chatAudioVolume, setChatAudioVolume, scannedTags, setScannedTags, selectedRecipe, setSelectedRecipe, shoppingList, setShoppingList, currentUser, setCurrentUser, authView, setAuthView, authMode, setAuthMode, authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword, authFamilyCode, setAuthFamilyCode, inventorySearchQuery, setInventorySearchQuery, editingItem, setEditingItem, authError, setAuthError, authLoading, setAuthLoading, otpArray, setOtpArray, verificationEmail, setVerificationEmail, demoOtp, setDemoOtp, otpTimer, setOtpTimer, resendActive, setResendActive, verifySuccess, setVerifySuccess, toast, setToast, showGoogleSim, setShowGoogleSim, googleSimCustom, setGoogleSimCustom, googleSimEmail, setGoogleSimEmail, googleSimName, setGoogleSimName, chatOpen, setChatOpen, chatMessages, setChatMessages, chatInput, setChatInput, chatLoading, setChatLoading, ngos, setNgos, userDonations, setUserDonations, showDonationModal, setShowDonationModal, selectedNgo, setSelectedNgo, donationCart, setDonationCart, userLocation, setUserLocation, scanHistory, setScanHistory, familyScans, setFamilyScans, familyChat, setFamilyChat, familyChatInput, setFamilyChatInput, familyRecipes, setFamilyRecipes, isChatRecording, setIsChatRecording, audioContextRef, analyserRef, animationFrameRef, chatAudioContextRef, chatAnalyserRef, chatAnimationFrameRef, fileInputRef, mediaRecorderRef, recognitionRef, chatRecognitionRef, chatMediaRecorderRef, showToast, handleHashChange, decodeJWT, simulateGoogleLoginLocal, calculateLocalAnalytics, loadLocalInventory, loadLocalRecipes, updateShoppingList, triggerScan, getCoords, saveLocalScan, saveLocalRecipes, updateVolume, simulateLocalAuth, handleLogout, simulateLocalChatResponse, handleOtpChange, handleOtpKeyDown, renderToast, saved, tempEmail, slideHashes, hash, index, base64Url, base64, jsonPayload, handleGoogleCredentialResponse, payload, res, data, localUsers, clientId, key, local, defaultInv, found, fetchAnalytics, headers, fetchInventory, fetchRecipes, handleCookRecipe, fetchNgos, coords, fetchScanHistory, fetchUserDonations, fetchFamilyData, handleSendFamilyMessage, submitDonation, handleFileChange, file, imageUrl, formData, startChatVoiceRecordingMediaRecorder, stream, audioChunks, audioCtx, source, analyser, bufferLength, dataArray, mimeType, audioBlob, startChatVoiceRecording, SpeechRecognition, rec, resultText, startVoiceRecordingMediaRecorder, transcriptText, names, utterance, startVoiceRecording, processVoiceTranscript, handleGenerateRecipes, awardPoints, updatedUser, userIdx, handleMarkPreserved, targetId, filtered, handleDeleteItem, handleUpdateItemSubmit, idx, handleAuthSubmit, user, exists, otp, newUser, handleVerifySubmit, code, handleResendOtp, handleProfileUpdate, merged, handleChatSubmit, messageToProcess, historyToSend, cleanText, msgLower, newOtp, nextInput, prevInput, navItems } = context;

    return (
        <>
            {/* Recipe Modal Overlay */}
      {selectedRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={() => setSelectedRecipe(null)}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', border: '1px solid var(--accent-green)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedRecipe(null)} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '2rem' }}>&times;</button>
            <h2 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem', paddingRight: '2rem' }}>{selectedRecipe.title}</h2>
            <div className="ai-badge" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
              <Sparkles size={12} /> {selectedRecipe.matchScore}% Zero-Waste Match
            </div>
            
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Ingredients to Use</h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {selectedRecipe.matchedIngredients && selectedRecipe.matchedIngredients.length > 0 
                ? selectedRecipe.matchedIngredients.map((ing, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{ing}</li>) 
                : <li>Check your expiring items</li>}
            </ul>

            {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 && (
              <>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Pantry Staples Needed</h3>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  {selectedRecipe.missingIngredients.map((ing, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{ing}</li>)}
                </ul>
              </>
            )}

            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Instructions</h3>
            <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0
                ? selectedRecipe.instructions.map((step, i) => <li key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>{step}</li>)
                : <li>Cook ingredients together and enjoy!</li>}
            </ol>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: 'var(--accent-green)', fontWeight: 'bold' }} onClick={() => handleCookRecipe(selectedRecipe)}>
              Cook This Recipe (Auto-Deduct Inventory)
            </button>
          </div>
        </div>
      )}
        </>
    );
};

export default RecipeModal;
