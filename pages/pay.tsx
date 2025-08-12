import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { TinkoffPayForm } from '../src/components/TinkoffPayForm';

const SUB_PRICE = 799;
const SUB_DESCRIPTION = 'Подписка Rehab';

export default function Pay() {
  const [name, setName] = useState('');

  useEffect(() => {
    try {
      const lp = retrieveLaunchParams();
      const u = lp?.initData?.user as any;
      if (u) {
        const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ');
        setName(fullName || u.username || '');
      }
    } catch {}
  }, []);

  const onPaid = () => {
    try { window.localStorage.setItem('subActive', '1'); } catch {}
    window.location.href = '/';
  };

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
      <div
        className="w-full min-h-[100dvh] bg-neutral-950 text-gray-100 flex flex-col items-center justify-center px-4 text-center"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <h1 className="text-xl font-semibold mb-2">Оплата подписки</h1>
        <p className="mb-1">Сумма платежа: {SUB_PRICE} ₽</p>
        <p className="mb-4">Назначение: {SUB_DESCRIPTION}</p>
        <p className="mb-6 text-sm text-gray-400 max-w-xs">
          Оставьте ваш e-mail и телефон, мы пришлём чек и уведомление об оплате.
        </p>
        <TinkoffPayForm amount={SUB_PRICE} description={SUB_DESCRIPTION} name={name} onPaid={onPaid} />
        <Link href="/" className="mt-4 text-sm text-blue-400">Назад</Link>
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
