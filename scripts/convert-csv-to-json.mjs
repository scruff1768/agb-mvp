// Converts /data/agb_cards_adjusted.csv → /public/amica_cards.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const csvPath = join(projectRoot, "data", "agb_cards_adjusted.csv");
const outPath = join(projectRoot, "public", "amica_cards.json");

const csvText = readFileSync(csvPath, "utf8");
const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

const NUMERIC = new Set([
  "hp","prana","focus","stamina","strength","intelligence","defense","speed","power"
]);

const cards = rows.map(r => {
  const obj = { ...r };
  for (const k of Object.keys(obj)) {
    if (NUMERIC.has(k)) obj[k] = Number(obj[k]);
  }
  return obj;
});

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(cards, null, 2), "utf8");
console.log(`✅ Wrote ${cards.length} cards → ${outPath}`);
