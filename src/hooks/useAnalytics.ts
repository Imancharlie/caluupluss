import { useEffect, useState } from 'react';
import { getMetrics, incrementPageViews, incrementSessions, updateSessionDuration, AnalyticsMetrics } from '../services/analytics';

export function useAnalytics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalSessions: 0,
    totalPageViews: 0,
    totalDuration: 0,
    averageSessionDuration: 0
  });

  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const currentMetrics = await getMetrics();
        setMetrics(currentMetrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    loadMetrics();
    incrementSessions().catch(console.error);
    incrementPageViews().catch(console.error);

    return () => {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000; // Convert to seconds
      updateSessionDuration(sessionDuration).catch(console.error);
    };
  }, []);

  const trackPageView = async () => {
    try {
      await incrementPageViews();
      const updatedMetrics = await getMetrics();
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  return {
    metrics,
    trackPageView
  };
} 