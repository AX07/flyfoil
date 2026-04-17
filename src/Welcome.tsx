import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Shirt, HeartPulse, FileSignature, 
  CheckCircle, ChevronRight, Check,
  Sun, Moon, X, Compass, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    map.flyTo(center, 11, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Welcome() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });

  const [wetsuitSize, setWetsuitSize] = useState("None");
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

  const locations = [
    { id: "beliche", name: "Beliche Lake", desc: "Freshwater perfection / Smooth, glassy conditions surrounded by nature. Perfect for beginners.", highlight: true, videoId: "0jDCjP4FvCA", coords: [[37.275, -7.535] as [number, number]] },
    { id: "fuseta", name: "Fuseta", desc: "Golden sands & open horizon for long glides.", highlight: false, videoId: "iX9567Pd0Us", coords: [[37.050, -7.745] as [number, number]] },
    { id: "cabanas", name: "Cabanas de Tavira", desc: "Home Base / Crystal Calm waters.", highlight: false, videoId: "_f3zSvTuUl4", coords: [[37.133, -7.590] as [number, number]] },
    { id: "altura", name: "Altura", desc: "Wide open bays perfect for cruising and carving.", highlight: false, videoId: "iX9567Pd0Us", coords: [[37.173, -7.495] as [number, number]] },
    { id: "cross-border", name: "The Cross-Border Special", desc: "Vila Real to Isla Cristina (Spain). A unique international flight.", highlight: false, videoId: "jJYbSImw_HE", coords: [[37.195, -7.415] as [number, number], [37.200, -7.320] as [number, number]] }
  ];

  const [activeLocation, setActiveLocation] = useState(locations[2]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleCheck = (key: keyof typeof safetyChecks) => {
    setSafetyChecks({ ...safetyChecks, [key]: !safetyChecks[key] });
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy pb-24 transition-colors duration-300 relative">
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
            <div className="text-sm font-medium text-silver/80 hidden sm:block">Welcome</div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-16 relative z-10">
        
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-5xl font-display font-black mb-4 tracking-tighter uppercase leading-none">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-blue-400">FlyFoil Formosa</span>
            </h1>
            <p className="text-silver/90 text-lg font-light">Prepare for your flight by completing the steps below.</p>
          </motion.div>
        </section>

        <section>
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> Locations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {locations.map((loc, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveLocation(loc)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${activeLocation.id === loc.id ? 'bg-white text-navy border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-transparent border-white/20 text-white hover:border-white/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <MapPin size={18} className={activeLocation.id === loc.id ? 'text-navy' : 'text-white'} />
                      {loc.name}
                    </h3>
                  </div>
                  <p className={`text-sm ${activeLocation.id === loc.id ? 'text-navy/80' : 'text-silver/70'}`}>{loc.desc}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col lg:block h-[400px] lg:h-auto rounded-3xl overflow-hidden relative border border-white/10 bg-navy-light z-0"
            >
              <div className="relative h-full lg:absolute lg:inset-0">
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
                          click: () => setActiveLocation(loc),
                        }}
                      />
                    ))
                  ))}
                </MapContainer>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 z-30">
                <a 
                  href={
                    activeLocation.name === 'Cabanas de Tavira' ? 'https://maps.app.goo.gl/TvbPDjfErXy9HZCs5' :
                    activeLocation.name === 'Fuseta' ? 'https://maps.app.goo.gl/tCEZ3PV1yBfs6pv16' :
                    activeLocation.name === 'Altura' ? 'https://maps.app.goo.gl/8k9dtbJvcXWXBqws5' :
                    activeLocation.name === 'Beliche Lake' ? 'https://maps.app.goo.gl/i2eAvh75ym1L32iz5' :
                    activeLocation.name === 'The Cross-Border Special' ? 'https://maps.app.goo.gl/MiZiByj5YjBxp16U8' :
                    'https://maps.google.com/?q=' + encodeURIComponent(activeLocation.name)
                  }
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full py-3 bg-white text-navy font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-xl"
                >
                  OPEN IN MAPS <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-px bg-electric"></span> Gear & Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Shirt className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Wetsuit Match</h3>
                <p className="text-sm text-silver/80 mb-3">Select your size</p>
              </div>
              <div className="relative">
                <select 
                  value={wetsuitSize}
                  onChange={(e) => setWetsuitSize(e.target.value)}
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

            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
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

            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <FileSignature className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Waiver Status</h3>
                <p className="text-sm text-silver/80 mb-4">Digital liability form</p>
              </div>
              <button 
                onClick={() => setShowWaiverPopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  waiverStatus === 'signed' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {waiverStatus === 'signed' ? <><Check size={18} /> SIGNED</> : 'Review & Sign'}
              </button>
            </div>

            <div className="dashboard-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Compass className="text-silver mb-4" size={28} />
                <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">Experience Level</h3>
                <p className="text-sm text-silver/80 mb-4">Help us tailor your session</p>
              </div>
              <button 
                onClick={() => setShowExperiencePopup(true)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
                  experienceLevel 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {experienceLevel ? <><Check size={18} /> LOGGED</> : 'Set Experience'}
              </button>
            </div>
          </div>
        </section>

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
                loading="lazy"
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
                    I understand that I have to stay clear of swimmers or any obstacle in a 100m distance.
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
                  className="flex-1 py-3 dashboard-card text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setHealthStatus('fit');
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
              <div className="dashboard-card rounded-xl p-4 h-64 overflow-y-auto text-silver/80 text-sm mb-6 space-y-4">
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
                  className="flex-1 py-3 dashboard-card text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setWaiverStatus('signed');
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
                  Cancel
                </button>
                <button 
                  onClick={() => {
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
