import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { loadLibrary } from "./data/loadBooks";
import BookCard from "./components/BookCard";
import { MoonIcon, SearchIcon, SunIcon } from "./components/Icons";
import UnderlineTabs from "./shared/ui/navigation/UnderlineTabs";
import Field from "./shared/ui/forms/Field";
import Select from "./shared/ui/forms/Select";

const BookDialog = lazy(() => import("./components/BookDialog"));

const allTab = { id: "all", label: "Все книги" };

export default function App() {
  const [library, setLibrary] = useState([]);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("shelf-theme") || "light");
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem("shelf-favorites") || "[]")));

  useEffect(() => { loadLibrary().then(setLibrary).catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("shelf-theme", theme);
  }, [theme]);
  useEffect(() => {
    const close = (e) => e.key === "Escape" && setSelection(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const books = useMemo(() => library.flatMap((category) => category.books.map((book) => ({ book, category }))), [library]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return books.filter(({ book, category }) => {
      if (normalized) {
        return [book.title, book.author, book.originalTitle, book.originalAuthor]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ru")
          .includes(normalized);
      }
      if (active === "favorites") return favorites.has(book.coverLink);
      return active === "all" || category.id === active;
    }).sort((left, right) => {
      if (sort === "rating") return Number(right.book.score) - Number(left.book.score);
      if (sort === "author") return left.book.author.localeCompare(right.book.author, "ru");
      return 0;
    });
  }, [books, active, query, favorites, sort]);

  function toggleFavorite(book) {
    setFavorites((current) => {
      const next = new Set(current);
      next.has(book.coverLink) ? next.delete(book.coverLink) : next.add(book.coverLink);
      localStorage.setItem("shelf-favorites", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="app-shell mono-scope">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Полка, на главную"><span>П</span>полка<sup>{visible.length}</sup></a>
        <div className="header-genres">
          <UnderlineTabs
            baseline={false}
            reservedBrackets
            tabs={[
              { ...allTab, label: "Все" },
              ...library.map((category) => ({ ...category, label: ({ fantasy: "Fantasy", scifi: "Sci-Fi", foreign: "Fiction", russian: "Russian Lit" })[category.id] || category.label })),
              { id: "favorites", label: `Saved ${favorites.size}` },
            ]}
            current={active}
            onSelect={setActive}
            ariaLabel="Жанры книг"
          />
        </div>
        <button className="theme-button mono-icon-btn mono-focus" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Сменить тему">
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
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
                  { value: "recommended", label: "By recommendation" },
                  { value: "rating", label: "LiveLib rating" },
                  { value: "author", label: "Author: A—Z" },
                ]} />
              </div>
            </div>
          </div>

          {error && <div className="notice">{error}. Запускайте проект через Vite, а не напрямую как файл.</div>}
          {!error && !library.length && <div className="loading">Собираем библиотеку…</div>}
          <div className="book-grid">
            {visible.map(({ book, category }, index) => <BookCard key={book.coverLink} book={book} category={category} featured={index === 0 && active !== "all"} favorite={favorites.has(book.coverLink)} onFavorite={toggleFavorite} onOpen={(book, category) => setSelection({ book, category })} />)}
          </div>
          {library.length > 0 && visible.length === 0 && <div className="empty">Здесь пока пусто.<br/><button onClick={() => { setQuery(""); setActive("all"); }}>Вернуться ко всем книгам</button></div>}
        </section>

      </main>

      <footer><a className="brand" href="#top"><span>П</span>полка</a><p>Личная библиотека · {new Date().getFullYear()}</p><a href="https://www.livelib.ru/" target="_blank" rel="noreferrer">Данные LiveLib ↗</a></footer>
      <Suspense fallback={null}><BookDialog selection={selection} favorite={selection ? favorites.has(selection.book.coverLink) : false} onFavorite={toggleFavorite} onClose={() => setSelection(null)} /></Suspense>
    </div>
  );
}
