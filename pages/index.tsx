import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import App from '../src/App';

export default function Home() {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </Head>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js" strategy="afterInteractive" />
      <App />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-fadeIn { animation: fadeIn .2s ease-out; }
      `}</style>
    </>
  );
}
