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

function poemNames({ poem, bookMeta, sectionMeta, poemMeta }) {
  return {
    bookName: bookMeta?.name ?? poem.bookName ?? "",
    bookNameRomanized: bookMeta?.nameAlt?.romanized ?? "",
    bookNameEnglish: bookMeta?.nameAlt?.en ?? "",
    sectionName: sectionMeta?.name ?? poem.sectionName ?? "",
    sectionNameRomanized: sectionMeta?.nameAlt?.romanized ?? "",
    sectionNameEnglish: sectionMeta?.nameAlt?.en ?? "",
    poemName: poemMeta?.name ?? poem.name ?? "",
    poemNameRomanized: poemMeta?.nameAlt?.romanized ?? "",
    poemNameEnglish: poemMeta?.nameAlt?.en ?? "",
  };
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function buildRecord({ poem, verse, para, bookMeta, sectionMeta, poemMeta }) {
  const text = textByLanguage(verse);
  const content = text.get("Original") ?? "";

  if (!content) {
    return null;
  }

  const verseId = String(verse.id);
  const poemPath = `${poem.bookId}/${poem.sectionId}/${poem.id}`;
  const id = `${poemPath}/${verseId}`;
  const paraId = para.id == null ? "" : String(para.id);
  const names = poemNames({ poem, bookMeta, sectionMeta, poemMeta });

  return {
    objectID: id,
    id,
    type: "verse",
    typeRank: 0,
    bookId: poem.bookId,
    sectionId: poem.sectionId,
    poemId: poem.id,
    // Groups every verse of a poem so `distinct` can collapse them into one hit.
    poemPath,
    verseId,
    paraId,
    // Titles stay on poem records only so title queries surface poems, not every verse.
    bookName: names.bookName,
    bookNameRomanized: names.bookNameRomanized,
    bookNameEnglish: names.bookNameEnglish,
    sectionName: names.sectionName,
    sectionNameRomanized: names.sectionNameRomanized,
    sectionNameEnglish: names.sectionNameEnglish,
    poemName: "",
    poemNameRomanized: "",
    poemNameEnglish: "",
    poemLabel: names.poemName,
    // Kept uniform across record types so the shared customRanking stays neutral for verses.
    poemNameWords: 0,
    paraName: para.name ?? "",
    content,
    contentUrdu: text.get("Urdu") ?? "",
    contentEnglish: text.get("English") ?? "",
  };
}

function buildPoemRecord({ poem, bookMeta, sectionMeta, poemMeta }) {
  const names = poemNames({ poem, bookMeta, sectionMeta, poemMeta });
  const id = `${poem.bookId}/${poem.sectionId}/${poem.id}`;

  return {
    objectID: `poem:${id}`,
    id,
    type: "poem",
    typeRank: 1,
    bookId: poem.bookId,
    sectionId: poem.sectionId,
    poemId: poem.id,
    poemPath: id,
    verseId: "",
    paraId: "",
    ...names,
    poemLabel: names.poemName,
    // Shorter titles rank first, so an exact title beats a long title that merely contains the word.
    poemNameWords: wordCount(names.poemName),
    paraName: "",
    // Title-only: empty content so poem hits don't compete with verse text matches.
    content: "",
    contentUrdu: "",
    contentEnglish: "",
  };
}

function firstVerseWithContent(poem) {
  for (const para of asArray(poem.Para)) {
    for (const verse of asArray(para.Verse)) {
      const text = textByLanguage(verse);
      if (text.get("Original")) {
        return verse;
      }
    }
  }

  return null;
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

    if (firstVerseWithContent(poem)) {
      records.push(
        buildPoemRecord({
          poem,
          bookMeta,
          sectionMeta,
          poemMeta,
        }),
      );
    }

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
