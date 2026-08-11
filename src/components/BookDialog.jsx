import { useEffect, useRef } from "react";
import { ArrowIcon, CheckIcon } from "./Icons";
import { seriesCatalog } from "../data/seriesCatalog";

export default function BookDialog({ selection, read, onRead, onAuthorSelect, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!selection) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function keepFocusInside(event) {
      if (event.key !== "Tab") return;
      const focusable = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", keepFocusInside);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocusInside);
      previouslyFocused?.focus();
    };
  }, [selection]);

  if (!selection) return null;
  const { book, category } = selection;
  const seriesBooks = seriesCatalog[book.series] || [];
  const representsSeries = seriesBooks.length > 1;
  const displayTitle = representsSeries ? book.series : book.title;
  const currentSeriesTitle = seriesBooks.includes(book.title) ? book.title : seriesBooks[0];
  return (
    <div className="dialog-backdrop mono-portal" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} className="book-dialog mono-scrollbar" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1} onMouseDown={(e) => e.stopPropagation()}>
        <button className="dialog-close mono-focus" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        <div className="dialog-art" aria-hidden="true">
          {book.cover ? (
            <img className="dialog-cover" src={`/${book.cover.replace(/^covers\//, "")}`} alt="" />
          ) : (
            <div className="dialog-cover dialog-cover--placeholder">{book.title}</div>
          )}
        </div>
        <div className="dialog-copy">
          <header className="dialog-header">
            <span className="kicker mono-cat" data-tone={category.id}>[ {category.label} ]</span>
            <h2 id="dialog-title" className={representsSeries ? "is-series" : undefined}>{displayTitle}</h2>
            <button className="dialog-author mono-focus" type="button" onClick={() => onAuthorSelect(book.author)} aria-label={`Показать все книги автора ${book.author}`}>{book.author}</button>
          </header>

          <div className="dialog-details">
            <a className="dialog-score mono-focus" href={book.bookLink} target="_blank" rel="noreferrer" aria-label={`${representsSeries ? "Рейтинг первой книги" : "Рейтинг"} ${book.score.toFixed(2)} из 10 на FantLab`}>
              <span className="dialog-score__label">{representsSeries ? "Рейтинг первой книги" : "Рейтинг FantLab"}</span>
              <ArrowIcon />
              <span className="dialog-score__value"><strong>{book.score.toFixed(2)}</strong><small>/ 10</small></span>
              <span className="dialog-score__meta">На основе <b>{book.ratingCount.toLocaleString("ru-RU")}</b> оценок</span>
            </a>
            {book.series && seriesBooks.length <= 1 && (
              <div className="dialog-meta">
                <p><span>Цикл</span>«{book.series}»</p>
              </div>
            )}
            {seriesBooks.length > 1 && (
              <section className="dialog-series" aria-labelledby="dialog-series-title">
                <div className="dialog-series__header">
                  <span id="dialog-series-title">Книги цикла</span>
                  <b title={`${seriesBooks.length} книг в цикле`}>{seriesBooks.length}</b>
                </div>
                <ol className="mono-scrollbar">
                  {seriesBooks.map((title) => <li key={title} className={title === currentSeriesTitle ? "is-current" : undefined}><span>{title}</span></li>)}
                </ol>
              </section>
            )}
          </div>

          <div className="dialog-actions">
            {book.bookLink && <a className="primary-action mono-focus" href={book.bookLink} target="_blank" rel="noreferrer">FantLab <ArrowIcon /></a>}
            <button className={`secondary-action mono-focus${read ? " is-active" : ""}`} type="button" aria-pressed={read} onClick={() => onRead(book)}><CheckIcon /> {read ? "Прочитано" : "Отметить прочитанной"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
