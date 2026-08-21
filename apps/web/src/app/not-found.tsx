import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell not-found">
      <p className="eyebrow">Error / 404</p>
      <h1>Такой страницы пока нет.</h1>
      <p>Возможно, маршрут ещё не появился в новом web-приложении.</p>
      <Link className="button button--primary" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
