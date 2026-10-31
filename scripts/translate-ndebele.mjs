import fs from 'node:fs';
import path from 'node:path';

function loadApiKey() {
  let geminiKey = process.env.GEMINI_API_KEY;
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const geminiMatch = line.match(/^GEMINI_API_KEY=(.+)$/);
        if (geminiMatch && !geminiKey) {
          geminiKey = geminiMatch[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return geminiKey;
}

const NR_GLOSSARY = {
  Safehouse: 'Indawo Yokucashela',
  Police: 'Amapholisa',
  Precinct: 'Isitetjhi Samapholisa',
  Station: 'Isitetjhi',
  Docket: 'Idokhethi',
  Ledger: 'Incwadi Yezemali',
  Audit: 'Ukuhlolwa Kwamabhuku',
  Terminal: 'Itheminali',
  Harbour: 'Izibuko Lemikhumbi',
  Archive: 'Ugcimomlando',
  Basement: 'Ikamarwana Elingaphasi',
  Wound: 'Inxeba',
  Sweep: 'Ukutjhanela',
  Cartel: 'Isiqhema Sezelelesi',
  Syndicate: 'Ihlangano Yobulelesi',
  Hitman: 'Umbulali Okhokhelwako',
  Informant: 'Umtjheli Wendaba',
  Blackout: 'Ukucima Kwegezi',
  Cash: 'Ukhetjhi',
  Composure: 'Ukuzola',
  Cycle: 'Umjikelezo',
  Reckoning: 'Ukutjhejwa Kwemilandu',
  Whistleblower: 'Umdaluli Wemfihlo',
  Vigilante: 'Umlweli Welungelo',
  Clean: 'Kuhlanzekile',
  Failure: 'Kuhlulekile',
  Success: 'Kuphumelele',
};

async function callGemini(apiKey, keysChunk) {
  const models = ['gemini-3.5-flash-lite', 'gemini-2.5-flash'];

  const prompt = `You are an expert South African translator and dialect specialist.
Translate the following key-value pairs of a gritty South African crime noir RPG game into authentic Southern Ndebele (isiNdebele).

isiNdebele Dialect Guidelines:
1. Maintain authentic Southern Ndebele vocabulary and orthography:
   - Use standard isiNdebele terms (e.g. "amapholisa", "isitetjhi", "ukutjheja", "umsebenzi", "idokhethi", "ukutjhanela", "ukuzola", "ikhitjhi/ukhetjhi", "umlandu/imilandu").
   - Frequently uses relative suffix "-ko" (e.g. "ekhokhelwako", "okhethiweko", "edluleko", "ebuhlungu").
   - Uses typical "tj" / "tjh" phonology where appropriate (e.g. "ukutjho", "isitetjhi", "ukutjhebisana").
2. Tone: Gritty, tense, noir, crime thriller atmosphere reflecting South African investigative fiction.
3. Proper Nouns & Identifiers:
   - Keep specific names, places, brands, and codes authentic (e.g., eThekwini, Durban, Pier 2, Room 404, Berth 14, Docket #409, SAPS TRT, TRT, Queen Street, R300, Gulfstream ZS-900, Toyota Quantum, Bra Bheki, Highveld, Sandton, Namaqua, Long Street, Drakensberg).
4. Do NOT translate the JSON keys! Only translate the values. Return a JSON object with the EXACT SAME keys.
5. If a string has interpolation placeholders like {node}, {count}, {max}, {current}, KEEP THEM EXACTLY AS IS.
6. If a string contains HTML styling tags like <span class="...">...</span>, preserve the HTML tags and class names intact!
7. Output MUST be strictly valid JSON without markdown wrapping.

Input JSON:
${JSON.stringify(keysChunk, null, 2)}`;

  let lastErr = null;
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (res.status === 429 || res.status === 503) {
          await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
          continue;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`[${model}] HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error(`[${model}] Empty response`);
        const cleanText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        return JSON.parse(cleanText);
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw lastErr || new Error('Gemini API calls failed for all models');
}

function fallbackGlossary(englishText) {
  let text = englishText;
  for (const [enTerm, nrTerm] of Object.entries(NR_GLOSSARY)) {
    const regex = new RegExp(`\\b${enTerm}\\b`, 'gi');
    text = text.replace(regex, nrTerm);
  }
  return text;
}

async function run() {
  console.log('=== Mzansi Midnight: isiNdebele (nr) Translation Pipeline ===\n');

  const geminiKey = loadApiKey();
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY not found in .env.local or environment');
  }
  console.log('✓ Found GEMINI_API_KEY');

  const enPath = path.join(process.cwd(), 'data', 'i18n', 'en.json');
  const nrPath = path.join(process.cwd(), 'data', 'i18n', 'nr.json');

  if (!fs.existsSync(enPath)) {
    throw new Error(`Master English dictionary not found at ${enPath}`);
  }

  const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const totalKeys = Object.keys(enDict).length;
  console.log(`Loaded canonical en.json: ${totalKeys} keys.`);

  let nrDict = {};
  if (fs.existsSync(nrPath)) {
    try {
      nrDict = JSON.parse(fs.readFileSync(nrPath, 'utf8'));
      console.log(`Existing nr.json found with ${Object.keys(nrDict).length} keys.`);
    } catch {
      nrDict = {};
    }
  }

  // Identify missing keys
  const missingKeys = {};
  for (const [k, v] of Object.entries(enDict)) {
    if (!nrDict[k] || typeof nrDict[k] !== 'string' || nrDict[k].trim().length === 0) {
      missingKeys[k] = v;
    }
  }

  const missingEntries = Object.entries(missingKeys);
  const missingCount = missingEntries.length;
  console.log(`Missing keys to translate: ${missingCount} / ${totalKeys}`);

  if (missingCount === 0) {
    console.log('✓ nr.json is already 100% complete!');
    return;
  }

  // Chunk missing keys into batches of 35
  const CHUNK_SIZE = 35;
  const chunks = [];
  for (let i = 0; i < missingEntries.length; i += CHUNK_SIZE) {
    chunks.push(Object.fromEntries(missingEntries.slice(i, i + CHUNK_SIZE)));
  }

  console.log(`Prepared ${chunks.length} batches of up to ${CHUNK_SIZE} keys each.\n`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkKeys = Object.keys(chunk);
    process.stdout.write(`Batch ${i + 1}/${chunks.length} (${chunkKeys.length} keys)... `);

    try {
      const translated = await callGemini(geminiKey, chunk);
      for (const k of chunkKeys) {
        if (translated && typeof translated[k] === 'string' && translated[k].trim().length > 0) {
          nrDict[k] = translated[k];
        } else {
          nrDict[k] = fallbackGlossary(chunk[k]);
        }
      }
      fs.writeFileSync(nrPath, JSON.stringify(nrDict, null, 2), 'utf8');
      console.log(`✓ (${Object.keys(nrDict).length}/${totalKeys} total)`);
    } catch (err) {
      console.log(`✕ Failed: ${err.message}. Applying fallback.`);
      for (const k of chunkKeys) {
        nrDict[k] = fallbackGlossary(chunk[k]);
      }
      fs.writeFileSync(nrPath, JSON.stringify(nrDict, null, 2), 'utf8');
    }

    // Brief throttle
    await new Promise((r) => setTimeout(r, 600));
  }

  // Final verification
  const finalMissing = Object.keys(enDict).filter((k) => !nrDict[k]);
  console.log(`\n=== Translation Complete ===`);
  console.log(`Total keys in nr.json: ${Object.keys(nrDict).length} / ${totalKeys}`);
  console.log(`Missing keys: ${finalMissing.length}`);

  if (finalMissing.length === 0) {
    console.log('✓ 100% key parity achieved for isiNdebele (nr.json)!');
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
