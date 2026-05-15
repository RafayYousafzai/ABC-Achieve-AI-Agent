// scripts/compile-knowledge.js
const fs = require("fs");
const path = require("path");

const KNOWLEDGE_DIR = path.join(process.cwd(), "lib", "agent", "knowledge_v2");
const MANIFEST_PATH = path.join(KNOWLEDGE_DIR, "manifest.json");
const OUTPUT_PATH = path.join(
  process.cwd(),
  "lib",
  "agent",
  "compiled-knowledge.json",
);

try {
  // Read the manifest
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

  // Inject the raw markdown content directly into the manifest array
  const compiled = manifest.map((entry) => {
    const filePath = path.join(KNOWLEDGE_DIR, entry.file);
    const content = fs.readFileSync(filePath, "utf8");
    return { ...entry, content }; // Add content to the object
  });

  // Write the final bundled JSON file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(compiled, null, 2));
  console.log("✅ Knowledge base compiled successfully for Edge!");
} catch (error) {
  console.error("❌ Failed to compile knowledge base:", error);
  process.exit(1);
}
