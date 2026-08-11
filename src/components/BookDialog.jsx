import { ArrowIcon, CheckIcon } from "./Icons";

export default function BookDialog({ selection, read, onRead, onClose }) {
  if (!selection) return null;
  const { book, category } = selection;
  return (
    <div className="dialog-backdrop mono-portal" role="presentation" onMouseDown={onClose}>
      <section className="book-dialog mono-scrollbar" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Закрыть">×</button>
        {book.cover ? (
          <img className="dialog-cover" src={`/${book.cover.replace(/^covers\//, "")}`} alt="" />
        ) : (
          <div className="dialog-cover dialog-cover--placeholder" aria-hidden="true">{book.title}</div>
        )}
        <div className="dialog-copy">
          <span className="kicker">{category.label}</span>
          <h2 id="dialog-title">{book.title}</h2>
          {book.series && <p className="book-series">Цикл «{book.series}»</p>}
          <p className="dialog-author">{book.author}</p>
          <a className="dialog-score" href={book.bookLink} target="_blank" rel="noreferrer">
            <strong>{book.score.toFixed(2)}</strong><span>из 10 · FantLab<br/>{book.ratingCount.toLocaleString("ru-RU")} оценок</span>
          </a>
          {book.originalTitle && <p className="original">Оригинал: {book.originalTitle} · {book.originalAuthor}</p>}
          <div className="dialog-actions">
            {book.bookLink && <a className="primary-action" href={book.bookLink} target="_blank" rel="noreferrer">Открыть на FantLab <ArrowIcon /></a>}
            <button className={`secondary-action${read ? " is-active" : ""}`} onClick={() => onRead(book)}><CheckIcon /> {read ? "Прочитано" : "Отметить прочитанной"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
