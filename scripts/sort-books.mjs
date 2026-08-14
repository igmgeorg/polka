import { readFile, writeFile } from "node:fs/promises";

const booksPath = new URL("../books.json", import.meta.url);
const collator = new Intl.Collator("ru", { sensitivity: "base" });
const categories = JSON.parse(await readFile(booksPath, "utf8"));

const displayName = (book) => {
  const seriesBooks = book.seriesBooks || [];
  return seriesBooks.length > 1 ? book.series : book.title;
};

for (const category of categories) {
  category.books.sort((left, right) => (
    collator.compare(left.author, right.author)
    || collator.compare(displayName(left), displayName(right))
    || collator.compare(left.title, right.title)
  ));
}

await writeFile(booksPath, `${JSON.stringify(categories, null, 2)}\n`);
