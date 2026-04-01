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
    
    const checkMediaLoaded = () => {
      // Only wait for the hero video (the first one) to speed up loading
      const heroVideo = document.querySelector('video');
      
      if (!heroVideo) {
        if (isMounted) {
          setIsLoading(false);
          document.body.style.overflow = 'unset';
        }
        return;
      }
      
      const handleMediaLoad = () => {
        if (isMounted) {
          setIsLoading(false);
          document.body.style.overflow = 'unset';
        }
      };
      
      if (heroVideo.readyState >= 3) {
        handleMediaLoad();
      } else {
        heroVideo.addEventListener('loadeddata', handleMediaLoad);
        heroVideo.addEventListener('error', handleMediaLoad);
      }
    };
    
    // Wait a tick for the DOM to update with new elements
    const timer = setTimeout(checkMediaLoaded, 100);
    
    // Fast fallback timeout (2 seconds max)
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        document.body.style.overflow = 'unset';
      }
    }, 2000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
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
