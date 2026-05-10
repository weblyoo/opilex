import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Admin Panel: App starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Admin Panel: Root element not found!');
} else {
  console.log('Admin Panel: Root element found, rendering...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
