import { db } from '@/lib/firebase';
import { ref, increment, set, update, get, onValue, push } from 'firebase/database';

interface PageView {
  path: string;
  timestamp: string;
  userId?: string;
}

interface FeatureUsage {
  feature: string;
  timestamp: string;
  userId?: string;
}

interface SessionData {
  startTime: string;
  endTime?: string;
  duration?: number;
  userId?: string;
}

export const analytics = {
  // Track page views
  trackPageView: async (path: string, userId?: string) => {
    try {
      const pageViewsRef = ref(db, 'analytics/pageViews');
      const metricsRef = ref(db, 'analytics/metrics');
      
      // Add page view record using push
      const newPageViewRef = push(pageViewsRef);
      await set(newPageViewRef, {
        path,
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous'
      });

      // Increment total page views
      await update(metricsRef, {
        totalPageViews: increment(1)
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  },

  // Track feature usage
  trackFeatureUsage: async (feature: string, userId?: string) => {
    try {
      const featureRef = ref(db, 'analytics/featureUsage');
      const newFeatureUsage: FeatureUsage = {
        feature,
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous'
      };

      // Increment feature usage count
      await update(ref(db, 'analytics/metrics'), {
        [`featureUsage/${feature}`]: increment(1)
      });

      // Store detailed feature usage data using push
      const newFeatureRef = push(featureRef);
      await set(newFeatureRef, newFeatureUsage);
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  },

  // Track user session
  startSession: async (userId?: string) => {
    try {
      const sessionsRef = ref(db, 'analytics/sessions');
      const metricsRef = ref(db, 'analytics/metrics');
      
      // Add session record using push
      const newSessionRef = push(sessionsRef);
      const sessionData = {
        startTime: new Date().toISOString(),
        userId: userId || 'anonymous'
      };
      
      await set(newSessionRef, sessionData);

      // Increment total sessions
      await update(metricsRef, {
        totalSessions: increment(1)
      });

      return newSessionRef.key;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  },

  endSession: async (sessionId: string, userId?: string) => {
    try {
      const sessionsRef = ref(db, `analytics/sessions/${sessionId}`);
      const metricsRef = ref(db, 'analytics/metrics');
      
      const startTime = new Date().getTime();
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000 / 60; // Convert to minutes

      // Update session with end time and duration
      await update(sessionsRef, {
        endTime: new Date().toISOString(),
        duration
      });

      // Update total duration and average session duration
      const snapshot = await get(metricsRef);
      const currentData = snapshot.val() || {};
      
      const newTotalDuration = (currentData.totalDuration || 0) + duration;
      const newTotalSessions = (currentData.totalSessions || 0) + 1;
      const newAverageDuration = newTotalDuration / newTotalSessions;

      await update(metricsRef, {
        totalDuration: newTotalDuration,
        averageSessionDuration: newAverageDuration
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  },

  // Track user interactions
  trackInteraction: async (type: string, details: any, userId?: string) => {
    try {
      const interactionRef = ref(db, 'analytics/interactions');
      const newInteractionRef = push(interactionRef);
      
      await set(newInteractionRef, {
        type,
        details,
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous'
      });

      // Increment interaction count
      await update(ref(db, 'analytics/metrics'), {
        [`interactions/${type}`]: increment(1)
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }
}; 