import { writeFile, readdir, Glob } from "bun";
import { join } from "path";
import FlexSearch, {Document} from "flexsearch";

// Function to flatten a single document
function flattenDocument(jsonDocument) {
  return {
    id: jsonDocument.id,
    name: jsonDocument.name,
    bookName: jsonDocument.bookName,
    sectionName: jsonDocument.sectionName,
    texts: jsonDocument.Para.flatMap(para =>
      para.Verse.flatMap(verse =>
        verse.Text.filter(text => text._content).map(text => text._content)
      )
    ).join("\n") // Combine all text into one searchable field
  };
}

// Function to process all JSON files in a directory and create a FlexSearch index
async function createIndexFromDir(dirPath, outputPath) {
  // Create a new FlexSearch Document index
  const index = new Document({
    document: {
      id: "id",
      index: ["name", "bookName", "sectionName", "texts"],
      store: ["id", "name", "bookName", "sectionName", "texts"]
    }
  });

  // Read all files in the directory
  const files = await readdir(dirPath);
  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = join(dirPath, file);
      const jsonDocument = JSON.parse(await Bun.file(filePath).text());
      const flattenedDoc = flattenDocument(jsonDocument);
      index.add(flattenedDoc);
    }
  }

  // Export the index to a file
  const serializedIndex = JSON.stringify(index.export());
  await writeFile(outputPath, serializedIndex);

  console.log(`Index created and saved to ${outputPath}`);
}


const glob = new Glob("**/*.ts");

// Usage Example
const inputDir = "./json-files"; // Directory containing JSON files
const outputFile = "./search-index.json"; // Output file for the index

createIndexFromDir(inputDir, outputFile).catch(console.error);
