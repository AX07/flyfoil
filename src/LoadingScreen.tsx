import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function LoadingScreen() {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-navy flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/80' : 'bg-black/20'} z-10`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b from-navy ${isDarkMode ? 'via-navy/60' : 'via-navy/10'} to-navy z-10`}></div>
        <img 
          src="/assets/pool-water-bg.png" 
          alt="Pool water background"
          className="w-full h-full object-cover blur-sm"
          referrerPolicy="no-referrer"
        />
      </div>
      <motion.img 
        src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
        alt="FlyFoil Formosa" 
        className="w-48 md:w-64 h-auto relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      />
    </motion.div>
  );
}
