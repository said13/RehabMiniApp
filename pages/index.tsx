import React, { useEffect } from 'react';
import Head from 'next/head';
import App from '../src/App';

export default function Home() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      .animate-fadeIn { animation: fadeIn .2s ease-out }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css"
        />
      </Head>
      <App />
    </>
  );
}
