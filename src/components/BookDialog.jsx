import { useEffect, useRef } from "react";
import { ArrowIcon, CheckIcon, ReadingIcon, SeriesIcon } from "./Icons";

export default function BookDialog({ selection, status = "unread", onSetStatus, volumeStatus, onSetVolumeStatus, onAuthorSelect, onClose }) {
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
  const seriesBooks = book.seriesBooks || [];
  const representsSeries = seriesBooks.length > 1;
  const displayTitle = representsSeries ? book.series : book.title;
  const coverUrl = book.cover ? `${import.meta.env.BASE_URL}${book.cover.replace(/^covers\//, "")}` : null;
  return (
    <div className="dialog-backdrop mono-portal" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} className="book-dialog mono-scrollbar" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1} onMouseDown={(e) => e.stopPropagation()}>
        <button className="dialog-close mono-focus" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        <div className="dialog-art" aria-hidden="true">
          {coverUrl ? (
            <img className="dialog-cover" src={coverUrl} alt="" />
          ) : (
            <div className="dialog-cover dialog-cover--placeholder">{book.title}</div>
          )}
        </div>
        <div className="dialog-copy">
          <header className="dialog-header">
            <span className="kicker mono-cat" data-tone={category.id}>[ {category.label} ]</span>
            <h2 id="dialog-title" className={representsSeries ? "is-series" : undefined}>{representsSeries && <SeriesIcon className="series-icon" />}{displayTitle}</h2>
            <button className="dialog-author mono-focus" type="button" onClick={() => onAuthorSelect(book.author)} aria-label={`Показать все книги автора ${book.author}`}>{book.author}</button>
          </header>

          <div className="dialog-details">
            <a className="dialog-score mono-focus" href={book.bookLink} target="_blank" rel="noreferrer" aria-label={`Рейтинг ${book.score.toFixed(2)} из 10 на FantLab`}>
              <span className="dialog-score__label">Рейтинг FantLab</span>
              <ArrowIcon />
              <span className="dialog-score__value"><strong>{book.score.toFixed(2)}</strong><span className="dialog-score__meta">на основе <b>{book.ratingCount.toLocaleString("ru-RU")}</b> оценок</span></span>
            </a>
            {!representsSeries && (
              <section className="dialog-series dialog-series--single" aria-label="Статус чтения">
                <ol>
                  <li className={status === "read" ? "is-read" : status === "reading" ? "is-reading" : undefined}>
                    <span>{book.title}</span>
                    <span className="dialog-series__actions">
                      <button type="button" className={`mono-focus${status === "reading" ? " is-active-reading" : ""}`} aria-pressed={status === "reading"} aria-label="Читаю" onClick={() => onSetStatus(book, "reading")}><ReadingIcon /></button>
                      <button type="button" className={`mono-focus${status === "read" ? " is-active" : ""}`} aria-pressed={status === "read"} aria-label="Прочитано" onClick={() => onSetStatus(book, "read")}><CheckIcon /></button>
                    </span>
                  </li>
                </ol>
              </section>
            )}
            {book.series && seriesBooks.length <= 1 && (
              <div className="dialog-meta">
                <p><span>Цикл</span>«{book.series}»</p>
              </div>
            )}
            {seriesBooks.length > 1 && (
              <section className="dialog-series" aria-label="Книги цикла">
                <ol className="mono-scrollbar">
                  {seriesBooks.map((title) => {
                    const vStatus = volumeStatus(book.series, title);
                    return (
                      <li key={title} className={vStatus === "read" ? "is-read" : vStatus === "reading" ? "is-reading" : undefined}>
                        <span>{title}</span>
                        <span className="dialog-series__actions">
                          <button type="button" className={`mono-focus${vStatus === "reading" ? " is-active-reading" : ""}`} aria-pressed={vStatus === "reading"} aria-label={`«${title}»: читаю`} onClick={() => onSetVolumeStatus(book.series, title, "reading")}><ReadingIcon /></button>
                          <button type="button" className={`mono-focus${vStatus === "read" ? " is-active" : ""}`} aria-pressed={vStatus === "read"} aria-label={`«${title}»: прочитано`} onClick={() => onSetVolumeStatus(book.series, title, "read")}><CheckIcon /></button>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
