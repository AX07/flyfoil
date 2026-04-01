import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) {
      setIsDarkMode(saved === 'dark');
    } else {
      setIsDarkMode(!document.documentElement.classList.contains('light-mode'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
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

      <div className="relative z-10 flex flex-col items-center text-center">
        <img 
          src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
          alt="FlyFoil Formosa" 
          className="w-32 h-auto mb-8" 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-navy/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl"
        >
          <Compass className="w-16 h-16 text-electric mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-display font-black mb-4 uppercase tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase">
            Off Course
          </h2>
          <p className="text-silver/90 text-lg mb-8 max-w-md mx-auto">
            Looks like you've drifted into uncharted waters. This page doesn't exist or the link is invalid.
          </p>
          <Link 
            to="/" 
            className="inline-block px-8 py-4 bg-electric text-navy font-bold rounded-xl text-lg hover:bg-white transition-all duration-300 uppercase tracking-widest"
          >
            Return to Base
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
