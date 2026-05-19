import { readFile } from "node:fs/promises";
import path from "node:path";

import { algoliasearch } from "algoliasearch";

const rootDir = process.cwd();
const indexPath = path.join(rootDir, "src/assets/algolia/verses.json");

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

await client.replaceAllObjects({
  indexName,
  objects,
  batchSize: 1000,
});

console.log(`Uploaded ${objects.length} records to Algolia index "${indexName}"`);
