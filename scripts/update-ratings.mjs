import { readFile, writeFile } from "node:fs/promises";

const booksPath = new URL("../books.json", import.meta.url);
const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const delayMs = 400;
const userAgent = "Mozilla/5.0 (compatible; shelf-reading-journal/1.0)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isFantlabWorkUrl(url) {
  return /^https:\/\/fantlab\.ru\/work\d+\/?$/.test(url ?? "");
}

async function fetchPage(url) {
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

function extractRating(html) {
  const score = Number(html.match(/itemprop="ratingValue">([\d.]+)</)?.[1]);
  const ratingCount = Number(html.match(/itemprop="ratingCount">(\d+)</)?.[1]);
  if (!score || !ratingCount) throw new Error("rating markers not found on page");
  return { score, ratingCount };
}

// A book's own work page carries a breadcrumb of the cycles it belongs to,
// e.g. "цикл «Космер» > условный цикл «Рошар» > цикл «Архив Буресвета»" —
// match the link whose text equals our series name to find its own FantLab page.
function findCycleLink(html, seriesName) {
  const re = /цикл <a href='\/work(\d+)'>«([^»]+)»<\/a>/g;
  let match;
  while ((match = re.exec(html))) {
    if (match[2] === seriesName) return `https://fantlab.ru/work${match[1]}`;
  }
  return null;
}

const categories = JSON.parse(await readFile(booksPath, "utf8"));
const allBooks = categories.flatMap((category) => category.books.map((book) => ({ book, category })));

let updated = 0;
let unchanged = 0;
let failed = 0;
let processed = 0;

for (const { book, category } of allBooks) {
  if (processed >= limit) break;
  processed += 1;
  const context = `${category.id}/${book.author}/${book.title}`;
  const isSeries = (book.seriesBooks?.length ?? 0) > 1;

  try {
    if (!isFantlabWorkUrl(book.bookLink)) throw new Error(`unsupported or missing FantLab URL ${book.bookLink}`);

    // Series rows are rated by their cycle page, not the first volume's own page.
    // Already-migrated links (pointing at the cycle itself) won't match their own
    // name in the breadcrumb, so this naturally becomes a no-op on repeat runs.
    let ratingUrl = book.bookLink;
    if (isSeries) {
      const bookHtml = await fetchPage(book.bookLink);
      await sleep(delayMs);
      const cycleLink = findCycleLink(bookHtml, book.series);
      if (cycleLink) ratingUrl = cycleLink;
      else if (ratingUrl === book.bookLink) console.warn(`  (no cycle page found for "${book.series}" on FantLab, using current link)`);
    }

    const html = await fetchPage(ratingUrl);
    const { score, ratingCount } = extractRating(html);
    const linkChanged = ratingUrl !== book.bookLink;

    if (score !== book.score || ratingCount !== book.ratingCount || linkChanged) {
      console.log(`~ ${context}: ${book.score} (${book.ratingCount}) -> ${score} (${ratingCount})${linkChanged ? ` [bookLink -> ${ratingUrl}]` : ""}`);
      if (!dryRun) {
        book.score = score;
        book.ratingCount = ratingCount;
        book.bookLink = ratingUrl;
      }
      updated += 1;
    } else {
      unchanged += 1;
    }
  } catch (error) {
    console.error(`! ${context}: ${error.message}`);
    failed += 1;
  }

  if (processed < limit && processed < allBooks.length) await sleep(delayMs);
}

if (!dryRun && updated > 0) {
  await writeFile(booksPath, `${JSON.stringify(categories, null, 2)}\n`);
}

console.log(`\nDone: ${updated} updated, ${unchanged} unchanged, ${failed} failed${dryRun ? " (dry run, nothing written)" : ""}.`);
if (failed > 0) process.exitCode = 1;
