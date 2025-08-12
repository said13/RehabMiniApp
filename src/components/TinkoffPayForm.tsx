import { useRef } from 'react';

interface Props {
  amount: number;
  description?: string;
  onPaid?: () => void;
  name?: string;
}

export function TinkoffPayForm({ amount, description, onPaid, name }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const descriptionEl = (form.elements.namedItem('description') as HTMLInputElement);
    const email = (form.elements.namedItem('email') as HTMLInputElement);
    const phone = (form.elements.namedItem('phone') as HTMLInputElement);
    const receipt = (form.elements.namedItem('receipt') as HTMLInputElement);

    if (receipt) {
      if (!email.value && !phone.value) {
        alert('Поле E-mail или Phone не должно быть пустым');
        return;
      }
      receipt.value = JSON.stringify({
        EmailCompany: 'mail@mail.com',
        Taxation: 'patent',
        FfdVersion: '1.2',
        Items: [
          {
            Name: (descriptionEl?.value || description || 'Оплата'),
            Price: Math.round(amount * 100),
            Quantity: 1.0,
            Amount: Math.round(amount * 100),
            PaymentMethod: 'full_prepayment',
            PaymentObject: 'service',
            Tax: 'none',
            MeasurementUnit: 'pc',
          },
        ],
      });
    }
    (window as any).pay(form);
    onPaid?.();
  };

  return (
    <form className="payform-tbank" ref={formRef} onSubmit={onSubmit}>
      <input className="payform-tbank-row" type="hidden" name="terminalkey" value="1755011515658DEMO" />
      <input className="payform-tbank-row" type="hidden" name="frame" value="false" />
      <input className="payform-tbank-row" type="hidden" name="language" value="ru" />
      <input className="payform-tbank-row" type="hidden" name="receipt" value="" />
      <input className="payform-tbank-row" type="hidden" name="amount" value={Math.round(amount * 100)} />
      <input className="payform-tbank-row" type="hidden" name="order" />
      {description ? (
        <input className="payform-tbank-row" type="hidden" name="description" value={description} />
      ) : (
        <input className="payform-tbank-row" type="text" placeholder="Описание заказа" name="description" />
      )}
      {name ? (
        <input className="payform-tbank-row" type="hidden" name="name" value={name} />
      ) : (
        <input className="payform-tbank-row" type="text" placeholder="ФИО плательщика" name="name" />
      )}
      <input className="payform-tbank-row" type="email" placeholder="E-mail" name="email" />
      <input className="payform-tbank-row" type="tel" placeholder="Контактный телефон" name="phone" />
      <input className="payform-tbank-row payform-tbank-btn" type="submit" value="Оплатить" />
      <style jsx>{`
        .payform-tbank {
          display: flex;
          margin: 2px auto;
          flex-direction: column;
          max-width: 250px;
        }
        .payform-tbank-row {
          margin: 2px;
          border-radius: 4px;
          flex: 1;
          transition: 0.3s;
          border: 1px solid #DFE3F3;
          padding: 15px;
          outline: none;
          background-color: #DFE3F3;
          font-size: 15px;
        }
        .payform-tbank-row:focus {
          background-color: #FFFFFF;
          border: 1px solid #616871;
          border-radius: 4px;
        }
        .payform-tbank-btn {
          background-color: #FBC520;
          border: 1px solid #FBC520;
          color: #3C2C0B;
        }
        .payform-tbank-btn:hover {
          background-color: #FAB619;
          border: 1px solid #FAB619;
        }
      `}</style>
    </form>
  );
}
