import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Wind, Thermometer, MapPin, 
  Shirt, HeartPulse, FileSignature, 
  CheckCircle, Video, DownloadCloud, ChevronRight, Check,
  Sun, Moon, Waves, X, Compass, Globe
} from 'lucide-react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import NotFound from './NotFound';
import { useLanguage } from './LanguageContext';

export default function Dashboard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!id) return;
    
    // Check for magic link token in URL
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token === `magic_${id}`) {
      // Valid magic link, save to local storage
      localStorage.setItem('auth_reservation', id);
      // Clean up URL
      navigate(`/dashboard/${id}`, { replace: true });
      return;
    }
    
    // Check local storage auth
    const authId = localStorage.getItem('auth_reservation');
    if (authId !== id) {
      // Not authenticated for this dashboard
      navigate('/login');
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'reservations', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBookingData(data);
        setWetsuitSize(data.wetsuitSize || 'None');
        setHealthStatus(data.healthStatus || 'pending');
        setWaiverStatus(data.waiverStatus || 'pending');
        setExperienceLevel(data.riderExperience || null);
        setSafetyChecks({
          signals: data.flightSchool || false,
          falling: data.flightSchool || false,
          equipment: data.flightSchool || false
        });
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reservation:", error);
      setNotFound(true);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [id, location.search, navigate]);

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
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  const [waiverStatus, setWaiverStatus] = useState<string | null>(null);
  const [showWaiverPopup, setShowWaiverPopup] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [showExperiencePopup, setShowExperiencePopup] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState({
    signals: false,
    falling: false,
    equipment: false,
  });
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric/30 border-t-electric rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-display font-black uppercase tracking-wider">{t('dashboard.loading')}</h2>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy pb-24 transition-colors duration-300 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/80' : 'bg-black/20'} z-10`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b from-navy ${isDarkMode ? 'via-navy/60' : 'via-navy/10'} to-navy z-10`}></div>
        <img 
          src="/assets/pool-water-bg.png" 
          alt="Pool water background"
          className="w-full h-full object-cover blur-sm"
          referrerPolicy="no-referrer"
          loading="lazy"
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
            <div className="text-sm font-medium text-silver/80 hidden sm:block">{t('dashboard.title')}</div>
            <button 
              onClick={() => {
                localStorage.removeItem('auth_reservation');
                navigate('/login');
              }}
              className="text-sm font-medium text-silver hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5"
            >
              {t('dashboard.signOut')}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white flex items-center justify-center" 
                aria-label="Change language"
              >
                <Globe size={20} />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-navy/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col py-2 z-[60]">
                  <button 
                    onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                    className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${language === 'en' ? 'text-electric font-bold' : 'text-white'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => { setLanguage('pt'); setIsLangMenuOpen(false); }}
                    className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${language === 'pt' ? 'text-electric font-bold' : 'text-white'}`}
                  >
                    Português
                  </button>
                </div>
              )}
            </div>
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
              {t('dashboard.thanks')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-blue-400">{bookingData?.fullName?.split(' ')[0] || 'Alex'}</span>
            </h1>
            
            <div className="mt-8 dashboard-card rounded-2xl p-8 max-w-md mx-auto backdrop-blur-md">
              <p className="text-silver/90 text-lg font-light uppercase tracking-widest mb-2">{t('dashboard.statusLine')}</p>
              <div className="text-5xl md:text-7xl font-mono font-bold text-white tracking-tight mb-2">
                {timeLeft}
              </div>
              <div className="text-sm text-silver/60 uppercase tracking-widest mt-2 border-t border-white/10 pt-4">
                {bookingData?.date || ''} {bookingData?.sessionTime ? `(${bookingData.sessionTime === 'morning' ? t('booking.morning') : bookingData.sessionTime === 'evening' ? t('booking.evening') : bookingData.sessionTime})` : ''}
              </div>
            </div>
          </motion.div>

          {/* Location details */}
          <div className="max-w-xl mx-auto">
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
                  <span className="font-medium uppercase tracking-wider text-sm">{t('dashboard.launchSpot')}</span>
                </div>
                <div className="text-lg font-bold text-white mb-4">{bookingData.location || 'Cabanas de Tavira'}</div>
                <a 
                  href={
                    bookingData.location === 'Cabanas de Tavira' ? 'https://maps.app.goo.gl/TvbPDjfErXy9HZCs5' :
                    bookingData.location === 'Fuseta' ? 'https://maps.app.goo.gl/tCEZ3PV1yBfs6pv16' :
                    bookingData.location === 'Altura' ? 'https://maps.app.goo.gl/8k9dtbJvcXWXBqws5' :
                    bookingData.location === 'Beliche (Sagres)' ? 'https://maps.app.goo.gl/i2eAvh75ym1L32iz5' :
                    bookingData.location === 'Cross-border (Vila Real -> Isla Canela)' ? 'https://maps.app.goo.gl/MiZiByj5YjBxp16U8' :
                    'https://maps.google.com/?q=' + encodeURIComponent(bookingData.location || 'Cabanas de Tavira')
                  }
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full py-3 bg-white text-navy font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {t('dashboard.openMaps')} <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Gear & Profile Management */}
        <section>
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> {t('dashboard.gearProfile')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Shirt className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">{t('check.wetsuit')}</h3>
                <p className="text-sm text-silver/80 mb-3">{t('dashboard.wetsuitReq')}</p>
              </div>
              <div className="relative">
                <select 
                  value={wetsuitSize}
                  onChange={(e) => updateReservation('wetsuitSize', e.target.value)}
                  className="w-full bg-navy border border-white/20 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-electric appearance-none cursor-pointer"
                >
                  <option value="None">{t('dashboard.noWetsuit')}</option>
                  <option value="XS">{t('dashboard.size')} XS</option>
                  <option value="S">{t('dashboard.size')} S</option>
                  <option value="M">{t('dashboard.size')} M</option>
                  <option value="L">{t('dashboard.size')} L</option>
                  <option value="XL">{t('dashboard.size')} XL</option>
                  <option value="XXL">{t('dashboard.size')} XXL</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-silver pointer-events-none rotate-90" size={16} />
              </div>
            </div>

            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <HeartPulse className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">{t('check.physical')}</h3>
                <p className="text-sm text-silver/80 mb-3">{t('check.healthReq')}</p>
              </div>
              <button 
                onClick={() => setShowHealthPopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  healthStatus === 'fit' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {healthStatus === 'fit' ? <><CheckCircle size={16} /> {t('check.greenLight')}</> : t('check.completeCheck')}
              </button>
            </div>

            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <FileSignature className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">{t('check.waiver')}</h3>
                <p className="text-sm text-silver/80 mb-4">{t('check.waiverDesc')}</p>
              </div>
              <button 
                onClick={() => setShowWaiverPopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  waiverStatus === 'signed' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {waiverStatus === 'signed' ? <><Check size={18} /> {t('check.signed')}</> : t('check.reviewSign')}
              </button>
            </div>

            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Compass className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">{t('check.experience')}</h3>
                <p className="text-sm text-silver/80 mb-4">{t('check.experienceDesc')}</p>
              </div>
              <button 
                onClick={() => setShowExperiencePopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  experienceLevel 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {experienceLevel ? <><Check size={18} /> {t('check.logged')}</> : t('check.setExperience')}
              </button>
            </div>
          </div>
        </section>

        {/* 3. The "Flight School" (Educational) */}
        <section>
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> {t('dashboard.flightSchool')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-navy-light relative aspect-video">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/FenSw41WbvQ?si=xewKNHlSgTNQ82us&controls=1&rel=0&modestbranding=1" 
                title="Safety Briefing Checklist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wider">{t('dashboard.checklistTitle')}</h3>
              <p className="text-silver/80 text-sm mb-6">{t('dashboard.checklistDesc')}</p>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" className="peer sr-only" checked={safetyChecks.signals} onChange={() => toggleCheck('signals')} />
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-electric peer-checked:border-electric transition-colors flex items-center justify-center">
                      <Check size={14} className="text-navy opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${safetyChecks.signals ? 'text-white' : 'text-silver/80'}`}>
                    {t('check.q1')}
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
                    {t('check.q2')}
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
                    {t('check.q3')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 1.5 Booking Details */}
        {bookingData && (
          <section>
            <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
              <span className="w-8 h-px bg-electric"></span> {t('dashboard.bookingDetails')}
            </h2>
            <div className="dashboard-card rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">{t('dashboard.name')}</p>
                  <p className="text-lg font-medium text-white">{bookingData.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">{t('dashboard.email')}</p>
                  <p className="text-lg font-medium text-white">{bookingData.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">{t('dashboard.phone')}</p>
                  <p className="text-lg font-medium text-white">{bookingData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">{t('dashboard.dateTime')}</p>
                  <p className="text-lg font-medium text-white">{bookingData.date || 'N/A'} <span className="capitalize">{bookingData.sessionTime ? `(${bookingData.sessionTime})` : ''}</span></p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">{t('dashboard.location')}</p>
                  <p className="text-lg font-medium text-white">{bookingData.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-silver/60 uppercase tracking-wider mb-1">{t('dashboard.experience')}</p>
                  <p className="text-lg font-medium text-white">{bookingData.experience || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. The "After-Flight" Gallery */}
        <section className="pb-12">
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> {t('dashboard.gallery')}
          </h2>
          <div className="relative rounded-2xl overflow-hidden">
            <div className="dashboard-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 blur-sm opacity-50 pointer-events-none">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <DownloadCloud className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-1 uppercase tracking-wider">{t('dashboard.mediaTitle')}</h3>
                  <p className="text-silver/80 text-sm">{t('dashboard.mediaDesc')}</p>
                </div>
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-white/10 text-white/50 border border-white/20 font-bold rounded-xl text-sm cursor-not-allowed flex items-center justify-center gap-2 shrink-0">
                {t('dashboard.availPost')}
              </button>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-navy/80 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full shadow-2xl">
                <span className="text-white font-display font-bold uppercase tracking-widest text-lg">{t('common.comingSoon')}</span>
              </div>
            </div>
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
                <HeartPulse className="text-electric" /> {t('health.title')}
              </h3>
              <div className="space-y-4 text-silver/90 text-sm mb-6">
                <p>{t('health.desc')}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t('health.q1')}</li>
                  <li>{t('health.q2')}</li>
                  <li>{t('health.q3')}</li>
                  <li>{t('health.q4')}</li>
                  <li>{t('health.q5')}</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowHealthPopup(false)}
                  className="flex-1 py-3 dashboard-card text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  {t('health.cancel')}
                </button>
                <button 
                  onClick={() => {
                    updateReservation('healthStatus', 'fit');
                    setShowHealthPopup(false);
                  }}
                  className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold rounded-xl text-sm hover:bg-emerald-500/30 transition-colors"
                >
                  {t('health.confirm')}
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
                <FileSignature className="text-electric" /> {t('waiver.title')}
              </h3>
              <div className="dashboard-card rounded-xl p-4 h-64 overflow-y-auto text-silver/80 text-sm mb-6 space-y-4">
                <p className="font-bold text-white">{t('waiver.p1')}</p>
                <p>{t('waiver.p2')}</p>
                <p>{t('waiver.p3')}</p>
                <p>{t('waiver.p4')}</p>
                <p>{t('waiver.p5')}</p>
                <p>{t('waiver.p6')}</p>
                <p>{t('waiver.p7Confirm')}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowWaiverPopup(false)}
                  className="flex-1 py-3 dashboard-card text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  {t('health.cancel')}
                </button>
                <button 
                  onClick={() => {
                    updateReservation('waiverStatus', 'signed');
                    setShowWaiverPopup(false);
                  }}
                  className="flex-1 py-3 bg-electric text-navy font-bold rounded-xl text-sm hover:bg-electric/90 transition-colors"
                >
                  {t('waiver.agreeSign')}
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
                <Compass className="text-electric" /> {t('expModal.title')}
              </h3>
              <div className="space-y-4 text-silver/90 text-sm mb-6">
                <p>{t('expModal.desc')}</p>
                
                <div className="space-y-3 mt-4">
                  {[
                    { id: 'never', label: t('expModal.opt1') },
                    { id: 'surfed', label: t('expModal.opt2') },
                    { id: 'foiled', label: t('expModal.opt3') },
                    { id: 'efoiled', label: t('expModal.opt4') }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setExperienceLevel(option.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center justify-between ${
                        experienceLevel === option.id 
                          ? 'bg-electric/20 border-electric text-white' 
                          : 'dashboard-card text-silver hover:bg-white/10 hover:text-white'
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
                  className="flex-1 py-3 dashboard-card text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  {t('health.cancel')}
                </button>
                <button 
                  onClick={() => {
                    if (experienceLevel) {
                      updateReservation('riderExperience', experienceLevel);
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
                  {t('expModal.save')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
