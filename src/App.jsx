import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { loadLibrary } from "./data/loadBooks";
import { seriesCatalog } from "./data/seriesCatalog";
import BookCard from "./components/BookCard";
import { MoonIcon, SearchIcon, SunIcon } from "./components/Icons";
import UnderlineTabs from "./shared/ui/navigation/UnderlineTabs";
import Field from "./shared/ui/forms/Field";
import Select from "./shared/ui/forms/Select";

const BookDialog = lazy(() => import("./components/BookDialog"));

const allTab = { id: "all", label: "ALL" };
const bookKey = (book) => book.bookLink || `${book.originalAuthor || book.author}:${book.originalTitle || book.title}`;
const weightedScore = (book, baselineScore, confidenceVotes) => {
  return (book.ratingCount / (book.ratingCount + confidenceVotes)) * book.score
    + (confidenceVotes / (book.ratingCount + confidenceVotes)) * baselineScore;
};

export default function App() {
  const [library, setLibrary] = useState([]);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("balanced");
  const [readFilter, setReadFilter] = useState(() => localStorage.getItem("shelf-read-filter") || "all");
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("shelf-theme") || "light");
  const [readOverrides, setReadOverrides] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("shelf-read-overrides") || "{}");
    const legacy = JSON.parse(localStorage.getItem("shelf-read") || localStorage.getItem("shelf-favorites") || "[]");
    legacy.forEach((key) => { if (saved[key] === undefined) saved[key] = true; });
    return saved;
  });

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
  const balanceStats = useMemo(() => {
    const voteCounts = books.map(({ book }) => book.ratingCount).sort((a, b) => a - b);
    const totalVotes = books.reduce((total, { book }) => total + book.ratingCount, 0);
    return {
      baselineScore: totalVotes
        ? books.reduce((total, { book }) => total + book.score * book.ratingCount, 0) / totalVotes
        : 0,
      confidenceVotes: voteCounts[Math.floor((voteCounts.length - 1) / 2)] || 1,
    };
  }, [books]);
  const isBookRead = (book) => readOverrides[bookKey(book)] ?? book.read === true;
  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(library.map((category) => [category.id, 0]));
    let all = 0;

    books.forEach(({ book, category }) => {
      const isRead = readOverrides[bookKey(book)] ?? book.read === true;
      const matchesRead = readFilter === "all" || (readFilter === "read" ? isRead : !isRead);
      if (!matchesRead) return;
      counts[category.id] += 1;
      all += 1;
    });

    return { all, categories: counts };
  }, [books, library, readOverrides, readFilter]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return books.filter(({ book, category }) => {
      const matchesQuery = !normalized || [book.title, book.series, ...(seriesCatalog[book.series] || []), book.author, book.originalTitle, book.originalAuthor]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ru")
          .includes(normalized);
      const matchesGenre = active === "all" || category.id === active;
      const isRead = isBookRead(book);
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
      if (sort === "balanced") return weightedScore(right.book, balanceStats.baselineScore, balanceStats.confidenceVotes)
        - weightedScore(left.book, balanceStats.baselineScore, balanceStats.confidenceVotes)
        || right.book.ratingCount - left.book.ratingCount
        || left.book.author.localeCompare(right.book.author, "ru")
        || left.book.title.localeCompare(right.book.title, "ru");
      return left.book.author.localeCompare(right.book.author, "ru")
        || left.book.title.localeCompare(right.book.title, "ru");
    });
  }, [books, active, query, readOverrides, readFilter, sort, balanceStats]);
  const hasActiveFilters = active !== "all" || query.trim() || readFilter !== "all";

  function resetFilters() {
    setQuery("");
    setActive("all");
    setReadFilter("all");
  }

  function toggleRead(book) {
    setReadOverrides((current) => {
      const next = { ...current };
      const key = bookKey(book);
      next[key] = !(current[key] ?? book.read === true);
      localStorage.setItem("shelf-read-overrides", JSON.stringify(next));
      return next;
    });
  }

  function showAuthor(author) {
    setQuery(author);
    setActive("all");
    setReadFilter("all");
    setSelection(null);
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
              { ...allTab, count: statusCounts.all },
              ...library.map((category) => ({ ...category, count: statusCounts.categories[category.id] ?? 0, label: ({ fantasy: "Fantasy", scifi: "Sci-Fi", foreign: "Fiction", russian: "Russian", heritage: "Heritage" })[category.id] || category.label })),
            ]}
            current={active}
            onSelect={setActive}
            ariaLabel="Жанры книг"
          />
        </div>
        <div className="header-actions">
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
                <Field label="SEARCH" labelHidden icon={<SearchIcon />} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
              </div>
              <div className="catalog-summary" aria-live="polite">
                <span><strong>{visible.length}</strong> / {books.length} books</span>
                {hasActiveFilters && <button className="mono-focus" type="button" onClick={resetFilters}>Reset</button>}
              </div>
              <div className="catalog-controls">
                <div className="status-filter">
                  <Select label="READING STATUS" labelHidden value={readFilter} onChange={setReadFilter} options={[
                    { value: "unread", label: "Unread" },
                    { value: "all", label: "All books" },
                    { value: "read", label: "Read" },
                  ]} />
                </div>
                <div className="tabs-sort">
                  <Select label="SORT BOOKS" labelHidden value={sort} onChange={setSort} options={[
                    { value: "balanced", label: "Balanced rating" },
                    { value: "rating", label: "FantLab rating" },
                    { value: "readers", label: "Most readers" },
                    { value: "author", label: "Author: A—Z" },
                  ]} />
                </div>
              </div>
            </div>
          </div>

          {error && <div className="notice" role="alert"><span className="kicker">// LOAD ERROR</span><strong>Библиотека недоступна</strong><p>{error}. Запускайте проект через Vite, а не напрямую как файл.</p></div>}
          {!error && !library.length && <div className="loading" role="status" aria-live="polite"><span className="kicker">// INDEXING</span><strong>Собираем библиотеку…</strong></div>}
          <div className="book-grid">
            {visible.map(({ book, category }, index) => <BookCard key={`${category.id}:${bookKey(book)}`} book={book} category={category} featured={index === 0 && active !== "all"} read={isBookRead(book)} onOpen={(book, category) => setSelection({ book, category })} onAuthorSelect={showAuthor} />)}
          </div>
          {library.length > 0 && visible.length === 0 && <div className="empty" role="status"><span className="kicker">// NO MATCHES</span><strong>На этой полке ничего не найдено</strong><p>Попробуйте изменить запрос или сбросить фильтры.</p><button className="mono-focus" type="button" onClick={resetFilters}>Показать все книги</button></div>}
        </section>

      </main>

      <footer><p>Личная библиотека · {new Date().getFullYear()}</p><p>Обложки FantLab</p></footer>
      <Suspense fallback={null}><BookDialog selection={selection} read={selection ? isBookRead(selection.book) : false} onRead={toggleRead} onAuthorSelect={showAuthor} onClose={() => setSelection(null)} /></Suspense>
    </div>
  );
}
