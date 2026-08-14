import { CheckIcon, ReadersIcon, ReadingIcon, SeriesIcon } from "./Icons";
import Category from "../shared/ui/data-display/Category";

export default function BookCard({ book, category, status = "unread", seriesProgress, onOpen, onAuthorSelect, featured = false }) {
  const seriesBooks = book.seriesBooks || [];
  const representsSeries = seriesBooks.length > 1;
  const displayTitle = representsSeries ? book.series : book.title;
  const coverUrl = book.cover ? `${import.meta.env.BASE_URL}${book.cover.replace(/^covers\//, "")}` : null;
  const compactCategory = {
    fantasy: "Fantasy",
    scifi: "Sci-Fi",
    foreign: "Fiction",
    russian: "Russian",
    heritage: "Heritage",
  }[category.id] || category.label;

  const badge = representsSeries && seriesProgress
    ? (seriesProgress.isReading || seriesProgress.readCount > 0)
      ? {
          reading: seriesProgress.isReading,
          icon: seriesProgress.isReading ? <ReadingIcon /> : <CheckIcon />,
          label: `${seriesProgress.isReading ? "reading" : "read"} · ${seriesProgress.readCount} / ${seriesProgress.total}`,
        }
      : null
    : status === "read"
      ? { reading: false, icon: <CheckIcon />, label: "Read" }
      : status === "reading"
        ? { reading: true, icon: <ReadingIcon />, label: "Reading" }
        : null;
  const isFullyRead = representsSeries && seriesProgress
    ? seriesProgress.readCount > 0 && !seriesProgress.isReading
    : status === "read";

  return (
    <article className={`book-card${featured ? " book-card--featured" : ""}${isFullyRead ? " is-read" : ""}`}>
      <div className="cover-shell">
        <button className="cover-button mono-focus" onClick={() => onOpen(book, category)} aria-label={`Подробнее о ${representsSeries ? `цикле «${book.series}»` : `книге «${book.title}»`}`}>
          {coverUrl ? (
            <img src={coverUrl} alt={`Обложка книги «${book.title}»`} loading="lazy" decoding="async" />
          ) : (
            <span className="cover-placeholder" aria-hidden="true">{book.title}</span>
          )}
        </button>
        {badge && <span className={`read-badge${badge.reading ? " is-reading" : ""}`}>{badge.icon ? <>{badge.icon} </> : null}{badge.label}</span>}
      </div>
      <div className="book-card__body">
        <div className="book-card__meta">
          <Category tone={category.id}>{compactCategory}</Category>
          {book.series && !representsSeries && <span className="book-card__series" title={`Цикл «${book.series}»`}>· {book.series}</span>}
        </div>
        <h3><button className="mono-focus" onClick={() => onOpen(book, category)}>{representsSeries && <SeriesIcon className="series-icon" />}{displayTitle}</button></h3>
        <button className="author mono-focus" type="button" onClick={() => onAuthorSelect(book.author)} aria-label={`Показать все книги автора ${book.author}`}>{book.author}</button>
        <div className="book-card__stats">
          <span title={`${book.ratingCount.toLocaleString("ru-RU")} читателей оценили книгу на FantLab`}><ReadersIcon /> {book.ratingCount.toLocaleString("ru-RU")}</span>
          <span className="book-card__rating" title={`FantLab: ${book.score.toFixed(2)} из 10`}>★ {book.score.toFixed(1)}</span>
        </div>
      </div>
    </article>
  );
}
