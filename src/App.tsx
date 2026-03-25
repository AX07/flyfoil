import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'motion/react';
import Landing from './Landing';
import LoadingScreen from './LoadingScreen';

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
      const videos = Array.from(document.querySelectorAll('video'));
      const iframes = Array.from(document.querySelectorAll('iframe'));
      
      let loadedCount = 0;
      const totalMedia = videos.length + iframes.length;
      
      if (totalMedia === 0) {
        if (isMounted) {
          setIsLoading(false);
          document.body.style.overflow = 'unset';
        }
        return;
      }
      
      const handleMediaLoad = () => {
        loadedCount++;
        if (loadedCount >= totalMedia && isMounted) {
          setIsLoading(false);
          document.body.style.overflow = 'unset';
        }
      };
      
      videos.forEach(video => {
        if (video.readyState >= 3) {
          handleMediaLoad();
        } else {
          video.addEventListener('loadeddata', handleMediaLoad);
          video.addEventListener('error', handleMediaLoad);
        }
      });
      
      iframes.forEach(iframe => {
        // Iframes might already be loaded, but it's hard to check cross-origin readyState reliably.
        // We'll attach the event listener and rely on the fallback timer if it misses.
        iframe.addEventListener('load', handleMediaLoad);
        iframe.addEventListener('error', handleMediaLoad);
      });
    };
    
    // Wait a tick for the DOM to update with new elements
    const timer = setTimeout(checkMediaLoaded, 100);
    
    // Fallback timeout in case media takes too long or events are missed
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        document.body.style.overflow = 'unset';
      }
    }, 5000);
    
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
