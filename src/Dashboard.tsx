import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Wind, Thermometer, MapPin, 
  Shirt, HeartPulse, FileSignature, 
  CheckCircle, Video, DownloadCloud, ChevronRight, Check,
  Sun, Moon, Waves, X, Compass
} from 'lucide-react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { GoogleGenAI, Type } from '@google/genai';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function Dashboard() {
  const { id } = useParams();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'reservations', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBookingData(data);
        setWetsuitSize(data.wetsuitSize || 'None');
        setHealthStatus(data.healthStatus || 'pending');
        setWaiverStatus(data.waiverStatus || 'pending');
        setExperienceLevel(data.experience || null);
        setSafetyChecks({
          signals: data.flightSchool || false,
          falling: data.flightSchool || false,
          equipment: data.flightSchool || false
        });
      }
    });
    return () => unsubscribe();
  }, [id]);

  const updateReservation = async (field: string, value: any) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'reservations', id), {
        [field]: value
      });
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [wetsuitSize, setWetsuitSize] = useState("None");
  
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherData, setWeatherData] = useState({
    windSpeed: '--',
    waterTemp: '--',
    tideStatus: '--',
    tideTime: '--'
  });

  useEffect(() => {
    async function fetchConditions() {
      setIsLoadingWeather(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Find the current weather and tide conditions for Cabanas de Tavira, Ria Formosa, Portugal. Return a JSON object with windSpeed (number in knots), waterTemp (number in Celsius), tideStatus (e.g., 'Rising', 'Falling'), and tideTime (e.g., 'High at 14:30').",
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                windSpeed: { type: Type.STRING },
                waterTemp: { type: Type.STRING },
                tideStatus: { type: Type.STRING },
                tideTime: { type: Type.STRING }
              },
              required: ["windSpeed", "waterTemp", "tideStatus", "tideTime"]
            }
          }
        });
        
        if (response.text) {
          const data = JSON.parse(response.text);
          setWeatherData(data);
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setIsLoadingWeather(false);
      }
    }
    
    fetchConditions();
  }, []);
  
  const [healthStatus, setHealthStatus] = useState<'pending' | 'fit'>('pending');
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  
  const [waiverStatus, setWaiverStatus] = useState<'pending' | 'signed'>('pending');
  const [showWaiverPopup, setShowWaiverPopup] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [showExperiencePopup, setShowExperiencePopup] = useState(false);

  const [safetyChecks, setSafetyChecks] = useState({
    signals: false,
    falling: false,
    equipment: false
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Mock countdown effect
  useEffect(() => {
    if (!bookingData || !bookingData.date || !bookingData.sessionTime) {
      // Fallback if no booking data
      setTimeLeft("02:14:00");
      return;
    }

    const calculateTimeLeft = () => {
      // sessionTime is either "morning" or "evening"
      const sessionHour = bookingData.sessionTime === 'morning' ? 10 : 15;
      
      // bookingData.date is like "2026-03-24"
      const sessionDate = new Date(`${bookingData.date}T${sessionHour.toString().padStart(2, '0')}:00:00`);
      
      const now = new Date();
      const difference = sessionDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        return "00:00:00";
      }
      
      const totalSeconds = Math.floor(difference / 1000);
      const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = (totalSeconds % 60).toString().padStart(2, '0');
      
      return `${h}:${m}:${s}`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [bookingData]);

  const toggleCheck = async (key: keyof typeof safetyChecks) => {
    const newChecks = { ...safetyChecks, [key]: !safetyChecks[key] };
    setSafetyChecks(newChecks);
    if (newChecks.signals && newChecks.falling && newChecks.equipment) {
      await updateReservation('flightSchool', true);
    } else {
      await updateReservation('flightSchool', false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy pb-24 transition-colors duration-300 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/80' : 'bg-black/20'} z-10`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b from-navy ${isDarkMode ? 'via-navy/60' : 'via-navy/10'} to-navy z-10`}></div>
        <img 
          src="/assets/pool-water-bg.jpg" 
          alt="Pool water background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Header */}
      <header className="py-6 px-6 border-b border-white/10 bg-navy/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 relative">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
              alt="FlyFoil Formosa" 
              className="h-12 w-auto object-contain" 
            />
          </Link>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-silver/80 hidden sm:block">Flight Deck</div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-16 relative z-10">
        
        {/* 1. Live Mission Status (Hero) */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-5xl font-display font-black mb-4 tracking-tighter uppercase leading-none">
              Thanks for reserving, <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-blue-400">{bookingData?.fullName?.split(' ')[0] || 'Alex'}</span>
            </h1>
            
            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-md">
              <p className="text-silver/90 text-lg font-light uppercase tracking-widest mb-2">Your flight status</p>
              <div className="text-5xl md:text-7xl font-mono font-bold text-white tracking-tight">
                {timeLeft}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weather Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4 text-silver">
                <Wind className="text-electric" size={24} />
                <span className="font-medium uppercase tracking-wider text-sm">Wind Speed</span>
              </div>
              <div>
                {isLoadingWeather ? (
                  <div className="h-9 w-24 bg-white/10 animate-pulse rounded mb-1"></div>
                ) : (
                  <div className="text-3xl font-bold text-white">{weatherData.windSpeed} <span className="text-lg text-silver/60 font-normal">knots</span></div>
                )}
                <div className="text-sm text-emerald-400 mt-1">Optimal for eFoiling</div>
              </div>
            </motion.div>

            {/* Water Temp Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4 text-silver">
                <Thermometer className="text-electric" size={24} />
                <span className="font-medium uppercase tracking-wider text-sm">Water Temp</span>
              </div>
              <div>
                {isLoadingWeather ? (
                  <div className="h-9 w-24 bg-white/10 animate-pulse rounded mb-1"></div>
                ) : (
                  <div className="text-3xl font-bold text-white">{weatherData.waterTemp}°<span className="text-lg text-silver/60 font-normal">C</span></div>
                )}
                <div className="text-sm text-silver/80 mt-1">Comfortable</div>
              </div>
            </motion.div>

            {/* Tide Status Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4 text-silver">
                <Waves className="text-electric" size={24} />
                <span className="font-medium uppercase tracking-wider text-sm">Tide Status</span>
              </div>
              <div>
                {isLoadingWeather ? (
                  <div className="h-9 w-24 bg-white/10 animate-pulse rounded mb-1"></div>
                ) : (
                  <div className="text-3xl font-bold text-white">{weatherData.tideStatus}</div>
                )}
                {isLoadingWeather ? (
                  <div className="h-5 w-32 bg-white/10 animate-pulse rounded mt-1"></div>
                ) : (
                  <div className="text-sm text-silver/80 mt-1">{weatherData.tideTime}</div>
                )}
              </div>
            </motion.div>

            {/* Launch Spot Pin */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-navy-light to-navy border border-white/10 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] opacity-20 bg-cover bg-center group-hover:opacity-30 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <MapPin className="text-[#D4AF37]" size={24} />
                  <span className="font-medium uppercase tracking-wider text-sm">Launch Spot</span>
                </div>
                <div className="text-lg font-bold text-white mb-4">Cabanas de Tavira</div>
                <a href="https://maps.google.com/?q=Cabanas+de+Tavira" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-white text-navy font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  OPEN IN MAPS <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 1.5 Booking Details */}
        {bookingData && (
          <section>
            <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
              <span className="w-8 h-px bg-electric"></span> Booking Details
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-lg font-medium text-white">{bookingData.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-lg font-medium text-white">{bookingData.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-lg font-medium text-white">{bookingData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="text-lg font-medium text-white">{bookingData.date || 'N/A'} <span className="capitalize">{bookingData.sessionTime ? `(${bookingData.sessionTime})` : ''}</span></p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-lg font-medium text-white">{bookingData.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-lg font-medium text-white">{bookingData.experience || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Gear & Profile Management */}
        <section>
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> Gear & Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Shirt className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Wetsuit Match</h3>
                <p className="text-sm text-silver/80 mb-3">Select your size (Please request 24h in advance)</p>
              </div>
              <div className="relative">
                <select 
                  value={wetsuitSize}
                  onChange={(e) => updateReservation('wetsuitSize', e.target.value)}
                  className="w-full bg-navy border border-white/20 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-electric appearance-none cursor-pointer"
                >
                  <option value="None">No Wetsuit</option>
                  <option value="XS">Size XS</option>
                  <option value="S">Size S</option>
                  <option value="M">Size M</option>
                  <option value="L">Size L</option>
                  <option value="XL">Size XL</option>
                  <option value="XXL">Size XXL</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-silver pointer-events-none rotate-90" size={16} />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <HeartPulse className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Physical Condition</h3>
                <p className="text-sm text-silver/80 mb-3">Health check required</p>
              </div>
              <button 
                onClick={() => setShowHealthPopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  healthStatus === 'fit' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {healthStatus === 'fit' ? <><CheckCircle size={16} /> Green Light</> : 'Complete Check'}
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <FileSignature className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Waiver Status</h3>
                <p className="text-sm text-silver/80 mb-4">Digital liability form</p>
              </div>
              <button 
                onClick={() => setShowWaiverPopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  waiverStatus === 'signed' 
                    ? 'bg-electric/20 text-electric border border-electric/50' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {waiverStatus === 'signed' ? <><Check size={18} /> SIGNED</> : 'Review & Sign'}
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Compass className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Experience Level</h3>
                <p className="text-sm text-silver/80 mb-4">Help us tailor your session</p>
              </div>
              <button 
                onClick={() => setShowExperiencePopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  experienceLevel 
                    ? 'bg-electric/20 text-electric border border-electric/50' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {experienceLevel ? <><Check size={18} /> LOGGED</> : 'Set Experience'}
              </button>
            </div>
          </div>
        </section>

        {/* 3. The "Flight School" (Educational) */}
        <section>
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> Flight School
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-navy-light relative aspect-video">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/FenSw41WbvQ?si=xewKNHlSgTNQ82us&controls=1&rel=0&modestbranding=1" 
                title="Safety Briefing Checklist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wider">Safety Briefing Checklist</h3>
              <p className="text-silver/80 text-sm mb-6">Please review the video and check off the following before you arrive.</p>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" className="peer sr-only" checked={safetyChecks.signals} onChange={() => toggleCheck('signals')} />
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-electric peer-checked:border-electric transition-colors flex items-center justify-center">
                      <Check size={14} className="text-navy opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${safetyChecks.signals ? 'text-white' : 'text-silver/80'}`}>
                    I understand the basic hand signals for communication on the water.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" className="peer sr-only" checked={safetyChecks.falling} onChange={() => toggleCheck('falling')} />
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-electric peer-checked:border-electric transition-colors flex items-center justify-center">
                      <Check size={14} className="text-navy opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${safetyChecks.falling ? 'text-white' : 'text-silver/80'}`}>
                    I know how to fall safely (away from the board and foil).
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" className="peer sr-only" checked={safetyChecks.equipment} onChange={() => toggleCheck('equipment')} />
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-electric peer-checked:border-electric transition-colors flex items-center justify-center">
                      <Check size={14} className="text-navy opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${safetyChecks.equipment ? 'text-white' : 'text-silver/80'}`}>
                    I understand how to release the throttle immediately if I lose balance.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 4. The "After-Flight" Gallery */}
        <section className="pb-12">
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> After-Flight Gallery
          </h2>
          <div className="bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <DownloadCloud className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white mb-1 uppercase tracking-wider">Cloud Folder: Your Session Media</h3>
                <p className="text-silver/80 text-sm">Return here after your flight to find the link to your GoPro footage and drone shots.</p>
              </div>
            </div>
            <button className="w-full md:w-auto px-8 py-3 bg-white/10 text-white/50 border border-white/20 font-bold rounded-xl text-sm cursor-not-allowed flex items-center justify-center gap-2 shrink-0">
              AVAILABLE POST-FLIGHT
            </button>
          </div>
        </section>

      </main>

      {/* Modals */}
      <AnimatePresence>
        {showHealthPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy border border-white/10 rounded-2xl p-6 max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setShowHealthPopup(false)} className="absolute top-4 right-4 text-silver hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-2xl font-display font-black mb-4 flex items-center gap-2 uppercase">
                <HeartPulse className="text-electric" /> Health Declaration
              </h3>
              <div className="space-y-4 text-silver/90 text-sm mb-6">
                <p>To ensure your safety during the eFoil experience, please confirm the following:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>I do not have any severe heart conditions or cardiovascular issues.</li>
                  <li>I am not currently pregnant.</li>
                  <li>I do not have any back, neck, or joint injuries that could be aggravated by falling into water.</li>
                  <li>I am a capable swimmer and comfortable in open water.</li>
                  <li>I am not under the influence of alcohol or drugs.</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowHealthPopup(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    updateReservation('healthStatus', 'fit');
                    setShowHealthPopup(false);
                  }}
                  className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold rounded-xl text-sm hover:bg-emerald-500/30 transition-colors"
                >
                  I Confirm I am Fit
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showWaiverPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy border border-white/10 rounded-2xl p-6 max-w-lg w-full relative shadow-2xl"
            >
              <button onClick={() => setShowWaiverPopup(false)} className="absolute top-4 right-4 text-silver hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-2xl font-display font-black mb-4 flex items-center gap-2 uppercase">
                <FileSignature className="text-electric" /> Liability Waiver
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-64 overflow-y-auto text-silver/80 text-sm mb-6 space-y-4">
                <p className="font-bold text-white">RELEASE OF LIABILITY, WAIVER OF CLAIMS, EXPRESS ASSUMPTION OF RISK AND INDEMNITY AGREEMENT</p>
                <p>Please read and be certain you understand the implications of signing.</p>
                <p>1. I understand that eFoiling involves inherent risks, including but not limited to: falling into water, impact with the board or foil, marine life encounters, and varying weather/water conditions.</p>
                <p>2. I agree to wear the provided personal flotation device (PFD) and helmet at all times while on the water.</p>
                <p>3. I agree to follow all instructions provided by the instructor and acknowledge that failure to do so may result in the immediate termination of my session without refund.</p>
                <p>4. I hereby release, waive, and discharge FlyFoil, its instructors, and affiliates from any and all liability, claims, demands, or causes of action arising out of any damage, loss, or injury to me or my property.</p>
                <p>By clicking "I Agree & Sign", I acknowledge that I have read this document in its entirety and fully understand its terms.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowWaiverPopup(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    updateReservation('waiverStatus', 'signed');
                    setShowWaiverPopup(false);
                  }}
                  className="flex-1 py-3 bg-electric text-navy font-bold rounded-xl text-sm hover:bg-electric/90 transition-colors"
                >
                  I Agree & Sign
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showExperiencePopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy border border-white/10 rounded-2xl p-6 max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setShowExperiencePopup(false)} className="absolute top-4 right-4 text-silver hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-2xl font-display font-black mb-4 flex items-center gap-2 uppercase">
                <Compass className="text-electric" /> Experience Level
              </h3>
              <div className="space-y-4 text-silver/90 text-sm mb-6">
                <p>Have you ever surfed, foiled, or used an eFoil before? Select the option that best describes your experience.</p>
                
                <div className="space-y-3 mt-4">
                  {[
                    { id: 'never', label: 'Never - Complete Beginner' },
                    { id: 'surfed', label: 'I have surfed or wakeboarded' },
                    { id: 'foiled', label: 'I have foiled (kite/wing/surf)' },
                    { id: 'efoiled', label: 'I have used an eFoil before' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setExperienceLevel(option.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center justify-between ${
                        experienceLevel === option.id 
                          ? 'bg-electric/20 border-electric text-white' 
                          : 'bg-white/5 border-white/10 text-silver hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {experienceLevel === option.id && <CheckCircle className="text-electric" size={18} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExperiencePopup(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (experienceLevel) {
                      updateReservation('experience', experienceLevel);
                    }
                    setShowExperiencePopup(false);
                  }}
                  disabled={!experienceLevel}
                  className={`flex-1 py-3 font-bold rounded-xl text-sm transition-colors ${
                    experienceLevel
                      ? 'bg-electric text-navy hover:bg-electric/90'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                >
                  Save Experience
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
