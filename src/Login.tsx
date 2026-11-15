import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function Login() {
  const { language, t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
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

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="py-6 px-6 border-b border-white/10 bg-navy/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src={isDarkMode ? "/assets/logo-light.png" : "/assets/logo-dark.png"} 
              alt="FlyFoil Formosa" 
              className="h-12 w-auto object-contain" 
            />
          </Link>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-silver/80 hidden sm:block">{t('login.title')}</div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/40 to-navy z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric/10 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-black mb-3 tracking-tight uppercase">{t('login.title')}</h1>
            <p className="text-silver/80 text-sm">{t('login.subtitle')}</p>
          </div>

          <div className="space-y-4">
            <a
              href={`https://wa.me/351961850859?text=${encodeURIComponent(
                language === 'pt'
                  ? 'Olá! Podem reenviar o link da minha Área de Cliente? A reserva está em nome de: '
                  : 'Hi! Could you resend my Flight Deck link? My booking is under the name: '
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium w-full text-sm flex items-center justify-center gap-2"
            >
              {t('login.askLink')} <ArrowRight size={18} />
            </a>

            <a
              href="/#booking"
              className="w-full py-4 rounded-xl border border-white/10 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              {t('login.book')}
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
