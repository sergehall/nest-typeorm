'use client';

import { useEffect } from 'react';

type ErrorPageProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell not-found" role="alert">
      <p className="eyebrow">Error / application</p>
      <h1>Что-то пошло не так.</h1>
      <p>Попробуйте повторить запрос. Если ошибка сохранится, сообщите о ней через контакты.</p>
      <button className="button button--primary" type="button" onClick={reset}>
        Повторить
      </button>
    </div>
  );
}
