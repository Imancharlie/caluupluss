import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle browser extension errors globally
window.addEventListener('error', (event) => {
  if (event.message?.includes('disconnected port object') || 
      event.message?.includes('proxy.js') ||
      event.filename?.includes('proxy.js')) {
    console.warn('Browser extension connection lost - this is normal during development');
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
