import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/services/analytics';

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionRef = useRef<any>(null);

  // Track page views and manage sessions
  useEffect(() => {
    const startAnalytics = async () => {
      try {
        // Track page view
        await analytics.trackPageView(location.pathname, user?.id?.toString());
        
        // Start new session if none exists
        if (!sessionRef.current) {
          sessionRef.current = await analytics.startSession(user?.id?.toString());
        }
      } catch (error) {
        console.error('Error starting analytics:', error);
      }
    };

    startAnalytics();

    // End session when component unmounts
    return () => {
      if (sessionRef.current) {
        analytics.endSession(sessionRef.current, user?.id?.toString());
        sessionRef.current = null;
      }
    };
  }, [location.pathname, user?.id]);

  return {
    trackFeature: (feature: string) => 
      analytics.trackFeatureUsage(feature, user?.id?.toString()),
    
    trackInteraction: (type: string, details: any) =>
      analytics.trackInteraction(type, details, user?.id?.toString())
  };
}; 