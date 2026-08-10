import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function extractBooks() {
  const html = readFileSync(resolve(process.cwd(), "personal_reading_top_with_covers.html"), "utf8");
  const match = html.match(/<script id="booksData" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Не найден блок booksData в исходном HTML");
  const library = JSON.parse(match[1]);
  const excludedFantasyTitles = new Set([
    "A Hero Born",
    "The Golden Compass",
    "The Curse of Chalion",
    "Theft of Swords",
    "Piranesi",
    "The Princess Bride",
    "Good Omens",
    "The Last Unicorn",
  ]);
  // Open Library reading-log audit (August 2026): fewer than 100 reader adds.
  // Ambiguous or unmatched records are deliberately not filtered out.
  const lowOpenLibraryActivityTitles = new Set([
    "The Emperor's Blades",
    "Vita Nostra",
    "Tigana",
    "The Goblin Reservation",
    "Inverted World",
    "Way Station",
    "The Night in Lisbon",
    "The Egyptian",
    "Queen Margot",
    "Arch of Triumph",
    "The Moon and Sixpence",
    "The Physician",
    "The Day of the Jackal",
    "Catch-22",
    "Shogun",
    "Lonesome Dove",
    "A Farewell to Arms",
    "Selected Stories",
    "The Luzhin Defense",
    "The Enchanted Wanderer",
    "A Young Doctor's Notebook",
    "The Fatal Eggs",
    "Heart of a Dog",
    "Hadji Murat",
    "Two Captains",
  ]);
  const curatedLibrary = library.map((category) => {
    const books = category.books
      .filter(
        (book) =>
          !lowOpenLibraryActivityTitles.has(book.originalTitle) &&
          (category.id !== "fantasy" ||
            !excludedFantasyTitles.has(book.originalTitle)),
      )
      .map((book, index) => ({ ...book, rank: index + 1 }));

    return { ...category, books };
  });

  return JSON.stringify(curatedLibrary);
}

function libraryDataPlugin() {
  return {
    name: "library-data",
    configureServer(server) {
      server.middlewares.use("/books.json", (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(extractBooks());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "books.json", source: extractBooks() });
    },
  };
}

export default defineConfig({
  plugins: [react(), libraryDataPlugin()],
  publicDir: "covers",
  build: { target: "es2020" },
});
