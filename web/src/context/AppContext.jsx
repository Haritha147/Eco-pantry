import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  ChefHat, 
  LineChart, 
  Leaf,
  AlertCircle,
  Clock,
  Sparkles,
  Upload,
  ArrowRight,
  Settings,
  Users,
  Activity,
  Award,
  User,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  LogOut,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Send,
  Mic
} from 'lucide-react';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  let saved, tempEmail, hash, index, base64Url, base64, jsonPayload, payload, res, data, localUsers, clientId, key, local, defaultInv, found, file, imageUrl, formData, stream, audioChunks, audioCtx, source, analyser, bufferLength, dataArray, mimeType, audioBlob, rec, resultText, transcriptText, names, utterance, targetId, filtered, idx, user, exists, otp, newUser, code, merged, messageToProcess, historyToSend, cleanText, msgLower, newOtp, nextInput, prevInput;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState('');
  const [lastVoiceReply, setLastVoiceReply] = useState('');
  const [audioVolume, setAudioVolume] = useState(0);
  const [chatAudioVolume, setChatAudioVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chatAudioContextRef = useRef(null);
  const chatAnalyserRef = useRef(null);
  const chatAnimationFrameRef = useRef(null);

  const [scannedTags, setScannedTags] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shoppingList, setShoppingList] = useState([
    { name: 'Milk', inStock: false },
    { name: 'Butter', inStock: false },
    { name: 'Carrots', inStock: false },
    { name: 'Bread', inStock: false },
    { name: 'Red Apples', inStock: false }
  ]);
  const fileInputRef = useRef(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('eco_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eco_token') || null);

  // Development helper: auto-set a demo user when running in Vite dev mode
  // This makes the dashboard reachable without full auth during local development.
  useEffect(() => {
    try {
      // Vite exposes import.meta.env.DEV; guard for environments where it's undefined
      const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
      if (isDev && !currentUser) {
        console.warn('Eco-Pantry running in DEV mode without an authenticated user. Please login to use real backend data.');
      }
    } catch (e) {
      // ignore in non-Vite environments
    }
  }, []);
  const [authView, setAuthView] = useState(() => {
    const tempEmail = localStorage.getItem('eco_temp_email');
    return tempEmail ? 'verify' : 'login';
  });
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFamilyCode, setAuthFamilyCode] = useState('');
  
  // Full Inventory Management UI State
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Verification State
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [verificationEmail, setVerificationEmail] = useState(() => localStorage.getItem('eco_temp_email') || '');
  // demoOtp kept for compatibility but default to empty — real OTPs come from backend
  const [demoOtp, setDemoOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes countdown
  const [resendActive, setResendActive] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Google Sign-In Selector Simulator State (Removed - Dummies kept for page destructuring compatibility)
  const showGoogleSim = false;
  const setShowGoogleSim = () => {};
  const googleSimCustom = false;
  const setGoogleSimCustom = () => {};
  const googleSimEmail = '';
  const setGoogleSimEmail = () => {};
  const googleSimName = '';
  const setGoogleSimName = () => {};

  // AI Chatbot States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: "Hi! I'm Eco-Bot, your AI culinary and sustainability assistant. Ask me anything, or click a quick prompt below!", role: 'bot' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Donation Module States
  const [ngos, setNgos] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [donationCart, setDonationCart] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [familyScans, setFamilyScans] = useState([]);
  const [familyChat, setFamilyChat] = useState([]);
  const [familyChatInput, setFamilyChatInput] = useState('');
  const [familyRecipes, setFamilyRecipes] = useState([]);

  const slideHashes = [
    '#dashboard',
    '#scanner',
    '#recipes',
    '#analytics',
    '#profile',
    '#community'
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeaders = (extra = {}) => {
    const headers = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const handleHashChange = () => {
    const hash = window.location.hash || '#dashboard';
    const index = slideHashes.indexOf(hash);
    if (index !== -1) {
      setActiveSlide(index);
    } else {
      window.location.hash = '#dashboard';
    }
  };

  // Hash change router listener
  useEffect(() => {
    if (!currentUser) return;
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Google Auth Methods (Removed - Dummies kept for page destructuring compatibility)
  const decodeJWT = () => null;
  const handleGoogleCredentialResponse = () => {};
  const simulateGoogleLoginLocal = () => {};

  useEffect(() => {
    if (currentUser) {
      fetchInventory();
      fetchRecipes();
      fetchAnalytics();
      fetchNgos();
      fetchUserDonations();
      fetchScanHistory();
      fetchFamilyData();
    }
  }, [currentUser]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (authView === 'verify' && otpTimer > 0 && !verifySuccess) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setResendActive(true);
    }
    return () => clearInterval(interval);
  }, [authView, otpTimer, verifySuccess]);

  const calculateLocalAnalytics = (items = inventory) => {
    // Only basic analytics now
  };



  const updateShoppingList = (data) => {
    setShoppingList(prev => prev.map(listItem => {
      const found = data.find(invItem => invItem.name.toLowerCase() === listItem.name.toLowerCase());
      return { ...listItem, inStock: !!found };
    }));
  };

  const fetchAnalytics = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
      const res = await fetch(`${API_BASE_URL}/api/inventory/analytics`, { headers });
      if (res.ok) {
        // Optional: fetch items count if needed
      } else {
        calculateLocalAnalytics();
      }
    } catch (err) { 
      console.error('Failed to fetch analytics:', err); 
      calculateLocalAnalytics();
    }
  };

  const fetchInventory = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
      const res = await fetch(`${API_BASE_URL}/api/inventory`, { headers });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
        updateShoppingList(data);
      } else {
        showToast('Failed to load inventory from server.', 'warning');
        setInventory([]);
      }
    } catch (err) { 
      console.error(err); 
      showToast('Unable to contact inventory API. Please check your connection.', 'error');
      setInventory([]);
    }
  };

  const fetchRecipes = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      const res = await fetch(`${API_BASE_URL}/api/recipes`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      } else {
        showToast('Failed to load recipes from server.', 'warning');
        setRecipes([]);
      }
    } catch (err) { 
      console.error(err); 
      showToast('Unable to contact recipes API. Please check your connection.', 'error');
      setRecipes([]);
    }
  };

  const handleCookRecipe = async (recipe) => {
    if (!recipe.matchedIngredients || recipe.matchedIngredients.length === 0) {
      showToast('No ingredients matched to deduct from inventory.', 'error');
      return;
    }
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
      const res = await fetch(`${API_BASE_URL}/api/inventory/deduct`, {
        method: 'POST',
        headers: getAuthHeaders(headers),
        body: JSON.stringify({ ingredients: recipe.matchedIngredients })
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast(`Cooked ${recipe.title}! ${data.deductedCount} items deducted.`, 'success');
        await fetchInventory();
        await fetchAnalytics();
        awardPoints(40);
        setSelectedRecipe(null);
      } else {
        showToast('Failed to deduct inventory items.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deducting inventory.', 'error');
    }
  };

  const triggerScan = () => {
    fileInputRef.current.click();
  };

  const getCoords = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000 }
    );
  });

  const fetchNgos = async () => {
    try {
      let url = `${API_BASE_URL}/api/donations/ngos`;
      try {
        const coords = await getCoords();
        setUserLocation(coords);
        url += `?lat=${coords.lat}&lng=${coords.lng}`;
      } catch (geoErr) {
        console.warn('Using default NGOs due to geolocation error:', geoErr.message);
      }

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;

      const res = await fetch(url, { headers });
      const data = await res.json();
      setNgos(data);
    } catch (err) {
      console.error(err);
      setNgos([
        { id: 'ngo1', name: 'Feeding India', distance: '1.2 km', type: 'Food Bank' },
        { id: 'ngo2', name: 'Robin Hood Army', distance: '3.5 km', type: 'Community Kitchen' }
      ]);
    }
  };

  const fetchScanHistory = async () => {
    if (!currentUser && !token) return;
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-user-id'] = currentUser.id || currentUser._id;

      const res = await fetch(`${API_BASE_URL}/api/inventory/scans`, { headers });
      if (res.ok) {
        const data = await res.json();
        setScanHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDonations = async () => {
    if (!currentUser && !token) return;
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-user-id'] = currentUser.id || currentUser._id;

      const res = await fetch(`${API_BASE_URL}/api/donations`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUserDonations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFamilyData = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-user-id'] = currentUser ? (currentUser.id || currentUser._id) : 'anonymous';

      const [scansRes, chatRes, recipesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/family/scans`, { headers }),
        fetch(`${API_BASE_URL}/api/family/chat`, { headers }),
        fetch(`${API_BASE_URL}/api/family/recipes`, { headers })
      ]);
      if (scansRes.ok) setFamilyScans(await scansRes.json());
      if (chatRes.ok) setFamilyChat(await chatRes.json());
      if (recipesRes.ok) setFamilyRecipes(await recipesRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFamilyMessage = async (e) => {
    e.preventDefault();
    if (!familyChatInput.trim() || !currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/family/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser ? (currentUser.id || currentUser._id) : 'anonymous'
        },
        body: JSON.stringify({ senderName: currentUser.name, text: familyChatInput })
      });
      if (res.ok) {
        setFamilyChat(await res.json());
        setFamilyChatInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitDonation = async () => {
    if (!selectedNgo || donationCart.length === 0) {
      showToast('Please select items and an NGO', 'error');
      return;
    }
    try {
      const headers = getAuthHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch(`${API_BASE_URL}/api/donations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ngoId: selectedNgo.id,
          ngoName: selectedNgo.name,
          items: donationCart
        })
      });
      if (res.ok) {
        showToast('Donation Request Sent Successfully! (+100 XP)', 'success');
        setShowDonationModal(false);
        setDonationCart([]);
        setSelectedNgo(null);
        fetchUserDonations();
        fetchInventory();
        awardPoints(100);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to submit donation.', 'error');
    }
  };

  // Local save helpers removed; server endpoints are the source of truth for scans and recipes

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    setIsScanning(true);
    setHasScanned(false);
    setScannedTags([]); // Clear old AR tags
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const headers = {};
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
      const res = await fetch(`${API_BASE_URL}/api/inventory/scan`, { 
        method: 'POST',
        headers: getAuthHeaders(headers),
        body: formData
      });
      
      if (!res.ok) {
        throw new Error('Server error during scan');
      }

      const data = await res.json();
      if (data.scannedItems) {
         setScannedTags(data.scannedItems);
      }
      await fetchInventory();
      await fetchAnalytics();
      await fetchScanHistory();
      awardPoints(50);
      showToast('Scan successful!', 'success');

    } catch (err) { 
      console.error('Network Error:', err); 
      showToast('Scan failed to connect to backend.', 'error');
    }
    
    setIsScanning(false);
    setHasScanned(true);
  };

  // Store media recorder globally so we can stop it on a second click
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatRecognitionRef = useRef(null);
  const [isChatRecording, setIsChatRecording] = useState(false);
  const chatMediaRecorderRef = useRef(null);

  const startChatVoiceRecordingMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
      chatMediaRecorderRef.current = new MediaRecorder(stream, options);
      const audioChunks = [];

      // Web Audio volume analysis
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      chatAudioContextRef.current = audioCtx;
      chatAnalyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateVolume = () => {
        if (!chatAnalyserRef.current) return;
        chatAnalyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        setChatAudioVolume(sum / bufferLength);
        chatAnimationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      chatMediaRecorderRef.current.addEventListener("dataavailable", event => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      chatMediaRecorderRef.current.addEventListener("stop", async () => {
        setIsChatRecording(false);
        setChatAudioVolume(0);
        if (chatAnimationFrameRef.current) cancelAnimationFrame(chatAnimationFrameRef.current);
        if (chatAudioContextRef.current) chatAudioContextRef.current.close().catch(()=>{});
        chatAnalyserRef.current = null;
        chatAudioContextRef.current = null;

        showToast('Transcribing... ⏳');
        stream.getTracks().forEach(track => track.stop());

        const mimeType = chatMediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'chat-recording.webm');

        try {
           const res = await fetch(`${API_BASE_URL}/api/chat/transcribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
           });
           if (res.ok) {
               const data = await res.json();
               if (data.transcript) {
                 handleChatSubmit(data.transcript, true);
               } else {
                 showToast('Could not hear anything clearly.', 'error');
               }
           } else {
               showToast('Transcription failed.', 'error');
           }
        } catch (err) {
           console.error('Voice Error:', err);
           showToast('Network error processing voice.', 'error');
        }
      });

      chatMediaRecorderRef.current.start(250);
      setIsChatRecording(true);
      showToast('🎤 Listening... Click again to send!', 'info');
    } catch (micErr) {
      console.error('Microphone permission denied:', micErr);
      showToast('Microphone access denied. Please allow microphone permission.', 'error');
    }
  };

  const startChatVoiceRecording = async () => {
    if (isChatRecording) {
      if (chatRecognitionRef.current) {
        chatRecognitionRef.current.stop();
      } else if (chatMediaRecorderRef.current) {
        chatMediaRecorderRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';
        
        let finalTranscript = '';

        rec.onstart = () => {
          setIsChatRecording(true);
          setChatInput('Listening...');
          showToast('🎙️ Chat Voice Assistant listening...');
        };

        rec.onresult = (event) => {
          const resultText = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setChatInput(resultText);
          finalTranscript = resultText;
        };

        rec.onerror = (err) => {
          console.error('Chat recognition error:', err);
          showToast('Speech recognition failed. Trying audio upload fallback...', 'warning');
          startChatVoiceRecordingMediaRecorder();
        };

        rec.onend = () => {
          setIsChatRecording(false);
          setChatInput('');
          if (finalTranscript && finalTranscript.trim().length > 0 && finalTranscript !== 'Listening...') {
            handleChatSubmit(finalTranscript, true);
          } else {
            showToast('No speech detected.', 'error');
          }
        };

        chatRecognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error('SpeechRecognition error, falling back:', err);
        startChatVoiceRecordingMediaRecorder();
      }
    } else {
      startChatVoiceRecordingMediaRecorder();
    }
  };

  const startVoiceRecordingMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      const audioChunks = [];

      // Web Audio volume analysis
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        setAudioVolume(sum / bufferLength);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      mediaRecorderRef.current.addEventListener("dataavailable", event => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorderRef.current.addEventListener("stop", async () => {
        setIsRecording(false);
        setAudioVolume(0);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close().catch(()=>{});
        analyserRef.current = null;
        audioContextRef.current = null;

        showToast('Processing your voice... ⏳');
        setIsScanning(true);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
           const headers = {};
           if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
           
           const res = await fetch(`${API_BASE_URL}/api/inventory/voice-audio`, {
      method: 'POST',
      headers: getAuthHeaders(headers),
      body: formData
           });
           if (res.ok) {
                const data = await res.json();
                
                const transcriptText = data.transcript || '';
                setLastVoiceTranscript(transcriptText);
                setLastVoiceReply(data.reply || '');
                showToast(`✅ Voice processed!`);

                // Perform side effects based on intent
                if (data.intent === 'add_item') {
                    await fetchInventory();
                    await fetchAnalytics();
                    awardPoints(25);
                } else if (data.intent === 'remove_item') {
                    await fetchInventory();
                    await fetchAnalytics();
                } else if (data.intent === 'generate_recipes') {
                    await fetchRecipes();
                    awardPoints(30);
                } else if (data.intent === 'create_shopping_list') {
                    const newItems = data.shoppingItems || [];
                    setShoppingList(prev => {
                      const existingNames = prev.map(item => item.name.toLowerCase());
                      const filteredNew = newItems
                        .filter(name => !existingNames.includes(name.toLowerCase()))
                        .map(name => ({ name, inStock: false }));
                      return [...prev, ...filteredNew];
                    });
                } else if (data.intent === 'donate_food') {
                    await fetchInventory();
                    await fetchAnalytics();
                } else {
                    await fetchInventory();
                    await fetchRecipes();
                }
                
                if ('speechSynthesis' in window && data.reply) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(data.reply);
                  window.speechSynthesis.speak(utterance);
                }
            } else {
                showToast('Failed to process voice: Server Error.', 'error');
            }
        } catch (err) {
           console.error('Voice Error:', err);
           showToast('Network error processing voice.', 'error');
        }
        setIsScanning(false);
      });

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      showToast('🎤 Recording started! Click again to stop.', 'info');
      
    } catch (micErr) {
      console.error('Microphone permission denied:', micErr);
      showToast('Microphone access denied. Please allow microphone permission.', 'error');
    }
  };

  const startVoiceRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';
        
        let finalTranscript = '';

        rec.onstart = () => {
          setIsRecording(true);
          setLastVoiceTranscript('Listening...');
          setLastVoiceReply('');
          showToast('🎙️ Voice Assistant listening...');
        };

        rec.onresult = (event) => {
          const resultText = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setLastVoiceTranscript(resultText);
          finalTranscript = resultText;
        };

        rec.onerror = (err) => {
          console.error('Pantry recognition error:', err);
          showToast('Speech recognition failed. Trying audio upload fallback...', 'warning');
          startVoiceRecordingMediaRecorder();
        };

        rec.onend = () => {
          setIsRecording(false);
          if (finalTranscript && finalTranscript.trim().length > 0 && finalTranscript !== 'Listening...') {
            processVoiceTranscript(finalTranscript);
          } else {
            showToast('No speech detected.', 'error');
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error('SpeechRecognition error, falling back:', err);
        startVoiceRecordingMediaRecorder();
      }
    } else {
      startVoiceRecordingMediaRecorder();
    }
  };

  const processVoiceTranscript = async (transcript) => {
        setLastVoiceTranscript(transcript);
        setLastVoiceReply('Thinking...');
        showToast(`Processing input: "${transcript}"`);
        
        setIsScanning(true);
        try {
           const headers = { 'Content-Type': 'application/json' };
           if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
           const res = await fetch(`${API_BASE_URL}/api/inventory/voice`, {
               method: 'POST',
               headers: getAuthHeaders(headers),
               body: JSON.stringify({ transcript })
           });
           if (res.ok) {
               const data = await res.json();
               
               // Update UI with the spoken reply
               setLastVoiceReply(data.reply || '');

               // Perform side effects based on intent
               if (data.intent === 'add_item') {
                   await fetchInventory();
                   await fetchAnalytics();
                   awardPoints(25);
                   showToast('Items added to pantry!');
               } else if (data.intent === 'remove_item') {
                   await fetchInventory();
                   await fetchAnalytics();
                   showToast('Items removed from pantry!');
               } else if (data.intent === 'generate_recipes') {
                   await fetchRecipes();
                   awardPoints(30);
                   showToast('Recipes generated with AI!');
               } else if (data.intent === 'create_shopping_list') {
                   const newItems = data.shoppingItems || [];
                   setShoppingList(prev => {
                     const existingNames = prev.map(item => item.name.toLowerCase());
                     const filteredNew = newItems
                       .filter(name => !existingNames.includes(name.toLowerCase()))
                       .map(name => ({ name, inStock: false }));
                     return [...prev, ...filteredNew];
                   });
                   showToast('Items added to shopping list!');
               } else if (data.intent === 'donate_food') {
                   await fetchInventory();
                   await fetchAnalytics();
                   showToast('Food donated successfully!');
               } else {
                   await fetchInventory();
                   await fetchRecipes();
               }

               // Text-to-Speech confirmation
               if ('speechSynthesis' in window && data.reply) {
                 window.speechSynthesis.cancel(); // Cancel any ongoing speech
                 const utterance = new SpeechSynthesisUtterance(data.reply);
                 window.speechSynthesis.speak(utterance);
               }
           } else {
               showToast('Failed to process voice.', 'error');
               setLastVoiceReply('Sorry, I encountered an issue processing your request.');
           }
        } catch (err) {
           console.error('Voice Error:', err);
           showToast('Error processing voice.', 'error');
           setLastVoiceReply('Network error. Please try again.');
        }
        setIsScanning(false);
  };

  const handleGenerateRecipes = async () => {
    setIsGenerating(true);

    try {
      const headers = {};
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
      const res = await fetch(`${API_BASE_URL}/api/recipes/generate`, { 
          method: 'POST',
          headers: getAuthHeaders(headers)
      });

      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         showToast(data.msg || 'Failed to generate recipes with AI. Please check your API key.', 'error');
      } else {
         await fetchRecipes();
         showToast('New Zero-Waste recipes generated!');
         awardPoints(30);
      }
    } catch (err) { 
      console.error('Failed to generate recipes:', err); 
      showToast('Network error generating recipes. Please check your API key.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const awardPoints = async (pts) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      points: currentUser.points + pts
    };
    
    if (updatedUser.points >= 500) updatedUser.badge = 'Platinum';
    else if (updatedUser.points >= 300) updatedUser.badge = 'Gold';
    else if (updatedUser.points >= 150) updatedUser.badge = 'Silver';
    else updatedUser.badge = 'Bronze';

    setCurrentUser(updatedUser);
    localStorage.setItem('eco_user', JSON.stringify(updatedUser));

    // Also update locally in users array
    const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
    const userIdx = localUsers.findIndex(u => u.email === currentUser.email);
    if (userIdx !== -1) {
      localUsers[userIdx] = { ...localUsers[userIdx], points: updatedUser.points, badge: updatedUser.badge };
      localStorage.setItem('eco_users', JSON.stringify(localUsers));
    }

    try {
      await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id || currentUser._id, ...updatedUser })
      });
    } catch (err) {
      console.log('Server update failed, saved locally');
    }
  };

  const handleMarkPreserved = async (itemId, itemName) => {
    try {
      const targetId = itemId || itemName;
      if (itemId && !itemId.startsWith('offline_') && !itemId.startsWith('google_offline_')) {
        const res = await fetch(`${API_BASE_URL}/api/inventory/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
          showToast(`'${itemName}' preserved successfully! +10 XP`);
          await fetchInventory();
          await fetchAnalytics();
        }
      } else {
        const key = currentUser ? `eco_inventory_${currentUser.id || currentUser._id}` : 'eco_inventory_default';
        const local = localStorage.getItem(key);
        if (local) {
          const data = JSON.parse(local);
          const filtered = data.filter(i => i.id !== itemId && i._id !== itemId && i.name !== itemName);
          localStorage.setItem(key, JSON.stringify(filtered));
          setInventory(filtered);
          updateShoppingList(filtered);
          calculateLocalAnalytics(filtered);
          showToast(`'${itemName}' preserved locally! +10 XP`);
        }
      }
      awardPoints(10);
    } catch (err) {
      console.error('Failed to mark item as preserved:', err);
      showToast('Error preserving item', 'error');
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete ${itemName}?`)) return;
    try {
      if (itemId && !itemId.startsWith('offline_') && !itemId.startsWith('google_offline_')) {
        const res = await fetch(`${API_BASE_URL}/api/inventory/${itemId}`, {
          method: 'DELETE'
          ,headers: getAuthHeaders()
        });
        if (res.ok) {
          showToast(`'${itemName}' deleted successfully!`);
          await fetchInventory();
          await fetchAnalytics();
        }
      } else {
        const key = currentUser ? `eco_inventory_${currentUser.id || currentUser._id}` : 'eco_inventory_default';
        const local = localStorage.getItem(key);
        if (local) {
          const data = JSON.parse(local);
          const filtered = data.filter(i => i.id !== itemId && i._id !== itemId && i.name !== itemName);
          localStorage.setItem(key, JSON.stringify(filtered));
          setInventory(filtered);
          updateShoppingList(filtered);
          calculateLocalAnalytics(filtered);
          showToast(`'${itemName}' deleted locally!`);
        }
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('Error deleting item', 'error');
    }
  };

  const handleUpdateItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      if (editingItem._id && !editingItem._id.startsWith('offline_') && !editingItem._id.startsWith('google_offline_')) {
        const res = await fetch(`${API_BASE_URL}/api/inventory/${editingItem._id}`, {
          method: 'PUT',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          showToast(`'${editingItem.name}' updated!`);
          await fetchInventory();
        }
      } else {
        const key = currentUser ? `eco_inventory_${currentUser.id || currentUser._id}` : 'eco_inventory_default';
        const local = localStorage.getItem(key);
        if (local) {
          const data = JSON.parse(local);
          const idx = data.findIndex(i => i.id === editingItem.id || i._id === editingItem._id);
          if (idx !== -1) {
             data[idx] = editingItem;
             localStorage.setItem(key, JSON.stringify(data));
             setInventory(data);
             updateShoppingList(data);
             showToast(`'${editingItem.name}' updated locally!`);
          }
        }
      }
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update item:', err);
      showToast('Error updating item', 'error');
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) {
      setAuthError('Please fill in all credentials');
      return;
    }
    if (authMode === 'signup' && !authName) {
      setAuthError('Please provide a name');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.unverified) {
            localStorage.setItem('eco_temp_email', data.email);
            localStorage.setItem('eco_temp_otp', data.otp || '123456');
            setVerificationEmail(data.email);
            setDemoOtp(data.otp || '123456');
            setOtpTimer(120);
            setResendActive(false);
            setAuthView('verify');
            showToast('Account verification required', 'error');
          } else {
            setAuthError(data.msg || 'Invalid login details');
          }
        } else {
          setCurrentUser(data.user);
          localStorage.setItem('eco_user', JSON.stringify(data.user));
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('eco_token', data.token);
          }
          showToast(`Welcome back, ${data.user.name}!`);
          setAuthView('app');
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword, familyCode: authFamilyCode })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.msg || 'Registration failed');
        } else {
          localStorage.setItem('eco_temp_email', data.email);
          localStorage.setItem('eco_temp_otp', data.otp || '123456');
          setVerificationEmail(data.email);
          setDemoOtp(data.otp || '123456');
          setOtpTimer(120);
          setResendActive(false);
          setAuthView('verify');
          showToast('Verification code generated!');
        }
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating local authentication flow...', err);
      simulateLocalAuth();
    } finally {
      setAuthLoading(false);
    }
  };

  const simulateLocalAuth = () => {
    if (authMode === 'signin') {
      const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
      const user = localUsers.find(u => u.email === authEmail.toLowerCase());
      if (!user) {
        setAuthError('User not found. Try creating an account!');
        return;
      }
      if (user.password !== authPassword) {
        setAuthError('Incorrect password');
        return;
      }
      if (!user.isVerified) {
        localStorage.setItem('eco_temp_email', user.email);
        localStorage.setItem('eco_temp_otp', '123456');
        setVerificationEmail(user.email);
        setDemoOtp('123456');
        setOtpTimer(120);
        setResendActive(false);
        setAuthView('verify');
        showToast('Account verification required', 'error');
        return;
      }
      setCurrentUser(user);
      localStorage.setItem('eco_user', JSON.stringify(user));
      showToast(`Welcome back (offline), ${user.name}!`);
      setAuthView('app');
    } else {
      const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
      const exists = localUsers.some(u => u.email === authEmail.toLowerCase());
      if (exists) {
        setAuthError('Email already exists');
        return;
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser = {
        id: 'offline_' + Date.now(),
        name: authName,
        email: authEmail.toLowerCase(),
        password: authPassword,
        otp: otp,
        isVerified: false,
        dietaryRestrictions: 'None',
        householdSize: 2,

        points: 150,
        badge: 'Silver'
      };
      localUsers.push(newUser);
      localStorage.setItem('eco_users', JSON.stringify(localUsers));
      
      localStorage.setItem('eco_temp_email', newUser.email);
      localStorage.setItem('eco_temp_otp', otp);
      setVerificationEmail(newUser.email);
      setDemoOtp(otp);
      setOtpTimer(120);
      setResendActive(false);
      setAuthView('verify');
      showToast('Offline verification code generated!');
    }
  };

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    const code = otpArray.join('');
    if (code.length < 6) {
      setAuthError('Please enter the full 6-digit code');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, otp: code })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.msg || 'Invalid verification code');
      } else {
        setVerifySuccess(true);
        setTimeout(() => {
          setCurrentUser(data.user);
          localStorage.setItem('eco_user', JSON.stringify(data.user));
          localStorage.removeItem('eco_temp_email');
          localStorage.removeItem('eco_temp_otp');
          setVerifySuccess(false);
          setOtpArray(['', '', '', '', '', '']);
          setAuthView('app');
          showToast(`Account verified! Welcome, ${data.user.name}`);
        }, 1500);
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating local OTP verification...', err);
      const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
      const userIdx = localUsers.findIndex(u => u.email === verificationEmail.toLowerCase());
      if (userIdx === -1) {
        setAuthError('User not found');
        setAuthLoading(false);
        return;
      }
      
      const user = localUsers[userIdx];
      if (code !== user.otp && code !== demoOtp) {
        setAuthError('Invalid verification code');
        setAuthLoading(false);
        return;
      }

      setVerifySuccess(true);
      setTimeout(() => {
        user.isVerified = true;
        user.otp = null;
        localUsers[userIdx] = user;
        localStorage.setItem('eco_users', JSON.stringify(localUsers));
        
        setCurrentUser(user);
        localStorage.setItem('eco_user', JSON.stringify(user));
        localStorage.removeItem('eco_temp_email');
        localStorage.removeItem('eco_temp_otp');
        setVerifySuccess(false);
        setOtpArray(['', '', '', '', '', '']);
        setAuthView('app');
        showToast(`Account verified! Welcome, ${user.name}`);
      }, 1500);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.msg || 'Failed to resend code');
      } else {
        localStorage.setItem('eco_temp_otp', data.otp || '123456');
        setDemoOtp(data.otp || '123456');
        setOtpTimer(120);
        setResendActive(false);
        showToast('New verification code sent');
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating local OTP resend...', err);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
      const userIdx = localUsers.findIndex(u => u.email === verificationEmail.toLowerCase());
      if (userIdx !== -1) {
        localUsers[userIdx].otp = otp;
        localStorage.setItem('eco_users', JSON.stringify(localUsers));
      }
      localStorage.setItem('eco_temp_otp', otp);
      setDemoOtp(otp);
      setOtpTimer(120);
      setResendActive(false);
      showToast('New verification code generated (offline)');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedFields) => {
    if (!currentUser) return;
    const merged = { ...currentUser, ...updatedFields };
    
    setCurrentUser(merged);
    localStorage.setItem('eco_user', JSON.stringify(merged));

    const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
    const userIdx = localUsers.findIndex(u => u.email === currentUser.email);
    if (userIdx !== -1) {
      localUsers[userIdx] = { ...localUsers[userIdx], ...updatedFields };
      localStorage.setItem('eco_users', JSON.stringify(localUsers));
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userId: currentUser.id || currentUser._id, ...merged })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('eco_user', JSON.stringify(data.user));
        }
        showToast('Profile saved successfully!');
      } else {
        showToast('Saved to browser (offline)');
      }
    } catch (err) {
      console.warn('Backend server offline. Profile saved locally.', err);
      showToast('Saved to browser (offline)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eco_user');
    localStorage.removeItem('eco_token');
    setCurrentUser(null);
    setToken(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError('');
    setAuthView('login');
    setActiveSlide(0);
    showToast('Logged out successfully');
  };

  const handleChatSubmit = async (e, isVoiceInput = false) => {
    if (e && e.preventDefault) e.preventDefault();
    const messageToProcess = typeof e === 'string' ? e : chatInput;
    if (!messageToProcess.trim() || chatLoading) return;

    setChatInput('');
    setChatMessages(prev => [...prev, { text: messageToProcess, role: 'user' }]);
    setChatLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;

      // Extract last 10 messages for context window
      const historyToSend = chatMessages.slice(-10).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: messageToProcess, history: historyToSend })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, { text: data.reply, role: 'bot' }]);
        
        // Voice reply if input was voice
        if (isVoiceInput && 'speechSynthesis' in window) {
           // Basic markdown stripping for cleaner speech
           const cleanText = data.reply.replace(/[*#_]/g, '');
           const utterance = new SpeechSynthesisUtterance(cleanText);
           window.speechSynthesis.speak(utterance);
        }
      } else {
        setChatMessages(prev => [...prev, { text: data.msg || "I'm having trouble connecting to my brain right now. Please try again!", role: 'bot' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      simulateLocalChatResponse(messageToProcess);
    } finally {
      setChatLoading(false);
    }
  };

  const simulateLocalChatResponse = (userMsg) => {
    setTimeout(() => {
      let reply = "I'm currently running in offline demo mode, but I can see you want to chat! Connect the backend to MongoDB and set up your GROQ_API_KEY to unlock my full generative AI capability.";
      const msgLower = userMsg.toLowerCase();
      
      if (msgLower.includes('recipe') || msgLower.includes('cook') || msgLower.includes('eat')) {
        reply = `Offline AI Chef Recommendation: Since you're offline, I suggest looking at your Smart Recipes tab! You can prepare a **Zero-Waste stir fry** using your expiring ${inventory.length > 0 ? inventory[0].name : 'vegetables'}.`;
      } else if (msgLower.includes('preserve') || msgLower.includes('storage') || msgLower.includes('tip') || msgLower.includes('hack')) {
        reply = "Offline Preservation Hack: To keep leafy greens fresh, wrap them in a damp paper towel and store them in a sealed container in your fridge drawer. Try it and claim +10 points!";
      } else if (msgLower.includes('points') || msgLower.includes('badge') || msgLower.includes('rank')) {
        reply = "Eco Points Guide: You earn 50 points for every photo scan and 30 points for generating zero-waste recipes. Check your Profile page to see your current badge level!";
      }
      
      setChatMessages(prev => [...prev, { text: reply, role: 'bot' }]);
    }, 1000);
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otpArray];
      newOtp[index] = value;
      setOtpArray(newOtp);
      
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpArray[index] === '' && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          const newOtp = [...otpArray];
          newOtp[index - 1] = '';
          setOtpArray(newOtp);
        }
      }
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard' },
    { icon: <Camera size={24} />, label: 'Inventory Scanner' },
    { icon: <ChefHat size={24} />, label: 'Smart Recipes' },
    { icon: <Activity size={24} />, label: 'Sustainability Analytics' },
    { icon: <Settings size={24} />, label: 'Profile & AI Settings' },
    { icon: <Users size={24} />, label: 'Eco Community & Family Hub' }
  ];

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div className={`toast-notification ${toast.type}`}>
        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
        <span>{toast.message}</span>
      </div>
    );
  };
  // Stub for updateVolume (formerly a nested closure, now a no-op at provider scope)
  const updateVolume = () => {};

  const value = {
    activeSlide,
    setActiveSlide,

    isScanning,
    setIsScanning,
    hasScanned,
    setHasScanned,
    inventory,
    setInventory,
    recipes,
    setRecipes,
    isGenerating,
    setIsGenerating,
    isRecording,
    setIsRecording,
    uploadedImage,
    setUploadedImage,
    lastVoiceTranscript,
    setLastVoiceTranscript,
    lastVoiceReply,
    setLastVoiceReply,
    audioVolume,
    setAudioVolume,
    chatAudioVolume,
    setChatAudioVolume,
    scannedTags,
    setScannedTags,
    selectedRecipe,
    setSelectedRecipe,
    shoppingList,
    setShoppingList,
    currentUser,
    setCurrentUser,
    authView,
    setAuthView,
    authMode,
    setAuthMode,
    authName,
    setAuthName,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authFamilyCode,
    setAuthFamilyCode,
    inventorySearchQuery,
    setInventorySearchQuery,
    editingItem,
    setEditingItem,
    authError,
    setAuthError,
    authLoading,
    setAuthLoading,
    otpArray,
    setOtpArray,
    verificationEmail,
    setVerificationEmail,
    demoOtp,
    setDemoOtp,
    otpTimer,
    setOtpTimer,
    resendActive,
    setResendActive,
    verifySuccess,
    setVerifySuccess,
    toast,
    setToast,
    showGoogleSim,
    setShowGoogleSim,
    googleSimCustom,
    setGoogleSimCustom,
    googleSimEmail,
    setGoogleSimEmail,
    googleSimName,
    setGoogleSimName,
    chatOpen,
    setChatOpen,
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    chatLoading,
    setChatLoading,
    ngos,
    setNgos,
    userDonations,
    setUserDonations,
    showDonationModal,
    setShowDonationModal,
    selectedNgo,
    setSelectedNgo,
    donationCart,
    setDonationCart,
    userLocation,
    setUserLocation,
    scanHistory,
    setScanHistory,
    familyScans,
    setFamilyScans,
    familyChat,
    setFamilyChat,
    familyChatInput,
    setFamilyChatInput,
    familyRecipes,
    setFamilyRecipes,
    isChatRecording,
    setIsChatRecording,
    audioContextRef,
    analyserRef,
    animationFrameRef,
    chatAudioContextRef,
    chatAnalyserRef,
    chatAnimationFrameRef,
    fileInputRef,
    mediaRecorderRef,
    recognitionRef,
    chatRecognitionRef,
    chatMediaRecorderRef,
    showToast,
    handleHashChange,
    decodeJWT,
  simulateGoogleLoginLocal,
  calculateLocalAnalytics,
    updateShoppingList,
    triggerScan,
    getCoords,
  updateVolume,
  handleLogout,
  handleOtpChange,
  handleOtpKeyDown,
    renderToast,
  handleGoogleCredentialResponse,
    fetchAnalytics,
    fetchInventory,
    fetchRecipes,
    handleCookRecipe,
    fetchNgos,
    fetchScanHistory,
    fetchUserDonations,
    fetchFamilyData,
    handleSendFamilyMessage,
    submitDonation,
    handleFileChange,
    startChatVoiceRecordingMediaRecorder,
    startChatVoiceRecording,
    startVoiceRecordingMediaRecorder,
    startVoiceRecording,
    processVoiceTranscript,
    handleGenerateRecipes,
    awardPoints,
    handleMarkPreserved,
    handleDeleteItem,
    handleUpdateItemSubmit,
    handleAuthSubmit,
    handleVerifySubmit,
    handleResendOtp,
    handleProfileUpdate,
    handleChatSubmit,
    navItems,
    slideHashes
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
