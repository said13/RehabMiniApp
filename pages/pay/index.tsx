import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";

// Мини-хелпер: сумма в копейках из query ?amount=10000 (по умолчанию 100 р)
function useAmount() {
  const [amount, setAmount] = useState<number>(10000);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const q = url.searchParams.get("amount");
    if (q) setAmount(Number(q));
  }, []);
  return amount;
}

export default function PayPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const terminalKey = process.env.NEXT_PUBLIC_TBANK_TERMINAL_KEY!;
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN!;
  const amount = useAmount();

  // Формируем чек (54-ФЗ). Минимум один Item с обязательным Amount = Price * Quantity
  const receiptValue = useMemo(
    () =>
      JSON.stringify({
        Email: "buyer@example.com",        // или Phone: "+79990000000"
        Taxation: "usn_income",            // подставьте вашу систему налогообложения
        Items: [
          {
            Name: "Подписка/услуга",
            Price: amount,                 // копейки за единицу
            Quantity: 1,
            Amount: amount,                // ОБЯЗАТЕЛЬНО
            Tax: "none",                   // NDS: none|vat0|vat10|vat20|vat110|vat120
            PaymentMethod: "full_prepayment",
            PaymentObject: "service",
          },
        ],
      }),
    [amount]
  );

  const orderId = useMemo(() => `ORDER-${Date.now()}`, []);

  // Фолбек, если скрипт ещё не загрузился
  const pay = () => {
    // @ts-ignore
    if (window.Tinkoff?.Pay) {
      // @ts-ignore
      window.Tinkoff.Pay(formRef.current);
    } else {
      alert("Платёжный виджет ещё не загрузился. Попробуйте снова через секунду.");
    }
  };

  return (
    <>
      <Head>
        {/* Виджет v2 по доке Т-Банка */}
        <script src="https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js" />
      </Head>

      <main style={{ maxWidth: 420, margin: "48px auto", fontFamily: "system-ui" }}>
        <h2 style={{ marginBottom: 12 }}>Оплата через Т-Банк (виджет)</h2>
        <p style={{ opacity: 0.75, marginTop: 0 }}>
          Сумма: <b>{(amount / 100).toFixed(2)}</b> ₽
        </p>

        <form
          ref={formRef}
          name="TinkoffPayForm"
          onSubmit={(e) => {
            e.preventDefault();
            pay();
          }}
        >
          {/* ОБЯЗАТЕЛЬНО */}
          <input type="hidden" name="terminalkey" value={terminalKey} />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="order" value={orderId} />

          {/* Чек (54-ФЗ) */}
          <input type="hidden" name="receipt" value={receiptValue} />

          {/* URL-ы результата (можно свои страницы) */}
          <input type="hidden" name="successurl" value={`${origin}/pay/success`} />
          <input type="hidden" name="failurl" value={`${origin}/pay/fail`} />

          <button
            type="submit"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "black",
              color: "white",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Оплатить {(amount / 100).toFixed(2)} ₽
          </button>
        </form>

        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
          Для теста используйте терминал <code>TinkoffBankTest</code>. В проде подставьте свой Terminal Key
          из кабинета. Secret Key во фронт <b>не вставляем</b>.
        </p>
      </main>
    </>
  );
}

