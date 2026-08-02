import { readFile } from "node:fs/promises";
import path from "node:path";

import { algoliasearch } from "algoliasearch";

const rootDir = process.cwd();
const indexPath = path.join(rootDir, "src/assets/algolia/verses.json");
const synonymsPath = path.join(rootDir, "scripts/algolia-synonyms.json");

const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME ?? "verses";

if (!appId) {
  throw new Error("Missing ALGOLIA_APP_ID");
}

if (!apiKey) {
  throw new Error("Missing ALGOLIA_ADMIN_API_KEY");
}

const objects = JSON.parse(await readFile(indexPath, "utf8"));

if (!Array.isArray(objects) || objects.length === 0) {
  throw new Error(`No records found in ${path.relative(rootDir, indexPath)}`);
}

const missingObjectID = objects.find((object) => !object.objectID);

if (missingObjectID) {
  throw new Error(`Found a record without objectID: ${JSON.stringify(missingObjectID)}`);
}

const client = algoliasearch(appId, apiKey);

await client.setSettings({
  indexName,
  indexSettings: {
    searchableAttributes: [
      "unordered(poemName)",
      "unordered(poemNameRomanized)",
      "unordered(poemNameEnglish)",
      "unordered(sectionName)",
      "unordered(sectionNameRomanized)",
      "unordered(sectionNameEnglish)",
      "unordered(bookName)",
      "unordered(bookNameRomanized)",
      "unordered(bookNameEnglish)",
      "unordered(paraName)",
      "content",
      "contentUrdu",
      "contentEnglish",
    ],
    attributesForFaceting: ["filterOnly(type)"],
    customRanking: ["desc(typeRank)", "asc(poemNameWords)"],
    attributesToHighlight: [
      "poemName",
      "poemNameRomanized",
      "poemNameEnglish",
      "sectionName",
      "bookName",
      "content",
    ],
    attributesToSnippet: ["contentUrdu:30", "contentEnglish:30"],
    snippetEllipsisText: "…",
    // Verse queries collapse to one hit per poem so a repeated line cannot bury other poems.
    attributeForDistinct: "poemPath",
    // A half-remembered misra still returns something instead of nothing.
    removeWordsIfNoResults: "lastWords",
  },
});

await client.replaceAllObjects({
  indexName,
  objects,
  batchSize: 1000,
});

const synonyms = JSON.parse(await readFile(synonymsPath, "utf8"));

await client.saveSynonyms({
  indexName,
  synonymHit: synonyms,
  replaceExistingSynonyms: true,
});

console.log(`Uploaded ${objects.length} records and ${synonyms.length} synonyms to Algolia index "${indexName}"`);
