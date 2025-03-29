import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Initialize analytics only in production and if window is available
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}
export { analytics };

// Initialize analytics metrics if they don't exist
async function initializeMetrics() {
  try {
    const metricsRef = ref(db, 'analytics');
    const snapshot = await get(metricsRef);
    
    if (!snapshot.exists()) {
      await set(metricsRef, {
        totalSessions: 0,
        totalPageViews: 0,
        totalDuration: 0,
        averageSessionDuration: 0
      });
    }
  } catch (error) {
    console.error('Error initializing metrics:', error);
  }
}

// Initialize metrics only in production
if (import.meta.env.PROD) {
  initializeMetrics();
}

export default app; 