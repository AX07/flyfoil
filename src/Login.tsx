import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Sun, Moon, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useLanguage } from './LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue) return;
    
    setError(null);
    
    try {
      const q = query(
        collection(db, 'reservations'),
        where(method === 'email' ? 'email' : 'phone', '==', inputValue)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError(`${t('login.error')}${method === 'email' ? t('login.email').toLowerCase() : t('login.phone').toLowerCase()}.`);
        return;
      }
      
      // Use the first matching reservation
      const reservationId = querySnapshot.docs[0].id;
      
      // Log the user in directly
      localStorage.setItem('auth_reservation', reservationId);
      navigate(`/dashboard/${reservationId}`);
      
    } catch (err) {
      console.error("Error querying reservations:", err);
      setError(t('login.error2'));
    }
  };

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

          <div className="flex p-1 bg-white/5 rounded-xl mb-8 border border-white/10">
                <button 
                  onClick={() => { setMethod('email'); setInputValue(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'email' ? 'bg-white text-navy shadow-sm' : 'text-silver hover:text-white'}`}
                >
                  {t('login.email')}
                </button>
                <button 
                  onClick={() => { setMethod('phone'); setInputValue(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'phone' ? 'bg-white text-navy shadow-sm' : 'text-silver hover:text-white'}`}
                >
                  {t('login.phone')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">
                    {method === 'email' ? t('login.emailLabel') : t('login.phoneLabel')}
                  </label>
                  <div className="relative">
                    {method === 'email' ? (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    ) : (
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    )}
                    <input 
                      type={method === 'email' ? 'email' : 'tel'} 
                      placeholder={method === 'email' ? t('login.placeholderEmail') : t('login.placeholderPhone')} 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    type="submit" 
                    className="btn-premium w-full text-sm flex items-center justify-center gap-2"
                  >
                    {t('login.submit')} <ArrowRight size={18} />
                  </button>
                  
                  <a 
                    href="/#booking"
                    className="w-full py-4 rounded-xl border border-white/10 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/5 transition-colors flex items-center justify-center"
                  >
                    {t('login.book')}
                  </a>
                </div>
              </form>
        </motion.div>
      </main>
    </div>
  );
}
