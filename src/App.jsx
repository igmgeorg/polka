import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { loadLibrary } from "./data/loadBooks";
import BookCard from "./components/BookCard";
import { MoonIcon, SearchIcon, SunIcon } from "./components/Icons";
import UnderlineTabs from "./shared/ui/navigation/UnderlineTabs";
import Field from "./shared/ui/forms/Field";
import Select from "./shared/ui/forms/Select";

const BookDialog = lazy(() => import("./components/BookDialog"));

const allTab = { id: "all", label: "ALL" };
const bookKey = (book) => book.bookLink || `${book.originalAuthor || book.author}:${book.originalTitle || book.title}`;

export default function App() {
  const [library, setLibrary] = useState([]);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("rating");
  const [readFilter, setReadFilter] = useState(() => localStorage.getItem("shelf-read-filter") || "all");
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("shelf-theme") || "light");
  const [readBooks, setReadBooks] = useState(() => new Set(JSON.parse(localStorage.getItem("shelf-read") || localStorage.getItem("shelf-favorites") || "[]")));

  useEffect(() => { loadLibrary().then(setLibrary).catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("shelf-theme", theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem("shelf-read-filter", readFilter); }, [readFilter]);
  useEffect(() => {
    const close = (e) => e.key === "Escape" && setSelection(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const books = useMemo(() => library.flatMap((category) => category.books.map((book) => ({ book, category }))), [library]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return books.filter(({ book, category }) => {
      const matchesQuery = !normalized || [book.title, book.author, book.originalTitle, book.originalAuthor]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ru")
          .includes(normalized);
      const matchesGenre = active === "all" || category.id === active;
      const isRead = readBooks.has(bookKey(book));
      const matchesRead = readFilter === "all" || (readFilter === "read" ? isRead : !isRead);
      return matchesQuery && matchesGenre && matchesRead;
    }).sort((left, right) => {
      if (sort === "rating") return right.book.score - left.book.score
        || right.book.ratingCount - left.book.ratingCount
        || left.book.author.localeCompare(right.book.author, "ru")
        || left.book.title.localeCompare(right.book.title, "ru");
      if (sort === "readers") return right.book.ratingCount - left.book.ratingCount
        || right.book.score - left.book.score
        || left.book.author.localeCompare(right.book.author, "ru")
        || left.book.title.localeCompare(right.book.title, "ru");
      return left.book.author.localeCompare(right.book.author, "ru")
        || left.book.title.localeCompare(right.book.title, "ru");
    });
  }, [books, active, query, readBooks, readFilter, sort]);

  function toggleRead(book) {
    setReadBooks((current) => {
      const next = new Set(current);
      const key = bookKey(book);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem("shelf-read", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="app-shell mono-scope">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Полка, на главную"><span>П</span>полка</a>
        <div className="header-genres">
          <UnderlineTabs
            baseline={false}
            reservedBrackets
            tabs={[
              { ...allTab, count: books.length },
              ...library.map((category) => ({ ...category, count: category.books.length, label: ({ fantasy: "Fantasy", scifi: "Sci-Fi", foreign: "Fiction", russian: "Russian", beyond: "Beyond" })[category.id] || category.label })),
            ]}
            current={active}
            onSelect={setActive}
            ariaLabel="Жанры книг"
          />
        </div>
        <div className="header-actions">
          <div className="status-filter">
            <Select label="READING STATUS" labelHidden value={readFilter} onChange={setReadFilter} options={[
              { value: "unread", label: "Unread" },
              { value: "all", label: "All books" },
              { value: "read", label: "Read" },
            ]} />
          </div>
          <button className="theme-button mono-icon-btn mono-focus" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Сменить тему">
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="catalog" id="catalog">
          <div className="toolbar">
            <div className="tabs-section">
              <div className="catalog-search">
              <Field label="SEARCH BY TITLE OR AUTHOR" labelHidden icon={<SearchIcon />} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title or author" />
              </div>
              <div className="tabs-sort">
                <Select label="SORT BOOKS" labelHidden value={sort} onChange={setSort} options={[
                  { value: "rating", label: "FantLab rating" },
                  { value: "readers", label: "Most readers" },
                  { value: "author", label: "Author: A—Z" },
                ]} />
              </div>
            </div>
          </div>

          {error && <div className="notice">{error}. Запускайте проект через Vite, а не напрямую как файл.</div>}
          {!error && !library.length && <div className="loading">Собираем библиотеку…</div>}
          <div className="book-grid">
            {visible.map(({ book, category }, index) => <BookCard key={`${category.id}:${bookKey(book)}`} book={book} category={category} featured={index === 0 && active !== "all"} read={readBooks.has(bookKey(book))} dimRead={readFilter === "all"} onOpen={(book, category) => setSelection({ book, category })} />)}
          </div>
          {library.length > 0 && visible.length === 0 && <div className="empty">Здесь пока пусто.<br/><button onClick={() => { setQuery(""); setActive("all"); setReadFilter("all"); }}>Вернуться ко всем книгам</button></div>}
        </section>

      </main>

      <footer><p>Личная библиотека · {new Date().getFullYear()}</p><p>Обложки FantLab</p></footer>
      <Suspense fallback={null}><BookDialog selection={selection} read={selection ? readBooks.has(bookKey(selection.book)) : false} onRead={toggleRead} onClose={() => setSelection(null)} /></Suspense>
    </div>
  );
}
