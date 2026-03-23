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
      className="fixed inset-0 z-[100] bg-navy flex items-center justify-center"
    >
      <motion.img 
        src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
        alt="FlyFoil Formosa" 
        className="w-48 md:w-64 h-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      />
    </motion.div>
  );
}
