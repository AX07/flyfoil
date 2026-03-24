import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Calendar, Clock, MapPin, 
  CheckCircle, XCircle, Shirt, Search,
  Filter, ChevronDown, Activity, FileSignature, BookOpen, LogIn, CalendarX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [reservations, setReservations] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockSession, setBlockSession] = useState('morning');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      setAccessDenied(false); // Reset on auth change
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubscribeRes = onSnapshot(q, (snapshot) => {
      const resData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReservations(resData);
      setAccessDenied(false);
    }, (error: any) => {
      console.error("Error fetching reservations: ", error);
      if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
        setAccessDenied(true);
      }
    });

    const qSchedule = query(collection(db, 'schedule'));
    const unsubscribeSchedule = onSnapshot(qSchedule, (snapshot) => {
      const schedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedule(schedData);
    });

    return () => {
      unsubscribeRes();
      unsubscribeSchedule();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleBlockSlot = async (e: any) => {
    e.preventDefault();
    if (!blockDate || !blockSession) return;
    
    try {
      const slotId = `${blockDate}_${blockSession}`;
      await setDoc(doc(db, 'schedule', slotId), {
        status: 'blocked',
        date: blockDate,
        sessionTime: blockSession,
        createdAt: new Date()
      });
      setBlockDate('');
      alert(`Successfully blocked ${blockSession} on ${blockDate}`);
    } catch (error) {
      console.error("Error blocking slot:", error);
      alert("Failed to block slot. Check permissions.");
    }
  };

  const handleUnblockSlot = async (slotId: string) => {
    if (!window.confirm("Are you sure you want to unblock this slot?")) return;
    try {
      await deleteDoc(doc(db, 'schedule', slotId));
    } catch (error) {
      console.error("Error unblocking slot:", error);
      alert("Failed to unblock slot.");
    }
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-white p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <img src="/assets/logo-light.png" alt="FlyFoil Formosa" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-display font-bold mb-2 uppercase">Admin Access</h1>
          <p className="text-silver/80 mb-8 text-sm">Please sign in with your administrator account to access the Flight Deck.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-electric text-navy font-bold rounded-xl text-sm hover:bg-electric/90 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-white p-6">
        <div className="bg-white/5 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-display font-bold mb-2 uppercase text-red-400">Access Denied</h1>
          <p className="text-silver/80 mb-8 text-sm">You do not have administrator privileges to view this page. Please sign in with an authorized account.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors"
            >
              Sign Out
            </button>
            <Link to="/" className="w-full py-3 bg-transparent border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/5 transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterDate === 'all') return matchesSearch;
    return matchesSearch && res.date === filterDate;
  });

  const StatusBadge = ({ status, type }: { status: string | boolean, type: 'health' | 'waiver' | 'school' }) => {
    const isComplete = status === 'fit' || status === 'signed' || status === true;
    
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isComplete 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
          : 'bg-white/5 text-silver/60 border-white/10'
      }`}>
        {isComplete ? <CheckCircle size={12} /> : <XCircle size={12} />}
        <span className="uppercase tracking-wider">
          {type === 'health' && (status === 'fit' ? 'Fit' : 'Pending')}
          {type === 'waiver' && (status === 'signed' ? 'Signed' : 'Pending')}
          {type === 'school' && (status === true ? 'Done' : 'Pending')}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric selection:text-navy font-sans pb-20">
      {/* Header */}
      <header className="bg-navy-light border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src="/assets/logo-light.png" alt="FlyFoil Formosa" className="h-8 w-auto" />
            </Link>
            <div className="h-6 w-px bg-white/20 mx-2"></div>
            <h1 className="text-xl font-display font-bold tracking-widest uppercase text-silver">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-silver">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Live System
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-silver hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Schedule Management */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 text-silver mb-6">
            <CalendarX size={20} className="text-red-400" />
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white">Schedule Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-silver mb-4 uppercase tracking-wider">Block a Time Slot</h3>
              <form onSubmit={handleBlockSlot} className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="date" 
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-electric transition-colors appearance-none flex-1"
                  required
                />
                <select 
                  value={blockSession}
                  onChange={(e) => setBlockSession(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-electric transition-colors appearance-none flex-1"
                  required
                >
                  <option value="morning" className="bg-navy text-white">Morning</option>
                  <option value="evening" className="bg-navy text-white">Evening</option>
                </select>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/50 font-bold rounded-xl text-sm hover:bg-red-500/30 transition-colors whitespace-nowrap"
                >
                  Block Slot
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-silver mb-4 uppercase tracking-wider">Currently Blocked Slots</h3>
              <div className="bg-navy-light/50 border border-white/5 rounded-xl p-4 max-h-40 overflow-y-auto">
                {schedule.filter(s => s.status === 'blocked').length === 0 ? (
                  <p className="text-silver/50 text-sm italic">No slots currently blocked.</p>
                ) : (
                  <div className="space-y-2">
                    {schedule.filter(s => s.status === 'blocked').sort((a, b) => a.date.localeCompare(b.date)).map(slot => (
                      <div key={slot.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-white font-medium">{slot.date}</span>
                          <span className="text-silver capitalize">{slot.sessionTime}</span>
                        </div>
                        <button 
                          onClick={() => handleUnblockSlot(slot.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider font-bold"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-silver mb-2">
              <Users size={20} className="text-electric" />
              <span className="text-sm font-medium uppercase tracking-wider">Total Bookings</span>
            </div>
            <div className="text-4xl font-display font-bold">{reservations.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-silver mb-2">
              <CheckCircle size={20} className="text-emerald-400" />
              <span className="text-sm font-medium uppercase tracking-wider">Cleared to Fly</span>
            </div>
            <div className="text-4xl font-display font-bold">
              {reservations.filter(r => r.healthStatus === 'fit' && r.waiverStatus === 'signed' && r.flightSchool).length}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-silver mb-2">
              <Calendar size={20} className="text-blue-400" />
              <span className="text-sm font-medium uppercase tracking-wider">Upcoming Today</span>
            </div>
            <div className="text-4xl font-display font-bold">
              {reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-silver mb-2">
              <Shirt size={20} className="text-purple-400" />
              <span className="text-sm font-medium uppercase tracking-wider">Wetsuits Needed</span>
            </div>
            <div className="text-4xl font-display font-bold">
              {reservations.filter(r => r.wetsuitSize !== 'None').length}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-electric transition-colors"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" size={18} />
              <select 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:border-electric transition-colors appearance-none"
              >
                <option value="all">All Dates</option>
                <option value="2026-04-15">Apr 15, 2026</option>
                <option value="2026-04-16">Apr 16, 2026</option>
                <option value="2026-04-18">Apr 18, 2026</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-silver/50 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 text-xs font-medium text-silver uppercase tracking-wider">Passenger</th>
                  <th className="p-4 text-xs font-medium text-silver uppercase tracking-wider">Session Details</th>
                  <th className="p-4 text-xs font-medium text-silver uppercase tracking-wider">Experience & Gear</th>
                  <th className="p-4 text-xs font-medium text-silver uppercase tracking-wider">Clearance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReservations.map((res) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={res.id} 
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{res.fullName}</span>
                        <span className="text-sm text-silver/80">{res.email}</span>
                        <span className="text-sm text-silver/80">{res.phone}</span>
                        <span className="text-xs text-electric mt-1 font-mono">{res.id}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Calendar size={14} className="text-silver" />
                          {res.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Clock size={14} className="text-silver" />
                          <span className="capitalize">{res.sessionTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <MapPin size={14} className="text-silver" />
                          {res.location}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium text-white">{res.experience}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shirt size={14} className={res.wetsuitSize === 'None' ? 'text-silver/50' : 'text-electric'} />
                          <span className={res.wetsuitSize === 'None' ? 'text-silver/50' : 'text-white'}>
                            {res.wetsuitSize === 'None' ? 'No Wetsuit' : `Size: ${res.wetsuitSize}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-silver flex items-center gap-1.5"><Activity size={12}/> Health</span>
                          <StatusBadge status={res.healthStatus} type="health" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-silver flex items-center gap-1.5"><FileSignature size={12}/> Waiver</span>
                          <StatusBadge status={res.waiverStatus} type="waiver" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-silver flex items-center gap-1.5"><BookOpen size={12}/> School</span>
                          <StatusBadge status={res.flightSchool} type="school" />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-silver font-bold text-xl">
                      None
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-silver">
                      No reservations found matching your criteria.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
