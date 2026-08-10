import { HeartIcon } from "./Icons";
import Category from "../shared/ui/data-display/Category";

export default function BookCard({ book, category, favorite, onFavorite, onOpen, featured = false }) {
  const compactCategory = {
    fantasy: "Fantasy",
    scifi: "Sci-Fi",
    foreign: "Fiction",
    russian: "Russian Lit",
  }[category.id] || category.label;

  return (
    <article className={`book-card ${featured ? "book-card--featured" : ""}`}>
      <div className="cover-shell">
        <button className="cover-button" onClick={() => onOpen(book, category)} aria-label={`Подробнее о книге «${book.title}»`}>
          <img src={`/${book.cover.replace(/^covers\//, "")}`} alt={`Обложка книги «${book.title}»`} loading="lazy" decoding="async" />
        </button>
        <button className={`favorite mono-focus${favorite ? " is-active" : ""}`} onClick={() => onFavorite(book)} aria-label={favorite ? "Убрать из сохранённых" : "Сохранить книгу"} title={favorite ? "Убрать из сохранённых" : "Сохранить книгу"}>
          <HeartIcon filled={favorite} />
        </button>
      </div>
      <div className="book-card__body">
        <div className="book-card__meta"><Category tone={category.id}>{compactCategory}</Category><span className="book-card__rating">★ {Number(book.score).toFixed(1)}</span></div>
        <h3><button onClick={() => onOpen(book, category)}>{book.title}</button></h3>
        <p className="author">{book.author}</p>
      </div>
    </article>
  );
}
