import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PublicTrackingPage from './components/PublicTrackingPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const path = window.location.pathname;

// Simple router to show the public tracking page or the admin dashboard
if (path.toLowerCase() === '/track') {
  root.render(<PublicTrackingPage />);
} else {
  root.render(<App />);
}
