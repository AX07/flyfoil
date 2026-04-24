import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Menu, X, ShieldCheck, GraduationCap, Video, 
  MapPin, Calendar, CreditCard, Bitcoin, Check, 
  MessageCircle, ChevronRight, ChevronLeft, Star, Play, Waves, Compass,
  Gift, UserCheck, LifeBuoy, Sun, Moon, User, Mail, Phone, Clock, Info,
  Instagram, Youtube, FileSignature, Globe
} from 'lucide-react';
import { collection, addDoc, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { useLanguage } from './LanguageContext';

const createCustomIcon = (isActive: boolean) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isActive ? 'bg-electric scale-150 shadow-[0_0_15px_rgba(0,240,255,0.8)]' : 'bg-white/80 hover:bg-white'}">
           ${isActive ? '<div class="absolute inset-0 rounded-full bg-electric animate-ping opacity-75"></div>' : ''}
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    // Offset the center slightly to the north on desktop so the marker isn't hidden by the bottom card
    const targetCenter = isDesktop ? [center[0] + 0.02, center[1]] as [number, number] : center;
    map.flyTo(targetCenter, 11, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Landing() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const locations = [
    { id: "beliche", name: t('loc.beliche.name'), desc: t('loc.beliche.desc'), highlight: true, videoId: "0jDCjP4FvCA", coords: [[37.275, -7.535] as [number, number]] },
    { id: "fuseta", name: t('loc.fuseta.name'), desc: t('loc.fuseta.desc'), highlight: false, videoId: "iX9567Pd0Us", coords: [[37.050, -7.745] as [number, number]] },
    { id: "cabanas", name: t('loc.cabanas.name'), desc: t('loc.cabanas.desc'), highlight: false, videoId: "_f3zSvTuUl4", coords: [[37.133, -7.590] as [number, number]] },
    { id: "altura", name: t('loc.altura.name'), desc: t('loc.altura.desc'), highlight: false, videoId: "iX9567Pd0Us", coords: [[37.173, -7.495] as [number, number]] },
    { id: "cross-border", name: t('loc.cross.name'), desc: t('loc.cross.desc'), highlight: false, videoId: "jJYbSImw_HE", coords: [[37.195, -7.415] as [number, number], [37.200, -7.320] as [number, number]] }
  ];

  const videos = ["mN7_Nz5d0oM", "AxWRIK85GgM", "b4yCyD4L2kE"];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [activeLocationId, setActiveLocationId] = useState(locations[2].id); // Default to Cabanas
  const activeLocation = locations.find(l => l.id === activeLocationId) || locations[2];
  const [selectedExperience, setSelectedExperience] = useState(() => t('pricing.starter.title') + " - €180");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState({ morning: true, evening: true });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [selectedSessionTime, setSelectedSessionTime] = useState('');
  const [showWaiverPopup, setShowWaiverPopup] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots({ morning: true, evening: true });
      return;
    }
    const checkAvailability = async () => {
      setIsCheckingAvailability(true);
      try {
        const morningRef = doc(db, 'schedule', `${selectedDate}_morning`);
        const eveningRef = doc(db, 'schedule', `${selectedDate}_evening`);
        const [morningSnap, eveningSnap] = await Promise.all([getDoc(morningRef), getDoc(eveningRef)]);
        
        setAvailableSlots({
          morning: !morningSnap.exists(),
          evening: !eveningSnap.exists()
        });
        
        // Reset selected session if it's no longer available
        if (selectedSessionTime === 'morning' && morningSnap.exists()) setSelectedSessionTime('');
        if (selectedSessionTime === 'evening' && eveningSnap.exists()) setSelectedSessionTime('');
      } catch (error) {
        console.error("Error checking availability:", error);
      }
      setIsCheckingAvailability(false);
    };
    checkAvailability();
  }, [selectedDate]);

  const reviews = [
    { name: "Sarah Jenkins", role: "First-time Flyer", text: "Absolutely incredible experience! The instructors were so patient, and I was flying above the water within 20 minutes. Highly recommend to anyone visiting the Algarve.", rating: 5 },
    { name: "Marcus Thorne", role: "Water Sports Enthusiast", text: "I've surfed and wakeboarded for years, but eFoiling is a totally different sensation. The equipment is top-notch and the locations are breathtaking. Will be back!", rating: 5 },
    { name: "Elena Rodriguez", role: "Holiday Maker", text: "Booked this as a surprise for my husband's birthday. We both loved it! The cross-border special to Spain was the highlight of our trip. Unforgettable.", rating: 5 }
  ];

  const faqs = [
    {
      question: t('faq1.q'),
      answer: t('faq1.a')
    },
    {
      question: t('faq2.q'),
      answer: t('faq2.a')
    },
    {
      question: t('faq3.q'),
      answer: t('faq3.a')
    },
    {
      question: t('faq4.q'),
      answer: t('faq4.a')
    },
    {
      question: t('faq5.q'),
      answer: t('faq5.a')
    }
  ];

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [videos.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
              alt="FlyFoil Formosa" 
              className="w-20 h-20 md:w-24 md:h-24 object-contain" 
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                className="flex items-center gap-1.5 p-2 rounded-full hover:bg-white/10 transition-colors text-white font-medium text-sm"
              >
                <Globe size={18} />
                <span className="uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-32 right-0 bg-navy/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden py-2 drop-shadow-2xl z-50"
                  >
                    <button 
                      onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${language === 'en' ? 'text-electric font-bold' : 'text-white hover:bg-white/10'}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => { setLanguage('pt'); setIsLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${language === 'pt' ? 'text-electric font-bold' : 'text-white hover:bg-white/10'}`}
                    >
                      Português
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => scrollTo('experience')} className="text-sm font-medium hover:text-electric transition-colors">{t('nav.experience')}</button>
            <button onClick={() => scrollTo('locations')} className="text-sm font-medium hover:text-electric transition-colors">{t('nav.locations')}</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm font-medium hover:text-electric transition-colors">{t('nav.pricing')}</button>
            <button onClick={() => navigate(language === 'pt' ? '/pt/login' : '/login')} className="text-sm font-medium text-electric hover:text-white transition-colors">{t('nav.flightdeck')}</button>
            <button onClick={() => scrollTo('booking')} className="px-6 py-2.5 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-navy transition-all duration-300">
              {t('nav.booknow')}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')} 
              className="px-2 py-1 border border-white/20 rounded font-medium text-xs text-white uppercase"
            >
              {language}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-navy/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden"
        >
          <button onClick={() => scrollTo('experience')} className="text-2xl font-medium text-left border-b border-white/10 pb-4">{t('nav.experience')}</button>
          <button onClick={() => scrollTo('locations')} className="text-2xl font-medium text-left border-b border-white/10 pb-4">{t('nav.locations')}</button>
          <button onClick={() => scrollTo('pricing')} className="text-2xl font-medium text-left border-b border-white/10 pb-4">{t('nav.pricing')}</button>
          <button onClick={() => navigate(language === 'pt' ? '/pt/login' : '/login')} className="text-2xl font-medium text-left border-b border-white/10 pb-4 text-electric">{t('nav.flightdeck')}</button>
          <button onClick={() => scrollTo('booking')} className="mt-4 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full text-xl text-center hover:bg-white hover:text-navy transition-all duration-300">
            {t('nav.booknow')}
          </button>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 z-10 ${isDarkMode ? 'bg-black/40' : 'bg-black/60 sm:bg-black/40'}`}></div>
          <div className={`absolute inset-0 z-10 bg-gradient-to-b ${isDarkMode ? 'from-navy/60 via-navy/20' : 'from-navy/80 via-navy/40'} to-transparent`}></div>
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/assets/hero-video.webm" type="video/webm" />
            <source src="https://sevenpalmsmarbella.com/wp-content/uploads/2023/02/efoil_seven_palms_home_intro.mov" />
          </video>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-32 pb-20 md:pt-24 md:pb-24 flex flex-col items-center text-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter mb-4 md:mb-6 text-white leading-none drop-shadow-2xl"
          >
            {t('hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-silver to-white">{t('hero.title2')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-silver/90 max-w-2xl mb-8 md:mb-12 font-light px-4 drop-shadow-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-4xl grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 mb-8 md:mb-10"
            id="pricing"
          >
            {[
              { 
                id: "starter-flight", 
                title: t('pricing.starter.title'), 
                price: "€180", 
                desc: t('pricing.starter.desc'),
                icon: <GraduationCap size={56} strokeWidth={1} className="mb-4 text-white group-hover:text-electric transition-colors duration-300" />
              },
              { 
                id: "half-experience", 
                title: t('pricing.half.title'), 
                price: "€160", 
                desc: t('pricing.half.desc'), 
                popular: true,
                icon: <Waves size={56} strokeWidth={1} className="mb-4 text-white group-hover:text-electric transition-colors duration-300" />
              },
              { 
                id: "full-experience", 
                title: t('pricing.full.title'), 
                price: "€150", 
                desc: t('pricing.full.desc'),
                icon: <Compass size={56} strokeWidth={1} className="mb-4 text-white group-hover:text-electric transition-colors duration-300" />
              }
            ].map((plan, i) => (
              <div 
                key={i} 
                onClick={() => scrollTo(plan.id)}
                className="cursor-pointer relative p-2 sm:p-4 md:p-6 flex flex-col items-center text-center transition-transform hover:scale-105 group drop-shadow-lg"
              >
                {plan.popular && <div className="absolute -top-4 md:-top-2 left-1/2 -translate-x-1/2 text-electric text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 tracking-widest uppercase drop-shadow-md">{t('pricing.popular')}</div>}
                <div className="transform group-hover:-translate-y-2 transition-transform duration-300 scale-75 sm:scale-100 drop-shadow-xl">
                  {plan.icon}
                </div>
                <h3 className="text-silver font-medium text-[10px] sm:text-sm mb-0.5 md:mb-1 uppercase tracking-wider drop-shadow-md">{plan.title}</h3>
                <div className="text-xl sm:text-3xl font-bold text-white mb-0.5 md:mb-1 drop-shadow-lg">{plan.price}</div>
                <p className="text-[8px] sm:text-xs text-silver/60 uppercase tracking-widest drop-shadow-md">{plan.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            onClick={() => scrollTo('booking')}
            className="px-6 py-3 md:px-8 md:py-4 bg-white text-navy font-bold rounded-xl text-sm md:text-lg hover:bg-silver transition-all duration-300 flex items-center gap-2 group"
          >
            {t('common.secureSession')} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* The Experience Breakdown */}
      <section id="experience" className="relative py-24 flex items-center justify-center overflow-hidden min-h-[100svh]">
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/20'} z-10`}></div>
          <div className={`absolute inset-0 bg-gradient-to-b from-navy ${isDarkMode ? 'via-navy/40' : 'via-navy/10'} to-navy z-10`}></div>
          <img 
            src="/assets/pool-water-bg.png" 
            alt="Pool water background"
            className="w-full h-full object-cover blur-sm"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tighter uppercase text-white leading-none">
              {t('exp.title1')} <span className="text-electric">{t('exp.title2')}</span>
            </h2>
            <p className="text-silver/90 max-w-2xl mx-auto font-light text-lg md:text-xl">{t('exp.subtitle')}</p>
          </motion.div>

          {/* Features - Mobile Carousel with Buttons */}
          <div className="block md:hidden relative -mx-6 px-6 mb-24">
            <div className="relative overflow-hidden rounded-2xl bg-navy border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentFeatureIndex * 100}%)` }}
              >
                {[
                  {
                    icon: <MapPin size={40} strokeWidth={1.5} className="text-white mb-6" />,
                    title: t('exp.grid1.title'),
                    desc: t('exp.grid1.desc')
                  },
                  {
                    icon: <Gift size={40} strokeWidth={1.5} className="text-white mb-6" />,
                    title: t('exp.grid2.title'),
                    desc: <>{t('exp.grid2.desc1')}<strong className="text-white font-medium">{t('exp.grid2.desc2')}</strong></>
                  },
                  {
                    icon: <UserCheck size={40} strokeWidth={1.5} className="text-white mb-6" />,
                    title: t('exp.grid3.title'),
                    desc: t('exp.grid3.desc')
                  },
                  {
                    icon: <LifeBuoy size={40} strokeWidth={1.5} className="text-white mb-6" />,
                    title: t('exp.grid4.title'),
                    desc: <>{t('exp.grid4.desc1')}<strong className="text-white font-medium">{t('exp.grid4.desc2')}</strong> {t('exp.grid4.desc3')}</>
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="w-full shrink-0 p-8 flex flex-col items-center text-center">
                    {feature.icon}
                    <h3 className="text-sm font-display font-bold text-white mb-3 tracking-wider uppercase">{feature.title}</h3>
                    <p className="text-silver/80 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              {/* Navigation Buttons */}
              <button 
                onClick={() => setCurrentFeatureIndex(prev => Math.max(0, prev - 1))}
                className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity ${currentFeatureIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-black/60'}`}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => setCurrentFeatureIndex(prev => Math.min(3, prev + 1))}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity ${currentFeatureIndex === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-black/60'}`}
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentFeatureIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${currentFeatureIndex === idx ? 'bg-electric w-4' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Features - Desktop Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
            {[
              {
                icon: <MapPin size={40} strokeWidth={1.5} className="text-white group-hover:text-electric transition-colors duration-300 mb-6" />,
                title: t('exp.grid1.title'),
                desc: t('exp.grid1.desc')
              },
              {
                icon: <Gift size={40} strokeWidth={1.5} className="text-white group-hover:text-electric transition-colors duration-300 mb-6" />,
                title: t('exp.grid2.title'),
                desc: <>{t('exp.grid2.desc1')}<strong className="text-white font-medium">{t('exp.grid2.desc2')}</strong></>
              },
              {
                icon: <UserCheck size={40} strokeWidth={1.5} className="text-white group-hover:text-electric transition-colors duration-300 mb-6" />,
                title: t('exp.grid3.title'),
                desc: t('exp.grid3.desc')
              },
              {
                icon: <LifeBuoy size={40} strokeWidth={1.5} className="text-white group-hover:text-electric transition-colors duration-300 mb-6" />,
                title: t('exp.grid4.title'),
                desc: <>{t('exp.grid4.desc1')}<strong className="text-white font-medium">{t('exp.grid4.desc2')}</strong> {t('exp.grid4.desc3')}</>
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group p-8 rounded-2xl flex flex-col items-center text-center backdrop-blur-md bg-navy-light border border-white/5`}
              >
                {feature.icon}
                <h3 className="text-sm font-display font-bold text-white mb-3 tracking-wider uppercase">{feature.title}</h3>
                <p className="text-silver/80 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-16">
            {[
              { id: "starter-flight", icon: <GraduationCap size={40} strokeWidth={1} />, title: t('pricing.starter.title'), desc: t('pricing.starter.longDesc'), duration: t('pricing.starter.desc'), price: "€180", videoId: "5rR4XPne7MU", comingSoon: false },
              { id: "half-experience", icon: <Waves size={40} strokeWidth={1} />, title: t('pricing.half.title'), desc: t('pricing.half.longDesc'), duration: t('pricing.half.desc'), price: "€160", videoId: "cuvJeTT4ksI", comingSoon: false },
              { id: "full-experience", icon: <Compass size={40} strokeWidth={1} />, title: t('pricing.full.title'), desc: t('pricing.full.longDesc'), duration: "1h", price: "€150", videoId: "dTxpgd_Gu6w", comingSoon: false }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                id={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.2 }}
                className={`flex flex-col gap-8 group scroll-mt-24 bg-navy-light border border-white/5 p-6 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden ${feature.comingSoon ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${feature.videoId}?autoplay=1&mute=1&loop=1&playlist=${feature.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`} 
                    title={feature.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full object-cover pointer-events-none scale-150"
                  ></iframe>
                  <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-700 pointer-events-none"></div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-white opacity-80 group-hover:opacity-100 group-hover:text-electric transition-all duration-500">
                        {feature.icon}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-display font-black tracking-tighter uppercase">{feature.title}</h3>
                    </div>
                    <p className="text-silver/80 leading-relaxed text-lg font-light max-w-2xl">{feature.desc}</p>
                  </div>
                  <div className="flex flex-col gap-6 w-full md:w-auto shrink-0">
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
                      <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase border border-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-silver text-center">{feature.duration}</span>
                      <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase border border-[#D4AF37]/30 text-[#D4AF37] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-center">{feature.price}</span>
                    </div>
                    {feature.comingSoon ? (
                      <button disabled className="px-8 py-4 bg-white/5 border border-white/10 text-white/50 text-sm font-bold tracking-widest uppercase rounded-xl cursor-not-allowed text-center">
                        {t('common.comingSoon')}
                      </button>
                    ) : (
                      <button onClick={() => {
                        setSelectedExperience(`${feature.title} (${feature.duration}) - ${feature.price}`);
                        scrollTo('locations');
                      }} className="px-8 py-4 bg-navy border border-white/10 text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-white hover:text-navy transition-all duration-300 text-center">
                        {t('common.bookThisFlight')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="py-24 bg-navy-light relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:flex justify-between items-end"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 uppercase leading-none">{t('loc.title')}</h2>
              <p className="text-silver max-w-xl">{t('loc.subtitle')}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {locations.map((loc, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveLocationId(loc.id)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${activeLocation.id === loc.id ? 'bg-white text-navy border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-transparent border-white/20 text-white hover:border-white/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <MapPin size={18} className={activeLocation.id === loc.id ? 'text-navy' : 'text-white'} />
                      {loc.name}
                    </h3>
                    {loc.highlight && <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${activeLocation.id === loc.id ? 'bg-navy/10 text-navy border-navy/20' : 'bg-white/10 text-white border-white/30'}`}>Beginner</span>}
                  </div>
                  <p className={`text-sm ${activeLocation.id === loc.id ? 'text-navy/80' : 'text-silver/70'}`}>{loc.desc}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col lg:block h-auto lg:h-[600px] rounded-3xl overflow-hidden relative border border-white/10 bg-navy-light z-0"
            >
              {/* Interactive Map */}
              <div className="relative h-[400px] lg:absolute lg:inset-0">
                <MapContainer 
                  center={activeLocation.coords[0]} 
                  zoom={11} 
                  scrollWheelZoom={false}
                  className="w-full h-full z-0"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                  <MapUpdater center={activeLocation.coords[0]} />
                  
                  {locations.map((loc) => (
                    loc.coords.map((coord, index) => (
                      <Marker 
                        key={`${loc.id}-${index}`} 
                        position={coord}
                        icon={createCustomIcon(activeLocation.id === loc.id)}
                        eventHandlers={{
                          click: () => setActiveLocationId(loc.id),
                        }}
                      />
                    ))
                  ))}
                </MapContainer>
              </div>

              <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent pointer-events-none z-10"></div>
              
              <div className="relative lg:absolute lg:bottom-6 lg:left-6 lg:right-6 z-30 p-4 lg:p-0 bg-navy lg:bg-transparent">
                <div className="bg-navy/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4 shadow-2xl">
                  <div className="w-full sm:w-32 h-48 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${activeLocation.videoId}?autoplay=1&mute=1&loop=1&playlist=${activeLocation.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`} 
                      title={activeLocation.name}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none scale-150"
                    ></iframe>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-lg text-white">{activeLocation.name}</h4>
                    <p className="text-sm text-silver/80 mt-1">{activeLocation.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 flex justify-center relative z-10">
            <button 
              onClick={() => scrollTo('booking')} 
              className="px-8 py-4 bg-white text-navy text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-silver transition-all duration-300 text-center"
            >
              {t('common.secureSession')}
            </button>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-24 bg-navy overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-black mb-4 uppercase leading-none">{t('social.title')}</h2>
          <p className="text-silver mb-6">{t('social.subtitle')}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-white font-bold tracking-widest uppercase text-sm">{t('social.follow')}</span>
            <a href="https://www.instagram.com/flyfoilformosa/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-electric hover:text-navy hover:border-electric transition-all">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@flyfoilformosa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-electric hover:text-navy hover:border-electric transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
            </a>
            <a href="https://www.youtube.com/@FlyFoilFormosa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-electric hover:text-navy hover:border-electric transition-all">
              <Youtube size={20} />
            </a>
            <a href="https://g.page/r/CXoNgFSNAwbVEBM/review" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-electric hover:text-navy hover:border-electric transition-all" title="Review us on Google">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
          {videos.map((videoId, i) => {
            let position = "translate-x-full opacity-0 scale-75";
            let zIndex = 0;
            let isCenter = false;

            if (i === currentVideoIndex) {
              position = "translate-x-0 opacity-100 scale-100 blur-none";
              zIndex = 20;
              isCenter = true;
            } else if (i === (currentVideoIndex - 1 + videos.length) % videos.length) {
              position = "-translate-x-[60%] md:-translate-x-[80%] opacity-50 scale-90 blur-sm";
              zIndex = 10;
            } else if (i === (currentVideoIndex + 1) % videos.length) {
              position = "translate-x-[60%] md:translate-x-[80%] opacity-50 scale-90 blur-sm";
              zIndex = 10;
            }

            return (
              <div 
                key={videoId}
                className={`absolute transition-all duration-700 ease-in-out w-[250px] md:w-[320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${position}`}
                style={{ zIndex }}
                onClick={() => {
                  if (!isCenter) setCurrentVideoIndex(i);
                }}
              >
                {isCenter ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full object-cover pointer-events-none scale-105"
                  ></iframe>
                ) : (
                  <div className="w-full h-full relative cursor-pointer group">
                    <img 
                      src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} 
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-navy/40 mix-blend-overlay group-hover:bg-navy/20 transition-colors"></div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center gap-3">
            {videos.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentVideoIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentVideoIndex ? 'bg-electric w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                aria-label={`Go to video ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Social Proof Cards */}
        <div className="relative w-full max-w-6xl mx-auto h-[400px] flex items-center justify-center overflow-hidden mt-24">
          {reviews.map((review, i) => {
            let position = "translate-x-full opacity-0 scale-75";
            let zIndex = 0;
            let isCenter = false;

            if (i === currentReviewIndex) {
              position = "translate-x-0 opacity-100 scale-100 blur-none";
              zIndex = 20;
              isCenter = true;
            } else if (i === (currentReviewIndex - 1 + reviews.length) % reviews.length) {
              position = "-translate-x-[80%] md:-translate-x-[60%] opacity-50 scale-90 blur-sm";
              zIndex = 10;
            } else if (i === (currentReviewIndex + 1) % reviews.length) {
              position = "translate-x-[80%] md:translate-x-[60%] opacity-50 scale-90 blur-sm";
              zIndex = 10;
            }

            return (
              <div 
                key={i}
                className={`absolute transition-all duration-700 ease-in-out w-[85%] md:w-[400px] bg-navy-light/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl ${position}`}
                style={{ zIndex }}
                onClick={() => {
                  if (!isCenter) setCurrentReviewIndex(i);
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={18} className="text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-silver/90 italic mb-6 leading-relaxed font-display text-lg">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-electric/20 flex items-center justify-center text-electric font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{review.name}</h4>
                    <p className="text-silver/60 text-sm">{review.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Review Carousel Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-3">
            {reviews.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentReviewIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentReviewIndex ? 'bg-electric w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-navy-light relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4 uppercase leading-none">{t('faq.title')}</h2>
            <p className="text-silver">{t('faq.subtitle')}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-navy border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-white pr-8">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 bg-electric text-navy' : 'text-silver'}`}>
                    <ChevronRight size={18} className={openFaqIndex === index ? 'rotate-90' : ''} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-silver/80 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Hub */}
      <section id="booking" className="relative py-24 flex items-center justify-center overflow-hidden min-h-[100svh]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/40 to-navy z-10"></div>
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/assets/hero-video.webm" type="video/webm" />
            <source src="https://sevenpalmsmarbella.com/wp-content/uploads/2023/02/efoil_seven_palms_home_intro.mov" />
          </video>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-navy/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-electric via-blue-500 to-electric"></div>
            
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tighter uppercase text-white leading-none">
                {t('booking.title1')} <span className="text-electric">{t('booking.title2')}</span>
              </h2>
              <p className="text-silver/90 text-lg font-light mb-8">{t('common.contactUs')}</p>
              
              <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-6 mb-10 p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <a href="tel:+351961850859" className="flex items-center gap-3 text-white hover:text-electric transition-colors w-full md:w-auto justify-center">
                  <div className="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center shrink-0 text-electric">
                    <Phone size={20} />
                  </div>
                  <span className="font-medium text-sm md:text-base whitespace-nowrap">+351 961 850 859</span>
                </a>
                <a href="mailto:Flyfoilformosa@gmail.com" className="flex items-center gap-3 text-white hover:text-electric transition-colors w-full md:w-auto justify-center">
                  <div className="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center shrink-0 text-electric">
                    <Mail size={20} />
                  </div>
                  <span className="font-medium text-xs sm:text-sm md:text-base truncate">Flyfoilformosa@gmail.com</span>
                </a>
                <a href="https://wa.me/351961850859" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#25D366] transition-colors w-full md:w-auto justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0 text-[#25D366]">
                    <MessageCircle size={20} />
                  </div>
                  <span className="font-medium text-sm md:text-base whitespace-nowrap">WhatsApp</span>
                </a>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-silver/50 text-sm font-medium uppercase tracking-widest">{t('common.bookOnline')}</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const date = formData.get('date') as string;
              const sessionTime = formData.get('sessionTime') as string;
              
              const agreeToTerms = formData.get('agreeToTerms');
              if (!agreeToTerms) {
                alert("Please agree to the Digital Waiver & Liability Form to continue.");
                return;
              }

              if (!date || !sessionTime) {
                alert("Please select a date and session time.");
                return;
              }

              const bookingData = {
                fullName: formData.get('fullName') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                date: date,
                sessionTime: sessionTime,
                location: formData.get('location') as string,
                experience: formData.get('experience') as string,
                wetsuitSize: 'None',
                healthStatus: 'pending',
                waiverStatus: 'pending',
                flightSchool: false,
                createdAt: new Date()
              };
              try {
                const scheduleRef = doc(db, 'schedule', `${date}_${sessionTime}`);
                const scheduleSnap = await getDoc(scheduleRef);
                
                if (scheduleSnap.exists()) {
                  alert("Sorry, this time slot was just booked. Please select another time.");
                  // Re-trigger availability check
                  setSelectedDate(date + ' '); // force re-render hack or just set state
                  setTimeout(() => setSelectedDate(date), 10);
                  return;
                }

                const batch = writeBatch(db);
                const reservationRef = doc(collection(db, 'reservations'));
                
                batch.set(reservationRef, bookingData);
                batch.set(scheduleRef, {
                  status: 'booked',
                  reservationId: reservationRef.id,
                  date: date,
                  sessionTime: sessionTime,
                  createdAt: new Date()
                });

                await batch.commit();
                
                const profileLink = `${window.location.origin}/dashboard/${reservationRef.id}`;
                const email = bookingData.email;
                const phone = bookingData.phone;
                const fullName = bookingData.fullName;
                
                // Call backend API to send email
                try {
                  await fetch('/api/send-booking-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email,
                      phone,
                      reservationId: reservationRef.id,
                      fullName,
                      date: bookingData.date,
                      sessionTime: bookingData.sessionTime,
                      experience: bookingData.experience,
                      location: bookingData.location
                    })
                  });
                } catch (apiError) {
                  console.error("Failed to trigger confirmation messages:", apiError);
                  // We don't block the user if messages fail, they still booked successfully
                }
                
                localStorage.setItem('auth_reservation', reservationRef.id);
                window.scrollTo(0, 0);
                navigate(language === 'pt' ? `/pt/dashboard/${reservationRef.id}` : `/dashboard/${reservationRef.id}`);
              } catch (error) {
                console.error("Error adding reservation: ", error);
                alert("There was an error processing your reservation: " + (error instanceof Error ? error.message : String(error)));
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">{t('booking.name')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    <input type="text" name="fullName" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">{t('booking.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    <input type="email" name="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">{t('booking.phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    <input type="tel" name="phone" placeholder="+1 234 567 890" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">{t('booking.date')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    <input 
                      type="date" 
                      name="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors appearance-none" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">
                    {t('booking.time')} {isCheckingAvailability && <span className="text-electric text-xs ml-2 animate-pulse">{t('booking.checking')}</span>}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    <select 
                      name="sessionTime" 
                      value={selectedSessionTime}
                      onChange={(e) => setSelectedSessionTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors appearance-none disabled:opacity-50" 
                      required
                      disabled={!selectedDate || isCheckingAvailability}
                    >
                      <option value="" disabled className="bg-navy text-white">{t('booking.selectSession')}</option>
                      <option value="morning" disabled={!availableSlots.morning} className="bg-navy text-white">
                        {t('booking.morning')} {!availableSlots.morning ? t('booking.bookedOut') : ''}
                      </option>
                      <option value="evening" disabled={!availableSlots.evening} className="bg-navy text-white">
                        {t('booking.evening')} {!availableSlots.evening ? t('booking.bookedOut') : ''}
                      </option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">{t('booking.location')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    <select 
                      name="location"
                      value={activeLocation.id}
                      onChange={(e) => setActiveLocationId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors appearance-none"
                    >
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id} className="bg-navy text-white">{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-silver font-medium">{t('booking.type')}</label>
                  <select 
                    name="experience"
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-electric transition-colors appearance-none"
                  >
                    <option className="bg-navy text-white" value={t('pricing.starter.title') + " - €180"}>{t('pricing.starter.title')} - €180</option>
                    <option className="bg-navy text-white" value={t('pricing.half.title') + " - €160"}>{t('pricing.half.title')} - €160</option>
                    <option className="bg-navy text-white" value={t('pricing.full.title') + " - €150"}>{t('pricing.full.title')} - €150</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="bg-electric/10 border border-electric/20 rounded-xl p-4 flex items-start gap-3">
                  <Info className="text-electric shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-silver/90 space-y-1">
                    <p><strong className="text-white">{t('booking.paymentInfo')}</strong>{t('booking.paymentInfo2')}</p>
                    <p>{t('booking.weatherInfo')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-1">
                    <input type="checkbox" name="agreeToTerms" className="peer sr-only" />
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-electric peer-checked:border-electric transition-colors flex items-center justify-center">
                      <Check size={14} className="text-navy opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-sm text-silver/80 leading-relaxed">
                    {t('booking.waiver1')}<button type="button" onClick={(e) => { e.preventDefault(); setShowWaiverPopup(true); }} className="text-electric hover:underline">{t('booking.waiverLink')}</button>{t('booking.waiver2')}
                  </span>
                </label>
              </div>

              <button type="submit" className="w-full py-4 bg-electric text-navy font-bold rounded-xl text-lg hover:bg-white transition-all duration-300">
                {t('common.confirmBooking')}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-col items-start mb-6">
                <img 
                  src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
                  alt="FlyFoil Formosa" 
                  className="w-32 h-auto object-contain mb-6" 
                  loading="lazy"
                />
                <p className="text-silver/70 max-w-sm">
                  {t('footer.desc')}
                </p>
              </div>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/flyfoilformosa/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center hover:bg-electric hover:text-navy cursor-pointer transition-colors border border-white/10">
                  <Instagram size={20} />
                </a>
                <a href="https://www.tiktok.com/@flyfoilformosa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center hover:bg-electric hover:text-navy cursor-pointer transition-colors border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@FlyFoilFormosa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center hover:bg-electric hover:text-navy cursor-pointer transition-colors border border-white/10">
                  <Youtube size={20} />
                </a>
                <a href="https://g.page/r/CXoNgFSNAwbVEBM/review" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center hover:bg-electric hover:text-navy cursor-pointer transition-colors border border-white/10" title="Review us on Google">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">{t('footer.quickLinks')}</h4>
              <ul className="space-y-3 text-silver/70">
                <li><button onClick={() => scrollTo('experience')} className="hover:text-electric transition-colors">{t('nav.experience')}</button></li>
                <li><button onClick={() => scrollTo('locations')} className="hover:text-electric transition-colors">{t('nav.locations')}</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="hover:text-electric transition-colors">{t('nav.pricing')}</button></li>
                <li><a href="#" className="hover:text-electric transition-colors">{t('footer.faq')}</a></li>
                <li><Link to="/admin" className="hover:text-electric transition-colors">{t('footer.admin')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">{t('footer.contact')}</h4>
              <ul className="space-y-3 text-silver/70">
                <li><a href="https://maps.app.goo.gl/4NbKJiMcHniXSbwc7" target="_blank" rel="noopener noreferrer" className="hover:text-electric transition-colors">{t('footer.hq')}</a></li>
                <li>{t('footer.location')}</li>
                <li><a href="mailto:Flyfoilformosa@gmail.com" className="hover:text-electric transition-colors flex items-center gap-2"><Mail size={16} /> Flyfoilformosa@gmail.com</a></li>
                <li><a href="tel:+351961850859" className="hover:text-electric transition-colors flex items-center gap-2"><Phone size={16} /> +351 961 850 859</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-silver/50">
            <div className="flex flex-col items-center md:items-start gap-4">
              <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
              <div className="flex items-center gap-6">
                <img src="https://imgs.search.brave.com/8n-Fsh85cV8aawKfHyVf2rhcLGMSSihqf-rmdraypDI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2E2LzJk/LzY5L2E2MmQ2OTE1/M2U1NGY5NWFlNjE0/ODY3MjNjOTgyYTJh/LmpwZw" alt="Turismo de Portugal" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                <img src="https://www.alturakites.com/assets/images/untitled-1-160x116.png" alt="Altura Kites" className={`h-12 w-auto object-contain transition-all ${isDarkMode ? 'opacity-70 hover:opacity-100 brightness-0 invert' : 'opacity-70 hover:opacity-100'}`} />
              </div>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/351961850859" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-[#ffffff] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 z-50 px-6 py-3 flex justify-between items-center pb-safe">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-white hover:text-electric transition-colors">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
            <path d="M8 22 L 40 20 Q 42 24 24 24 L 8 24 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1="18" y1="24" x2="18" y2="34" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M12 34 L 28 34 Q 26 36 18 36 L 12 36 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('nav.home')}</span>
        </button>
        <button onClick={() => scrollTo('locations')} className="flex flex-col items-center gap-1 text-silver hover:text-electric transition-colors">
          <MapPin size={24} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('nav.map')}</span>
        </button>
        <button onClick={() => scrollTo('booking')} className="flex flex-col items-center gap-1 text-silver hover:text-electric transition-colors">
          <Calendar size={24} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('common.book')}</span>
        </button>
        <button onClick={() => navigate(language === 'pt' ? '/pt/login' : '/login')} className="flex flex-col items-center gap-1 text-silver hover:text-electric transition-colors">
          <User size={24} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('nav.profile')}</span>
        </button>
      </div>

      <AnimatePresence>
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
                <p>{t('waiver.p7')}</p>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowWaiverPopup(false)}
                  className="px-8 py-3 bg-electric text-navy font-bold rounded-xl text-sm hover:bg-electric/90 transition-colors"
                >
                  {t('waiver.close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
