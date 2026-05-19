import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "src/assets/content");
const indexPath = path.join(rootDir, "src/assets/new-index.json");
const outputPath = path.join(rootDir, "src/assets/algolia/verses.json");

function asArray(value) {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function byId(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function cleanText(value) {
  return typeof value === "string"
    ? value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n")
    : "";
}

function sortPathParts(a, b) {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

async function listJsonFiles(dir) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return listJsonFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );

  return files.flat().sort(sortPathParts);
}

function buildMetadata(indexItems) {
  const books = byId(indexItems);
  const sections = new Map();
  const poems = new Map();

  for (const book of indexItems) {
    for (const section of book.sections ?? []) {
      sections.set(`${book.id}/${section.id}`, section);

      for (const poem of section.poems ?? []) {
        poems.set(`${book.id}/${section.id}/${poem.id}`, poem);
      }
    }
  }

  return { books, sections, poems };
}

function textByLanguage(verse) {
  const text = new Map();

  for (const node of verse.Text ?? []) {
    text.set(node.lang, cleanText(node._content));
  }

  return text;
}

function buildRecord({ poem, verse, para, bookMeta, sectionMeta, poemMeta }) {
  const text = textByLanguage(verse);
  const content = text.get("Original") ?? "";

  if (!content) {
    return null;
  }

  const verseId = String(verse.id);
  const id = `${poem.bookId}/${poem.sectionId}/${poem.id}/${verseId}`;
  const paraId = para.id == null ? "" : String(para.id);

  return {
    objectID: id,
    id,
    bookId: poem.bookId,
    sectionId: poem.sectionId,
    poemId: poem.id,
    verseId,
    paraId,
    bookName: bookMeta?.name ?? poem.bookName ?? "",
    bookNameRomanized: bookMeta?.nameAlt?.romanized ?? "",
    bookNameEnglish: bookMeta?.nameAlt?.en ?? "",
    sectionName: sectionMeta?.name ?? poem.sectionName ?? "",
    sectionNameRomanized: sectionMeta?.nameAlt?.romanized ?? "",
    sectionNameEnglish: sectionMeta?.nameAlt?.en ?? "",
    poemName: poemMeta?.name ?? poem.name ?? "",
    poemNameRomanized: poemMeta?.nameAlt?.romanized ?? "",
    poemNameEnglish: poemMeta?.nameAlt?.en ?? "",
    paraName: para.name ?? "",
    content,
    contentUrdu: text.get("Urdu") ?? "",
    contentEnglish: text.get("English") ?? "",
  };
}

async function main() {
  const indexItems = JSON.parse(await readFile(indexPath, "utf8"));
  const metadata = buildMetadata(indexItems);
  const files = await listJsonFiles(contentDir);
  const records = [];

  for (const file of files) {
    const poem = JSON.parse(await readFile(file, "utf8"));
    const bookMeta = metadata.books.get(poem.bookId);
    const sectionMeta = metadata.sections.get(`${poem.bookId}/${poem.sectionId}`);
    const poemMeta = metadata.poems.get(`${poem.bookId}/${poem.sectionId}/${poem.id}`);

    for (const para of asArray(poem.Para)) {
      for (const verse of asArray(para.Verse)) {
        const record = buildRecord({
          poem,
          verse,
          para,
          bookMeta,
          sectionMeta,
          poemMeta,
        });

        if (record) {
          records.push(record);
        }
      }
    }
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);

  console.log(`Wrote ${records.length} records to ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
