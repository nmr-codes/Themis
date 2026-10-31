// Test Uzbek NLP & Morphology Tokenizer with Latin & Cyrillic

function normalizeUzbek(text) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BB\u02BC\`\´]/g, "'");
}

function extractUzbekTokens(text) {
  const normalized = normalizeUzbek(text);
  // Match tokens with internal apostrophes and hyphens for both Latin and Cyrillic
  const matches = normalized.match(/[a-z0-9\u0400-\u04FF]+(?:['\-][a-z0-9\u0400-\u04FF]+)*/gi);
  return matches || [];
}

const cyrillicInput = "Иш берувчим ойлик маош бермаяпти ва бўшатиш тўғрисида айтди. Алимент ундириш бўйича даъво аризаси.";
const cyrillicTokens = extractUzbekTokens(cyrillicInput);
console.log('Cyrillic tokens:', cyrillicTokens);

const set = new Set(cyrillicTokens);
console.log("Has 'иш':", set.has("иш"));
console.log("Has 'алимент':", set.has("алимент"));
console.log("Has 'ундириш':", set.has("ундириш"));
console.log("Has 'бўшатиш':", set.has("бўшатиш"));
