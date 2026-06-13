import React, { useState, useEffect, useRef } from 'react';
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
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
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
  const [demoOtp, setDemoOtp] = useState(() => localStorage.getItem('eco_temp_otp') || '');
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes countdown
  const [resendActive, setResendActive] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Google Sign-In Selector Simulator State
  const [showGoogleSim, setShowGoogleSim] = useState(false);
  const [googleSimCustom, setGoogleSimCustom] = useState(false);
  const [googleSimEmail, setGoogleSimEmail] = useState('');
  const [googleSimName, setGoogleSimName] = useState('');

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

  // Hash change router listener
  useEffect(() => {
    if (!currentUser) return;
    
    const handleHashChange = () => {
      const hash = window.location.hash || '#dashboard';
      const index = slideHashes.indexOf(hash);
      if (index !== -1) {
        setActiveSlide(index);
      } else {
        window.location.hash = '#dashboard';
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Google credential decoder
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT token', e);
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    const payload = decodeJWT(response.credential);
    if (!payload) return;
    
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.msg || 'Google sign-in failed', 'error');
      } else {
        setCurrentUser(data.user);
        localStorage.setItem('eco_user', JSON.stringify(data.user));
        showToast(`Signed in with Google as ${data.user.name}`);
        setAuthView('app');
        window.location.hash = '#dashboard';
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating Google Sign-in locally...', err);
      simulateGoogleLoginLocal(payload.email, payload.name, payload.picture);
    } finally {
      setAuthLoading(false);
    }
  };

  const simulateGoogleLoginLocal = (email, name, picture) => {
    const localUsers = JSON.parse(localStorage.getItem('eco_users') || '[]');
    let user = localUsers.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      user = {
        id: 'google_offline_' + Date.now(),
        name: name || 'Google User',
        email: email.toLowerCase(),
        isVerified: true,
        dietaryRestrictions: 'None',
        householdSize: 2,

        points: 150,
        badge: 'Silver'
      };
      localUsers.push(user);
      localStorage.setItem('eco_users', JSON.stringify(localUsers));
    }
    
    setCurrentUser(user);
    localStorage.setItem('eco_user', JSON.stringify(user));
    showToast(`Signed in (offline) as ${user.name}`);
    setAuthView('app');
    window.location.hash = '#dashboard';
  };

  // Initialize Google SDK
  useEffect(() => {
    if (authView === 'login' && !currentUser) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      /* global google */
      if (typeof google !== 'undefined' && clientId) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse
          });
          google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            { theme: "outline", size: "large", width: 320 }
          );
        } catch (err) {
          console.error("Failed to initialize Google One-Tap SDK:", err);
        }
      }
    }
  }, [authView, currentUser]);

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

  const loadLocalInventory = () => {
    const key = currentUser ? `eco_inventory_${currentUser.id || currentUser._id}` : 'eco_inventory_default';
    const local = localStorage.getItem(key);
    if (local) {
      const data = JSON.parse(local);
      setInventory(data);
      updateShoppingList(data);
      calculateLocalAnalytics(data);
    } else {
      const defaultInv = [
        { name: 'Red Apples', confidenceScore: 98, expirationDate: new Date(Date.now() + 7 * 86400000).toISOString(), preservationTip: 'Store in a cool, dry place.' },
        { name: 'Cheddar Cheese', confidenceScore: 95, expirationDate: new Date(Date.now() + 14 * 86400000).toISOString(), preservationTip: 'Keep wrapped tightly.' }
      ];
      setInventory(defaultInv);
      updateShoppingList(defaultInv);
      calculateLocalAnalytics(defaultInv);
    }
  };

  const loadLocalRecipes = () => {
    const key = currentUser ? `eco_recipes_${currentUser.id || currentUser._id}` : 'eco_recipes_default';
    const local = localStorage.getItem(key);
    if (local) {
      setRecipes(JSON.parse(local));
    } else {
      setRecipes([
        { title: 'Zero-Waste Veggie Stir Fry', description: 'A quick stir fry utilizing your expiring vegetables. Saves ₹120', matchScore: 92, instructions: ['Chop veggies', 'Stir fry in pan', 'Serve hot'] },
        { title: 'Pantry Cleanout Soup', description: 'A warm, comforting soup that clears out the fridge. Saves ₹150', matchScore: 85, instructions: ['Simmer veggies in broth', 'Season to taste', 'Enjoy'] }
      ]);
    }
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
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
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
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      
      const res = await fetch(`${API_BASE_URL}/api/inventory`, { headers });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
        updateShoppingList(data);
      } else {
        loadLocalInventory();
      }
    } catch (err) { 
      console.error(err); 
      loadLocalInventory();
    }
  };

  const fetchRecipes = async () => {
    try {
      const headers = {};
      if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
      const res = await fetch(`${API_BASE_URL}/api/recipes`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      } else {
        loadLocalRecipes();
      }
    } catch (err) { 
      console.error(err); 
      loadLocalRecipes();
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
        headers,
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

  const fetchNgos = async () => {
    const getCoords = () => new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err),
        { timeout: 10000 }
      );
    });

    try {
      let url = `${API_BASE_URL}/api/donations/ngos`;
      try {
        const coords = await getCoords();
        setUserLocation(coords);
        url += `?lat=${coords.lat}&lng=${coords.lng}`;
      } catch (geoErr) {
        console.warn('Using default NGOs due to geolocation error:', geoErr.message);
      }

      const res = await fetch(url);
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
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/scans`, {
        headers: { 'x-user-id': currentUser.id || currentUser._id }
      });
      if (res.ok) {
        const data = await res.json();
        setScanHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDonations = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/donations`, {
        headers: { 'x-user-id': currentUser.id || currentUser._id }
      });
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
      const headers = { 'x-user-id': currentUser ? (currentUser.id || currentUser._id) : 'anonymous' };
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
      const res = await fetch(`${API_BASE_URL}/api/donations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser ? (currentUser.id || currentUser._id) : 'anonymous'
        },
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

  const saveLocalScan = (tags) => {
    setScannedTags(tags.map(t => ({ name: t.name, confidenceScore: t.confidenceScore, box: t.box })));
    const key = currentUser ? `eco_inventory_${currentUser.id || currentUser._id}` : 'eco_inventory_default';
    localStorage.setItem(key, JSON.stringify(tags));
    setInventory(tags);
    updateShoppingList(tags);
    calculateLocalAnalytics(tags);
    awardPoints(50);
  };

  const saveLocalRecipes = (newRecipes) => {
    setRecipes(newRecipes);
    const key = currentUser ? `eco_recipes_${currentUser.id || currentUser._id}` : 'eco_recipes_default';
    localStorage.setItem(key, JSON.stringify(newRecipes));
    awardPoints(30);
  };

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
        headers,
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
               headers,
               body: formData
           });
           if (res.ok) {
                const data = await res.json();
                await fetchInventory();
                await fetchAnalytics();
                awardPoints(25);
                
                const transcriptText = data.transcript || '';
                setLastVoiceTranscript(transcriptText);
                
                let replyText = '';
                if (data.items && data.items.length > 0) {
                  const names = data.items.map(i => i.name).join(', ');
                  replyText = `Added ${data.items.length} items to your pantry: ${names}.`;
                } else {
                  replyText = "I couldn't hear any food items in your speech. Please try again, naming items like apple, milk or bread.";
                }
                setLastVoiceReply(replyText);
                showToast(`✅ Voice processed!`);
                
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(replyText);
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
        showToast(`Processing input: "${transcript}"`);
        
        setIsScanning(true);
        try {
           const headers = { 'Content-Type': 'application/json' };
           if (currentUser) headers['x-user-id'] = currentUser.id || currentUser._id;
           const res = await fetch(`${API_BASE_URL}/api/inventory/voice`, {
               method: 'POST',
               headers,
               body: JSON.stringify({ transcript })
           });
           if (res.ok) {
               const data = await res.json();
               await fetchInventory();
               await fetchAnalytics();
               awardPoints(25);
               showToast('Items added successfully!');
               
               // Text-to-Speech confirmation
               if ('speechSynthesis' in window && data.items && data.items.length > 0) {
                 const names = data.items.map(i => i.name).join(', ');
                 const utterance = new SpeechSynthesisUtterance(`I have added ${data.items.length} items to your pantry: ${names}.`);
                 window.speechSynthesis.speak(utterance);
               }
           } else {
               showToast('Failed to process voice: Check your API Key.', 'error');
           }
        } catch (err) {
           console.error('Voice Error:', err);
           showToast('Network error processing voice. Check your API Key.', 'error');
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
        headers
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
          method: 'DELETE'
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
          headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id || currentUser._id, ...merged })
      });
      if (res.ok) {
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
    setCurrentUser(null);
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
      let reply = "I'm currently running in offline demo mode, but I can see you want to chat! Connect the backend to MongoDB and set up your GEMINI_API_KEY to unlock my full generative AI capability.";
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

  if (!currentUser && authView === 'login') {
    return (
      <div className="auth-fullscreen-container">
        {renderToast()}
        {showGoogleSim && (
          <div className="google-sim-overlay">
            <div className="google-sim-popup">
              <button className="google-sim-close" onClick={() => { setShowGoogleSim(false); setGoogleSimCustom(false); setAuthError(''); }}>&times;</button>
              <div className="google-sim-header">
                <svg width="40" height="40" viewBox="0 0 24 24" style={{ marginBottom: '12px' }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.09-.23-.17-.46-.23-.69z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <h2>Sign in with Google</h2>
                <p>to continue to <strong style={{ color: '#10b981' }}>Eco-Pantry</strong></p>
              </div>

              {!googleSimCustom ? (
                <div className="google-sim-accounts-list">
                  <div className="google-sim-account-item" onClick={() => { simulateGoogleLoginLocal('haritha.a@gmail.com', 'Haritha A.'); setShowGoogleSim(false); }}>
                    <div className="google-sim-avatar">H</div>
                    <div className="google-sim-info">
                      <span className="google-sim-name">Haritha A.</span>
                      <span className="google-sim-email">haritha.a@gmail.com</span>
                    </div>
                  </div>
                  <div className="google-sim-account-item" onClick={() => { simulateGoogleLoginLocal('admin@eco-pantry.org', 'Admin User'); setShowGoogleSim(false); }}>
                    <div className="google-sim-avatar">A</div>
                    <div className="google-sim-info">
                      <span className="google-sim-name">Admin User</span>
                      <span className="google-sim-email">admin@eco-pantry.org</span>
                    </div>
                  </div>
                  <div className="google-sim-account-item custom-trigger" onClick={() => setGoogleSimCustom(true)}>
                    <div className="google-sim-avatar">+</div>
                    <div className="google-sim-info">
                      <span className="google-sim-name" style={{ color: '#4285F4' }}>Use another account</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="google-sim-custom-form" onSubmit={(e) => {
                  e.preventDefault();
                  if (googleSimEmail && googleSimName) {
                    simulateGoogleLoginLocal(googleSimEmail, googleSimName, null);
                    setShowGoogleSim(false);
                    setGoogleSimCustom(false);
                    setGoogleSimEmail('');
                    setGoogleSimName('');
                  }
                }}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Jane Doe" 
                      value={googleSimName} 
                      onChange={e => setGoogleSimName(e.target.value)} 
                      required 
                      className="google-sim-input"
                    />
                  </div>
                  <div className="input-group" style={{ marginTop: '10px' }}>
                    <label>Google Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@gmail.com" 
                      value={googleSimEmail} 
                      onChange={e => setGoogleSimEmail(e.target.value)} 
                      required 
                      className="google-sim-input"
                    />
                  </div>
                  <div className="google-sim-form-buttons" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button className="btn-primary" type="button" onClick={() => setGoogleSimCustom(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}>Back</button>
                    <button className="btn-primary" type="submit" style={{ flex: 1, background: '#4285F4' }}>Sign In</button>
                  </div>
                </form>
              )}

              <div className="google-sim-footer">
                <span>To use real Google Sign-in, set up a Google Cloud Client ID in your .env file as <code>VITE_GOOGLE_CLIENT_ID</code>.</span>
              </div>
            </div>
          </div>
        )}
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

          <div className="social-login-divider">
            <span>or connect with</span>
          </div>

          <div className="social-buttons" style={{ display: 'flex', width: '100%' }}>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
            ) : (
              <button className="social-btn google-full-width" type="button" onClick={() => setShowGoogleSim(true)} style={{ width: '100%' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}><path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.438-2.883-6.438-6.438s2.883-6.438 6.438-6.438c1.555 0 2.977.553 4.093 1.472l3.176-3.176C19.141 1.83 15.938 1 12.24 1 5.614 1 .25 6.364.25 13s5.364 12 11.99 12c6.915 0 11.77-4.86 11.77-12 0-.785-.068-1.505-.2-2.285H12.24z"/></svg>
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged Out: Render OTP Verification Page
  if (!currentUser && authView === 'verify') {
    return (
      <div className="auth-fullscreen-container">
        {renderToast()}
        <div className="auth-decor-blob green"></div>
        <div className="auth-decor-blob teal"></div>
        
        <div className="glass-panel auth-card otp-card">
          <button className="back-auth-btn" onClick={() => setAuthView('login')}>
            <ArrowLeft size={16} /> Back to login
          </button>
          
          <div className="auth-header">
            <div className={`otp-shield-icon ${verifySuccess ? 'success' : ''}`}>
              {verifySuccess ? <CheckCircle size={40} /> : <Lock size={40} />}
            </div>
            <h1 className="auth-title">Verify Account</h1>
            <p className="auth-subtitle">We sent a verification code to <br/><strong style={{ color: 'var(--accent-teal)' }}>{verificationEmail}</strong></p>
          </div>

          {verifySuccess ? (
            <div className="otp-success-message">
              <h3>Verification Successful!</h3>
              <p>Entering your eco-dashboard...</p>
            </div>
          ) : (
            <>
              {authError && (
                <div className="auth-error-box">
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="otp-form">
                <div className="otp-input-grid">
                  {otpArray.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKeyDown(e, i)}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button className="auth-btn btn-primary" type="submit" disabled={authLoading}>
                  {authLoading ? <div className="loader-spinner"></div> : 'Confirm Code'}
                </button>
              </form>

              <div className="otp-timer-section">
                {resendActive ? (
                  <button className="resend-link-btn" onClick={handleResendOtp} disabled={authLoading}>
                    <RefreshCw size={14} /> Resend OTP Code
                  </button>
                ) : (
                  <span className="timer-text">
                    Resend code in <strong style={{ color: 'var(--accent-green)' }}>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong>
                  </span>
                )}
              </div>

              {demoOtp && (
                <div className="demo-otp-banner">
                  <Sparkles size={16} color="var(--warning)" />
                  <span>Demo Mode: Code is <strong style={{ color: 'var(--text-primary)' }}>{demoOtp}</strong></span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // 3. Logged In: Render Main Application
  return (
    <div className="app-container">
      {renderToast()}
      
      {/* Sidebar */}
      <nav className="sidebar">
        <div style={{ color: 'var(--accent-green)', padding: '0.5rem', marginBottom: '2rem' }}>
          <Leaf size={32} />
        </div>
        
        {/* Navigation Items */}
        <div className="nav-items-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', flex: 1 }}>
          {navItems.map((item, index) => (
            <div 
              key={index}
              className={`nav-item ${activeSlide === index ? 'active' : ''}`}
              onClick={() => { window.location.hash = slideHashes[index]; }}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* User profile at the bottom of the sidebar */}
        {currentUser && (
          <div className="sidebar-profile-widget" onClick={() => { window.location.hash = '#profile'; }}>
            <div className="sidebar-avatar">
              {currentUser.picture ? (
                <img src={currentUser.picture} alt={currentUser.name} />
              ) : (
                currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
              )}
              <div className="avatar-active-dot"></div>
            </div>
            <div className="sidebar-profile-details">
              <span className="sidebar-profile-name">{currentUser.name}</span>
              <span className="sidebar-profile-tier">{currentUser.badge} Tier</span>
            </div>
            <button className="sidebar-logout-icon" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div 
          className="slides-container"
          style={{ width: '600vw', transform: `translateX(-${activeSlide * 100}vw)` }}
        >
          {/* Slide 1: Dashboard */}
          <section className={`slide ${activeSlide === 0 ? 'active' : ''}`}>
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="header-title">Eco-Pantry</h1>
                <p className="header-subtitle">Your food sustainability command center</p>
              </div>
              {currentUser && (
                <div className="user-greeting">
                  <span>Welcome, <strong>{currentUser.name}</strong></span>
                  <div className="badge-chip"><Award size={14} /> {currentUser.badge} Tier</div>
                </div>
              )}
            </div>
            
            <div className="dashboard-grid">


              <div className="glass-panel horizontal-scroll-container">
                <h3 className="section-title">
                  <Clock size={20} color="var(--warning)" />
                  Expiring Soon
                </h3>
                <div className="horizontal-scroll">
                  {inventory.length > 0 ? [...inventory].sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate)).map((item, index) => {
                     const daysToExpire = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                     let heatClass = 'heat-green';
                     if (daysToExpire <= 3) heatClass = 'heat-red';
                     else if (daysToExpire <= 7) heatClass = 'heat-yellow';
                     
                     return (
                        <div key={index} className={`item-card ${heatClass}`}>
                          <div className="item-icon-wrapper">
                            {daysToExpire <= 3 ? <AlertCircle size={20} /> : <Clock size={20} />}
                          </div>
                          <div className="item-name">{item.name}</div>
                          <div className="item-expiry">Expires in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}</div>
                        </div>
                     )
                  }) : (
                     <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No items. Scan your fridge to begin!</div>
                  )}
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" onClick={() => { window.location.hash = '#recipes'; handleGenerateRecipes(); }}>
                    <Sparkles size={18} />
                    Auto-Generate Recipes
                  </button>
                  <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} onClick={() => { window.location.hash = '#scanner'; }}>
                    <Camera size={18} />
                    Scan New Items
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="section-title">My Eco-Pantry</h3>
                  <input 
                    type="text" 
                    placeholder="Search pantry..." 
                    className="input-field" 
                    style={{ width: '250px' }} 
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                  />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>View, search, edit, and delete your scanned items.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {inventory
                    .filter(i => i.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || i.category.toLowerCase().includes(inventorySearchQuery.toLowerCase()))
                    .map((item, index) => {
                      const daysToExpire = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={index} className="item-card" style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                             <div className="item-name">{item.name}</div>
                             <div style={{ display: 'flex', gap: '0.5rem' }}>
                               <button onClick={() => setEditingItem(item)} style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer' }} title="Edit"><RefreshCw size={14} /></button>
                               <button onClick={() => handleDeleteItem(item._id || item.id, item.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><LogOut size={14} /></button>
                             </div>
                          </div>
                          <div className="item-expiry" style={{ marginTop: '0.5rem' }}>Expires in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{item.category}</div>
                        </div>
                      )
                    })
                  }
                  {inventory.length > 0 && inventory.filter(i => i.name.toLowerCase().includes(inventorySearchQuery.toLowerCase())).length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No items match your search.</div>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 12' }}>
                <h3 className="section-title">Smart Grocery Anti-List</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Prevents duplicate buying by cross-referencing your scanned fridge items.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {shoppingList.map((item, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: item.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: item.inStock ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: item.inStock ? 'line-through' : 'none',
                      border: item.inStock ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      {item.name}
                      {item.inStock && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>IN STOCK</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Slide 2: Inventory Scanner */}
          <section className={`slide ${activeSlide === 1 ? 'active' : ''}`}>
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
          </section>

          {/* Slide 3: Smart Recipes */}
          <section className={`slide ${activeSlide === 2 ? 'active' : ''}`}>
            <h2 className="header-title">AI-Optimized "Zero-Waste" Recipes</h2>
            <p className="header-subtitle">Generative AI creates recipes based on ingredients nearing expiration.</p>
            
            <div className="recipe-grid">
              {isGenerating ? (
                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                  <div className="glass-loader"></div>
                  <div className="processing-text">Gemini AI is Cooking...</div>
                </div>
              ) : (
                <>
                  {recipes.length > 0 ? recipes.map((recipe, index) => (
                    <div key={index} className="glass-panel recipe-card">
                      <div className="ai-badge"><Sparkles size={12} /> {recipe.matchScore}% Zero-Waste Match</div>
                      <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{recipe.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {recipe.description}
                      </p>
                      <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => setSelectedRecipe(recipe)}>
                        View Recipe <ArrowRight size={16} />
                      </button>
                    </div>
                  )) : (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      <ChefHat size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>No recipes generated. Let Gemini AI create Zero-Waste recipes for you!</p>
                    </div>
                  )}

                  {!isGenerating && (
                    <div className="glass-panel recipe-card" style={{ border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', cursor: 'pointer' }} onClick={handleGenerateRecipes}>
                      <div style={{ color: 'var(--accent-teal)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={32} />
                        <strong>Generate with AI</strong>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Slide 4: Analytics */}
          <section className={`slide ${activeSlide === 3 ? 'active' : ''}`}>
            <h2 className="header-title">Sustainability Analytics</h2>
            <p className="header-subtitle">Real-time data visualization of your environmental contribution.</p>
            
            <div className="dashboard-grid">
              <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h3 className="section-title">Smart Waste Prediction & Trends</h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  
                  {/* Left: Alerts */}
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Smart Alerts</h4>
                    {inventory.filter(i => {
                      const days = Math.ceil((new Date(i.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return days > 0 && days <= 5;
                    }).length > 0 ? (
                      inventory.filter(i => {
                        const days = Math.ceil((new Date(i.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return days > 0 && days <= 5;
                      }).slice(0, 3).map((item, idx) => {
                        const days = Math.ceil((new Date(item.expirationDate) - new Date()) / 86400000);
                        return (
                          <div key={idx} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', marginBottom: '0.5rem', borderRadius: '4px' }}>
                            <strong style={{ color: '#ef4444' }}>{item.name} may expire in {days} days.</strong> Consider adding to a zero-waste recipe!
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--accent-green)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--accent-green)' }}>No items expiring soon. Great job!</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Bar Chart */}
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Weekly Food Waste (kg)</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                      {[
                        { week: '3 Wks Ago', value: 4.2, h: '80%' },
                        { week: '2 Wks Ago', value: 3.1, h: '60%' },
                        { week: 'Last Wk', value: 2.0, h: '40%' },
                        { week: 'This Wk', value: 0.5, h: '15%' }
                      ].map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 'bold' }}>{data.value}kg</span>
                          <div style={{ width: '60%', height: data.h, background: idx === 3 ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{data.week}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 className="section-title">
                      <Leaf size={20} color="var(--accent-green)" /> 
                      Emergency Food Donation 
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Have extra food? Request a pickup from a local NGO before it expires.</p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowDonationModal(true)} style={{ background: 'var(--accent-teal)' }}>
                    <Sparkles size={18} /> New Donation Request
                  </button>
                </div>

                {userDonations.length > 0 && (
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Active Donation Tracking</h4>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {userDonations.map((don, i) => (
                        <div key={i} style={{ minWidth: '250px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--accent-green)' }}>{don.ngoName}</strong>
                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--warning)', color: '#000', borderRadius: '10px', fontWeight: 'bold' }}>{don.status}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {don.items.length} items donated
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  {userLocation ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=NGO,food bank near ${userLocation.lat},${userLocation.lng}&z=13&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      <p>Allow location access to view nearby NGOs on the map.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Slide 5: User Profile & AI Settings */}
          <section className={`slide ${activeSlide === 4 ? 'active' : ''}`}>
            <h2 className="header-title">User Profile & AI settings</h2>
            <p className="header-subtitle">Manage your personal credentials, eco status, and dietary recommendations.</p>
            
            <div className="profile-dashboard-grid">
              {/* Left Column: Stats & Badge Card */}
              <div className="glass-panel profile-summary-card">
                <div className="avatar-wrapper">
                  <div className="profile-large-avatar">
                    {currentUser.picture ? (
                      <img src={currentUser.picture} alt={currentUser.name} />
                    ) : (
                      currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="glow-ring"></div>
                </div>

                <h2 className="profile-name">{currentUser.name}</h2>
                <p className="profile-email">{currentUser.email}</p>
                <div className="badge-tier-banner">
                  <Award size={18} />
                  <span>{currentUser.badge} Level Member</span>
                </div>

                <div className="profile-points-progress">
                  <div className="progress-labels">
                    <span>Points: {currentUser.points}</span>
                    <span>Next Rank: 500</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (currentUser.points / 500) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="stats-row">

                  <div className="stat-box">
                    <Sparkles size={20} color="var(--warning)" />
                    <span className="stat-val">{currentUser.points}</span>
                    <span className="stat-lbl">Eco Points</span>
                  </div>
                  <div className="stat-box">
                    <ChefHat size={20} color="var(--accent-teal)" />
                    <span className="stat-val">{inventory.length}</span>
                    <span className="stat-lbl">Pantry Items</span>
                  </div>
                </div>

                <div className="achievements-section">
                  <h4 className="achievements-title">Eco Badges Earned</h4>
                  <div className="achievements-grid">
                    <div className={`achievement-badge-card ${currentUser.points >= 150 ? 'active' : ''}`} title="Early Adopter: Complete signup & verification">
                      <div className="badge-icon">🌱</div>
                      <span>Adopter</span>
                    </div>
                    <div className={`achievement-badge-card ${currentUser.points >= 200 ? 'active' : ''}`} title="Zero-Waste Hero: Accumulate 200+ eco points">
                      <div className="badge-icon">⚡</div>
                      <span>Hero</span>
                    </div>
                    <div className={`achievement-badge-card ${inventory.length > 2 ? 'active' : ''}`} title="Pantry Master: Keep active pantry digitized">
                      <div className="badge-icon">📦</div>
                      <span>Pantry</span>
                    </div>
                    <div className={`achievement-badge-card ${recipes.length > 0 ? 'active' : ''}`} title="Green Chef: Generate Zero-Waste recipes">
                      <div className="badge-icon">🍳</div>
                      <span>Chef</span>
                    </div>
                  </div>
                </div>

                <button className="btn-logout" onClick={handleLogout}>
                  <LogOut size={16} /> Logout Account
                </button>
              </div>

              {/* Right Column: Update Preferences & AI System prompts */}
              <div className="glass-panel profile-settings-card">
                <h3 className="section-title" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  <Settings size={20} color="var(--accent-green)" />
                  Account Settings
                </h3>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const name = e.target.elements.profileName.value;
                  const email = e.target.elements.profileEmail.value;
                  handleProfileUpdate({ name, email });
                }} className="settings-form">
                  
                  <div className="input-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      name="profileName" 
                      defaultValue={currentUser.name} 
                      className="settings-input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="profileEmail" 
                      defaultValue={currentUser.email} 
                      className="settings-input"
                      required
                    />
                  </div>

                  <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                    Save Account Info
                  </button>
                </form>

                <h3 className="section-title" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', margin: '2rem 0 1.5rem 0' }}>
                  <Sparkles size={20} color="var(--accent-teal)" />
                  AI Preferences & Prompts
                </h3>

                <div className="preferences-settings" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dietary Restriction</label>
                    <select 
                      value={currentUser.dietaryRestrictions || 'None'}
                      onChange={(e) => handleProfileUpdate({ dietaryRestrictions: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}
                    >
                      <option value="None">None</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Keto">Keto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Household Size</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {[1, 2, 3].map((size) => (
                        <button 
                          key={size}
                          className="btn-primary" 
                          style={{ 
                            flex: 1, 
                            background: (currentUser.householdSize || 2) === size ? 'var(--accent-green)' : 'rgba(16, 185, 129, 0.2)' 
                          }}
                          onClick={() => handleProfileUpdate({ householdSize: size })}
                        >
                          {size === 3 ? '3+' : size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>LLM System Prompt Preview</label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8, marginBottom: '0.5rem' }}>This instruction is passed to Gemini during Zero-Waste recipe generation:</p>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--accent-teal)' }}>
                      <code style={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                        "Ensure all generated recipes are 100% {currentUser.dietaryRestrictions || 'None'} and scaled exactly for {currentUser.householdSize || 2} portions. Prioritize expiring vegetables first."
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Slide 6: Eco Community */}
          <section className={`slide ${activeSlide === 5 ? 'active' : ''}`}>
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
          </section>

        </div>
      </main>

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

    </div>
  );
}

export default App;
