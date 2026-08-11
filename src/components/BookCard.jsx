import { CheckIcon, ReadersIcon } from "./Icons";
import Category from "../shared/ui/data-display/Category";

export default function BookCard({ book, category, read, dimRead = true, onOpen, featured = false }) {
  const compactCategory = {
    fantasy: "Fantasy",
    scifi: "Sci-Fi",
    foreign: "Fiction",
    russian: "Russian",
    beyond: "Beyond",
  }[category.id] || category.label;

  return (
    <article className={`book-card${featured ? " book-card--featured" : ""}${read && dimRead ? " is-read" : ""}`}>
      <div className="cover-shell">
        <button className="cover-button" onClick={() => onOpen(book, category)} aria-label={`Подробнее о книге «${book.title}»`}>
          {book.cover ? (
            <img src={`/${book.cover.replace(/^covers\//, "")}`} alt={`Обложка книги «${book.title}»`} loading="lazy" decoding="async" />
          ) : (
            <span className="cover-placeholder" aria-hidden="true">{book.title}</span>
          )}
        </button>
        {read && <span className="read-badge"><CheckIcon /> Прочитано</span>}
      </div>
      <div className="book-card__body">
        <div className="book-card__meta">
          <Category tone={category.id}>{compactCategory}</Category>
          {book.series && <span className="book-card__series" title={`Цикл «${book.series}»`}>· {book.series}</span>}
        </div>
        <h3><button onClick={() => onOpen(book, category)}>{book.title}</button></h3>
        <p className="author">{book.author}</p>
        <div className="book-card__stats">
          <span title={`${book.ratingCount.toLocaleString("ru-RU")} читателей оценили книгу на FantLab`}><ReadersIcon /> {book.ratingCount.toLocaleString("ru-RU")}</span>
          <span className="book-card__rating" title={`FantLab: ${book.score.toFixed(2)} из 10`}>★ {book.score.toFixed(1)}</span>
        </div>
      </div>
    </article>
  );
}
