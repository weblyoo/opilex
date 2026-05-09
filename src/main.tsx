import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Filter out benign Google API 404 errors from console
// These are expected when Firebase console checks for user settings that don't exist
const originalError = console.error;
console.error = (...args: any[]) => {
  const errorMessage = args.join(' ');
  
  // Suppress benign Google Cloud User Settings API 404 errors
  if (
    errorMessage.includes('cloudusersettings-pa.clients6.google.com') ||
    errorMessage.includes('FIREBASE_PROJECT_PROMOS_DISMISSED_UNTIL') ||
    errorMessage.includes('404 (Not Found)') && errorMessage.includes('clients6.google.com')
  ) {
    // Silently ignore these expected 404 errors
    return;
  }
  
  // Log all other errors normally
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
