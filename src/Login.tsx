import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, CheckCircle, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue) return;
    
    setIsSubmitted(true);
    
    // Simulate sending magic link and redirecting after a short delay
    setTimeout(() => {
      navigate('/dashboard/magic-link-123');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="py-6 px-6 border-b border-white/10 bg-navy/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
              <path d="M8 22 L 40 20 Q 42 24 24 24 L 8 24 Z" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinejoin="round"/>
              <line x1="18" y1="24" x2="18" y2="34" stroke="#D4AF37" strokeWidth="2.5"/>
              <path d="M12 34 L 28 34 Q 26 36 18 36 L 12 36 Z" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col items-start leading-[0.9]">
              <span className="text-[12px] font-bold tracking-widest text-white">FLY</span>
              <span className="text-[12px] font-bold tracking-widest text-white">FOIL</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-silver/80 hidden sm:block">Flight Deck Access</div>
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
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <CheckCircle className="text-emerald-400" size={40} />
              </div>
              <h2 className="text-2xl font-display font-black mb-3 uppercase">Magic Link Sent!</h2>
              <p className="text-silver/80 mb-6">
                Check your {method === 'email' ? 'inbox' : 'messages'} for the secure link to access your Flight Deck.
              </p>
              <div className="text-xs text-silver/50 uppercase tracking-widest">
                Redirecting to your dashboard...
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-display font-black mb-3 tracking-tight uppercase">Access Flight Deck</h1>
                <p className="text-silver/80 text-sm">Enter your booking email or phone number to receive a secure, passwordless magic link.</p>
              </div>

              <div className="flex p-1 bg-white/5 rounded-xl mb-8 border border-white/10">
                <button 
                  onClick={() => { setMethod('email'); setInputValue(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'email' ? 'bg-white text-navy shadow-sm' : 'text-silver hover:text-white'}`}
                >
                  Email
                </button>
                <button 
                  onClick={() => { setMethod('phone'); setInputValue(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'phone' ? 'bg-white text-navy shadow-sm' : 'text-silver hover:text-white'}`}
                >
                  Phone Number
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-silver font-medium">
                    {method === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    {method === 'email' ? (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    ) : (
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
                    )}
                    <input 
                      type={method === 'email' ? 'email' : 'tel'} 
                      placeholder={method === 'email' ? 'john@example.com' : '+1 234 567 890'} 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors" 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-electric text-navy font-bold rounded-xl text-sm hover:bg-electric/90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  SEND MAGIC LINK <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
