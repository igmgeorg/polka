import { CheckIcon, ReadersIcon } from "./Icons";
import Category from "../shared/ui/data-display/Category";
import { seriesCatalog } from "../data/seriesCatalog";

export default function BookCard({ book, category, read, dimRead = true, onOpen, onAuthorSelect, featured = false }) {
  const seriesBooks = seriesCatalog[book.series] || [];
  const representsSeries = seriesBooks.length > 1;
  const displayTitle = representsSeries ? book.series : book.title;
  const compactCategory = {
    fantasy: "Fantasy",
    scifi: "Sci-Fi",
    foreign: "Fiction",
    russian: "Russian",
    heritage: "Heritage",
  }[category.id] || category.label;

  return (
    <article className={`book-card${featured ? " book-card--featured" : ""}${read && dimRead ? " is-read" : ""}`}>
      <div className="cover-shell">
        <button className="cover-button mono-focus" onClick={() => onOpen(book, category)} aria-label={`Подробнее о ${representsSeries ? `цикле «${book.series}»` : `книге «${book.title}»`}`}>
          {book.cover ? (
            <img src={`/${book.cover.replace(/^covers\//, "")}`} alt={`Обложка книги «${book.title}»`} loading="lazy" decoding="async" />
          ) : (
            <span className="cover-placeholder" aria-hidden="true">{book.title}</span>
          )}
        </button>
        {read && <span className="read-badge"><CheckIcon /> Read</span>}
      </div>
      <div className="book-card__body">
        <div className="book-card__meta">
          <Category tone={category.id}>{compactCategory}</Category>
          {book.series && !representsSeries && <span className="book-card__series" title={`Цикл «${book.series}»`}>· {book.series}</span>}
        </div>
        <h3><button className={`mono-focus${representsSeries ? " book-card__series-title" : ""}`} data-tone={representsSeries ? category.id : undefined} onClick={() => onOpen(book, category)}>{displayTitle}</button></h3>
        <button className="author mono-focus" type="button" onClick={() => onAuthorSelect(book.author)} aria-label={`Показать все книги автора ${book.author}`}>{book.author}</button>
        <div className="book-card__stats">
          <span title={`${book.ratingCount.toLocaleString("ru-RU")} читателей оценили книгу на FantLab`}><ReadersIcon /> {book.ratingCount.toLocaleString("ru-RU")}</span>
          <span className="book-card__rating" title={`FantLab: ${book.score.toFixed(2)} из 10`}>★ {book.score.toFixed(1)}</span>
        </div>
      </div>
    </article>
  );
}
