import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAYBhczJ209zNq_vyJhlDJ2KfX32Bbq53k",
  authDomain: "caluu-8e832.firebaseapp.com",
  databaseURL: "https://caluu-8e832-default-rtdb.firebaseio.com",
  projectId: "caluu-8e832",
  storageBucket: "caluu-8e832.firebasestorage.app",
  messagingSenderId: "12277271075",
  appId: "1:12277271075:web:e947a31fd0d039f533ff96",
  measurementId: "G-H4HZN3DWWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database with specific configuration
const db = getDatabase(app, firebaseConfig.databaseURL);

// Initialize analytics metrics if they don't exist
const initializeMetrics = async () => {
  try {
    const metricsRef = ref(db, 'analytics/metrics');
    const snapshot = await get(metricsRef);
    
    if (!snapshot.exists()) {
      await set(metricsRef, {
        totalSessions: 0,
        totalPageViews: 0,
        totalDuration: 0,
        averageSessionDuration: 0,
        featureUsage: {},
        interactions: {}
      });
    }
  } catch (error) {
    console.error('Error initializing metrics:', error);
  }
};

// Initialize metrics when the app starts
initializeMetrics();

export { db };
export const analytics = getAnalytics(app); 