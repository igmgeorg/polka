# Полка

Одностраничный React-журнал на основе каталога из `personal_reading_top_with_covers.html`.

## Запуск

Нужен Node.js 20 LTS или новее.

```bash
npm install
npm run dev
```

Production-сборка:

```bash
npm run build
npm run preview
```

Книжные данные остаются в JSON-блоке `booksData` исходного HTML. Во время разработки и сборки Vite автоматически извлекает их в `books.json`. Обложки берутся из `covers/livelib` и попадают в сборку как статические файлы.

## UI-тема

Интерфейс использует Brutalist Mono из соседнего `lazy-blog-front`: токены `--m-*`, Space Grotesk + JetBrains Mono, закрытую типографическую шкалу, 4px-сетку, квадратную геометрию и 2px-границы. Источники темы находятся в `src/shared/ui/theme`, а книжная раскладка — в `src/styles.css`.
