import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .animate-fadeIn { animation: fadeIn .2s ease-out }
  `;
  document.head.appendChild(style);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
