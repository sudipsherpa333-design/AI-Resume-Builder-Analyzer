// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import and check backend health
import { aiService } from './services/aiService';

// Check backend connection on startup
async function initializeApp() {
  console.log('🚀 Starting AI Resume Builder...');
  console.log('🔧 Environment:', import.meta.env.MODE);
  console.log('🌐 API URL:', import.meta.env.VITE_API_URL);

  try {
    const health = await aiService.checkBackendHealth();
    console.log('✅ Backend status:', health.status);

    if (health.status === 'connected') {
      console.log('🎉 Backend connected successfully!');
    } else {
      console.warn('⚠️ Backend not available, using fallback mode');
    }
  } catch (error) {
    console.error('❌ Failed to check backend:', error);
  }

  // Render the app
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

initializeApp();