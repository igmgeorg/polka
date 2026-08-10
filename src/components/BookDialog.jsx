import { ArrowIcon, HeartIcon } from "./Icons";

export default function BookDialog({ selection, favorite, onFavorite, onClose }) {
  if (!selection) return null;
  const { book, category } = selection;
  return (
    <div className="dialog-backdrop mono-portal" role="presentation" onMouseDown={onClose}>
      <section className="book-dialog mono-scrollbar" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Закрыть">×</button>
        <img className="dialog-cover" src={`/${book.cover.replace(/^covers\//, "")}`} alt="" />
        <div className="dialog-copy">
          <span className="kicker">{category.label} · № {String(book.rank).padStart(2, "0")}</span>
          <h2 id="dialog-title">{book.title}</h2>
          <p className="dialog-author">{book.author}</p>
          <div className="dialog-score"><strong>{Number(book.score).toFixed(1)}</strong><span>рейтинг<br/>LiveLib</span></div>
          {book.originalTitle && <p className="original">Оригинал: {book.originalTitle} · {book.originalAuthor}</p>}
          <div className="dialog-actions">
            <a className="primary-action" href={book.coverLink} target="_blank" rel="noreferrer">Открыть на LiveLib <ArrowIcon /></a>
            <button className="secondary-action" onClick={() => onFavorite(book)}><HeartIcon filled={favorite} /> {favorite ? "Сохранено" : "Сохранить"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
