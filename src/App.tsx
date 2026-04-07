import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'motion/react';
import Landing from './Landing';
import LoadingScreen from './LoadingScreen';
import NotFound from './NotFound';

// Lazy load secondary routes for better initial load performance
const Dashboard = lazy(() => import('./Dashboard'));
const Login = lazy(() => import('./Login'));
const Admin = lazy(() => import('./Admin'));

function AppContent() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    document.body.style.overflow = 'hidden';
    
    let isMounted = true;
    
    // Always show loading screen for exactly 1 second
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        document.body.style.overflow = 'unset';
      }
    }, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>
      
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
