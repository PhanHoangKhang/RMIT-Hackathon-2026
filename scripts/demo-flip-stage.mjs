// Bonus demo: flip the stage to "reveal" by editing the database directly - no quorum, no Tide.
// The UI will say "reveal", yet every decryption is still refused: the ORKs check the caller's
// roles (_tide_decryptor on selection-panel), not this file.
//   npm run demo:flip-stage            -> stage = reveal (forged)
//   npm run demo:flip-stage -- --undo  -> back to blind
import { readFileSync, writeFileSync, existsSync } from "fs";

const file = new URL("../data/db.json", import.meta.url);
if (!existsSync(file)) {
  console.error("data/db.json does not exist yet - submit a portfolio first.");
  process.exit(1);
}
const db = JSON.parse(readFileSync(file, "utf-8"));
const undo = process.argv.includes("--undo");
if (undo) {
  Object.assign(db.cycle, { stage: "blind", revealedAt: null, revealedBy: null });
} else {
  Object.assign(db.cycle, { stage: "reveal", revealedAt: new Date().toISOString(), revealedBy: "direct DB edit (no quorum)" });
}
writeFileSync(file, JSON.stringify(db, null, 2));
console.log(`cycle.stage = ${db.cycle.stage}${undo ? "" : "  <- forged in data/db.json. Now try 'Reveal identity' as anyone."}`);
