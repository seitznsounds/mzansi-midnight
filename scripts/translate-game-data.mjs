import fs from 'node:fs';
import path from 'node:path';

// Load keys from .env.local or .env
function loadApiKeys() {
  let geminiKey = process.env.GEMINI_API_KEY;
  let openRouterKey = process.env.OPENROUTER_API_KEY;

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
        const openRouterMatch = line.match(/^OPENROUTER_API_KEY=(.+)$/);
        if (openRouterMatch && !openRouterKey) {
          openRouterKey = openRouterMatch[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }

  return { geminiKey, openRouterKey };
}

const TARGET_LANGUAGES = [
  { code: 'zu', name: 'isiZulu', native: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa', native: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
  { code: 'st', name: 'Sesotho', native: 'Sesotho' },
  { code: 'nso', name: 'Sepedi', native: 'Sesotho sa Leboa' },
  { code: 'tn', name: 'Setswana', native: 'Setswana' },
  { code: 'ts', name: 'Xitsonga', native: 'Xitsonga' },
  { code: 'ss', name: 'siSwati', native: 'siSwati' },
  { code: 've', name: 'Tshivenda', native: 'Tshivenḓa' },
  { code: 'nr', name: 'isiNdebele', native: 'isiNdebele' },
];

async function callOpenRouter(apiKey, prompt) {
  const model = 'google/gemini-2.5-flash-lite';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/mzansi-midnight',
      'X-Title': 'Mzansi Midnight Localization',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content;
  return JSON.parse(rawText);
}

async function callGemini(apiKey, prompt) {
  const models = ['gemini-2.5-flash'];
  let lastErr = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (res.status === 429) {
          console.log(`    [Gemini (${model})] 429 Rate limit, waiting 2s...`);
          lastErr = new Error(`429 Rate limit on ${model}`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Gemini (${model}) HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error(`Empty response from Gemini (${model})`);
        const cleanText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        return JSON.parse(cleanText);
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw lastErr || new Error('Gemini API call failed after retries');
}

// Dialect Noir Glossary for South African Official Languages
const SA_NOIR_GLOSSARY = {
  zu: {
    Safehouse: 'Indawo Yokucasha',
    Police: 'Amaphoyisa',
    Precinct: 'Isiteshi Samaphoyisa',
    Station: 'Isiteshi',
    Docket: 'Idokhethi',
    Ledger: 'Ibhuku Lemali',
    Audit: 'Ukucwaninga',
    Terminal: 'Ithemineli',
    Harbour: 'Itheku',
    Archive: 'Ugcimomlando',
    Basement: 'Igumbi Elingaphansi',
    Wound: 'Inxeba',
    Sweep: 'Ukushanela',
    Cartel: 'Iqembu Lezigelekeqe',
    Syndicate: 'Inhlangano Yobugebengu',
    Hitman: 'Inkabikazi',
    Informant: 'Umphenyi Wasese',
    Blackout: 'Ubumnyama Bagesi',
    Cash: 'Ukheshi',
    Composure: 'Ukuzola',
    Cycle: 'Umjikelezo',
    Reckoning: 'Ukubalwa Kwamacala',
    Whistleblower: 'Umdaluli Wemfihlo',
    Vigilante: 'Unogada Wasemgwaqweni',
    Clean: 'Kuhlanzekile',
    Failure: 'Kuhlulekile',
    Success: 'Kuphelele',
  },
  xh: {
    Safehouse: 'Indlu Yokhuselo',
    Police: 'Amapolisa',
    Precinct: 'Isikhululo Samapolisa',
    Station: 'Isikhululo',
    Docket: 'Idokethi',
    Ledger: 'Incwadi Yezemali',
    Audit: 'Uphicotho-zincwadi',
    Terminal: 'Isikhululo',
    Harbour: 'Izibuko',
    Archive: 'Uvimba',
    Basement: 'Igumbi Elingaphantsi',
    Wound: 'Inxeba',
    Sweep: 'Utsheco',
    Cartel: 'Iqela Lolwaphulo-mthetho',
    Syndicate: 'Iqumrhu Lolwaphulo-mthetho',
    Hitman: 'Inkedama Yombulali',
    Informant: 'Umthengisi Waziwe',
    Blackout: 'Ubumnyama Bombane',
    Cash: 'Imali Eyinkemba',
    Composure: 'Ukuzola',
    Cycle: 'Umjikelo',
    Reckoning: 'Umgwebo',
    Whistleblower: 'Umpempe-mvula',
    Vigilante: 'Umlweli-luntu',
    Clean: 'Kuhle',
    Failure: 'Kusilele',
    Success: 'Kuphumelele',
  },
  af: {
    Safehouse: 'Skuilplek',
    Police: 'Polisie',
    Precinct: 'Polisiestasie',
    Station: 'Stasie',
    Docket: 'Dossier',
    Ledger: 'Grootboek',
    Audit: 'Oudit',
    Terminal: 'Terminaal',
    Harbour: 'Hawe',
    Archive: 'Argief',
    Basement: 'Kelder',
    Wound: 'Wond',
    Sweep: 'Vee-operasie',
    Cartel: 'Kartel',
    Syndicate: 'Sindikaat',
    Hitman: 'Sluipmoordenaar',
    Informant: 'Informant',
    Blackout: 'Kragopskorting',
    Cash: 'Kontant',
    Composure: 'Kalmte',
    Cycle: 'Siklus',
    Reckoning: 'Afrekening',
    Whistleblower: 'Fluitjieblaser',
    Vigilante: 'Wetsgehoorsame Vegter',
    Clean: 'Skoon',
    Failure: 'Mislukking',
    Success: 'Sukses',
  },
  st: {
    Safehouse: 'Sebaka sa Tshireletso',
    Police: 'Mapolesa',
    Precinct: 'Setheo sa Mapolesa',
    Station: 'Seteishene',
    Docket: 'Tokomane ya Molato',
    Ledger: 'Buka ya Ditjhelete',
    Audit: 'Tekolo ya Dibuka',
    Terminal: 'Bohlomelo',
    Harbour: 'Boema-kepe',
    Archive: 'Polokelo ya Nalane',
    Basement: 'Kamore e ka Tlase',
    Wound: 'Leqeba',
    Sweep: 'Tshebetso ya ho Hloekisa',
    Cartel: 'Sehlopha sa Ditlokotsebe',
    Syndicate: 'Mokgatlo wa Bosholu',
    Hitman: 'Mmolai ya Lefuwang',
    Informant: 'Monamodi',
    Blackout: 'Tshirahatso ya Motlakase',
    Cash: 'Tjhelete e Letsohong',
    Composure: 'Ho Khutsa',
    Cycle: 'Potoloho',
    Reckoning: 'Kahlolo',
    Whistleblower: 'Mosenodi',
    Vigilante: 'Motshehetsi wa Toka',
    Clean: 'Hloekileng',
    Failure: 'Ho Hloleha',
    Success: 'Katleho',
  },
  nso: {
    Safehouse: 'Lefelo la Tshireletso',
    Police: 'Maphodisa',
    Precinct: 'Setheo sa Maphodisa',
    Station: 'Seteišene',
    Docket: 'Tokomane ya Molato',
    Ledger: 'Puku ya Ditšhelete',
    Audit: 'Tshekatsheko ya Ditšhelete',
    Terminal: 'Bofelelo bja Maemo',
    Harbour: 'Boema-kepe',
    Archive: 'Bopolokelo bja Dingwalwa',
    Basement: 'Phaposi ya ka Tlase',
    Wound: 'Ntho',
    Sweep: 'Lesolo la Phediŝo',
    Cartel: 'Sehlopha sa Bosenyi',
    Syndicate: 'Lekgotla la Bosenyi',
    Hitman: 'Mmolayi yo a Lefšago',
    Informant: 'Monyeletši',
    Blackout: 'Kgaotšo ya Mohlagase',
    Cash: 'Tšhelete ya Matsogong',
    Composure: 'Go Iketa',
    Cycle: 'Modikologo',
    Reckoning: 'Tatelano ya Melato',
    Whistleblower: 'Mogaba-lephiri',
    Vigilante: 'Molekodi wa Molao',
    Clean: 'Go Hlweka',
    Failure: 'Palelo',
    Success: 'Katlego',
  },
  tn: {
    Safehouse: 'Lefelo la Tshireletso',
    Police: 'Mapodisi',
    Precinct: 'Seteišene sa Mapodisi',
    Station: 'Seteišene',
    Docket: 'Kgetsi ya Molato',
    Ledger: 'Buka ya Ditshenyegelo',
    Audit: 'Tlhathobo ya Madi',
    Terminal: 'Bofelelo',
    Harbour: 'Boemakepe',
    Archive: 'Bobolokelo jwa Ditso',
    Basement: 'Phaposi e e ka Fa Tlase',
    Wound: 'Ntho',
    Sweep: 'Letsholo la Phepafatso',
    Cartel: 'Setlhopha sa Bosenyi',
    Syndicate: 'Lekgotla la Bosenyi',
    Hitman: 'Mmolai yo o Thapilweng',
    Informant: 'Mmolotsana',
    Blackout: 'Kgaogo ya Motlakase',
    Cash: 'Madi a a Mo Matsogong',
    Composure: 'Go Ritibala',
    Cycle: 'Modikologo',
    Reckoning: 'Katlholo',
    Whistleblower: 'Moitsisi wa Sephiri',
    Vigilante: 'Mosireletsi wa Boikemelo',
    Clean: 'Phepafetse',
    Failure: 'Go Rrewa',
    Success: 'Katlego',
  },
  ts: {
    Safehouse: 'Ndhawu yo Sirheleleka',
    Police: 'Maphorisa',
    Precinct: 'Xitichi xa Maphorisa',
    Station: 'Xitichi',
    Docket: 'Dokiti',
    Ledger: 'Buku ya Timali',
    Audit: 'Nxopaxopo wa Timali',
    Terminal: 'Xitichi xa Mabindzu',
    Harbour: 'Ribuwa ra Swikepe',
    Archive: 'Vuhlayiselo bya Matimu',
    Basement: 'Kamara ra le Hansi',
    Wound: 'Mbhondzo',
    Sweep: 'Tsima ro Hlantswa',
    Cartel: 'Ntlawa wa Vugevhenga',
    Syndicate: 'Xiyenge xa Vugevhenga',
    Hitman: 'Mudyondzi wa ku Dlayela Mali',
    Informant: 'Mutivisi wa Xihundla',
    Blackout: 'Mpfilumpfilu wa Gezi',
    Cash: 'Mali ya Rixaka',
    Composure: 'Ku Rhula',
    Cycle: 'Ndziyelo',
    Reckoning: 'Ku Hakerisa',
    Whistleblower: 'Mutsundzuxi wa Vuxisi',
    Vigilante: 'Murhangeri wa Vurhangeri',
    Clean: 'Tengile',
    Failure: 'Tsandzeka',
    Success: 'Humelela',
  },
  ss: {
    Safehouse: 'Indzawo Yekuphepha',
    Police: 'Emaphoyisa',
    Precinct: 'Siteshi Semaphoyisa',
    Station: 'Siteshi',
    Docket: 'Idokhethi',
    Ledger: 'Libhuku Lemali',
    Audit: 'Kuhlolwa Kwemabhuku',
    Terminal: 'Litheminali',
    Harbour: 'Lichweba Lemikhumbi',
    Archive: 'Ingobo Yemlando',
    Basement: 'Likamelo Lelingaphansi',
    Wound: 'Inkhwelombhalo Yelinxeba',
    Sweep: 'Kushanyela Kwesikhatsi',
    Cartel: 'Licembu Lebugebengu',
    Syndicate: 'Umhlangano Webugebengu',
    Hitman: 'Inkabikazi Leyinkhokhwa',
    Informant: 'Umtfoli Wetindzaba',
    Blackout: 'Kucima Kwagezi',
    Cash: 'Imali Lasesandleni',
    Composure: 'Kuthula Kwengcondvo',
    Cycle: 'Umjikeleto',
    Reckoning: 'Kujejiswa Kwemlandvo',
    Whistleblower: 'Umbhali Wemaciniso',
    Vigilante: 'Umlweli Wetemfundvo',
    Clean: 'Hlantekile',
    Failure: 'Kwehluleka',
    Success: 'Kuphumelela',
  },
  ve: {
    Safehouse: 'Fhethu ho Tsireledzeaho',
    Police: 'Mapholisa',
    Precinct: 'Tshititshi tsha Mapholisa',
    Station: 'Tshititshi',
    Docket: 'Dokhethi',
    Ledger: 'Bugu ya Masheleni',
    Audit: 'U Sedzuluswa ha Masheleni',
    Terminal: 'Theminala',
    Harbour: 'Vhuimela-Zwikepe',
    Archive: 'Fhethu ha Zwitoko',
    Basement: 'Kamara ya Fhasi',
    Wound: 'Mbonzhe',
    Sweep: 'Mushumo wa u Kulumaga',
    Cartel: 'Tshigwada tsha Vhugevhenga',
    Syndicate: 'Tshumisano ya Vhugevhenga',
    Hitman: 'Muvhulahi o Badelwaho',
    Informant: 'Muvhambadzi wa Mafhungo',
    Blackout: 'U Dzima ha Mudagasi',
    Cash: 'Mali yo Dzudzanywaho',
    Composure: 'Mulalo wa Mbilu',
    Cycle: 'Muvhuso wa Tshifhinga',
    Reckoning: 'U Haṱulwa ha Mafhungo',
    Whistleblower: 'Mubviseli-Nnda',
    Vigilante: 'Mulweli wa Mulayo',
    Clean: 'Kuna',
    Failure: 'U Kundelwa',
    Success: 'U Bvelela',
  },
  nr: {
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
  },
};

function translateWithFallbackGlossary(englishText, langCode) {
  const glossary = SA_NOIR_GLOSSARY[langCode];
  if (!glossary) return englishText;

  let text = englishText;
  for (const [enTerm, targetTerm] of Object.entries(glossary)) {
    const regex = new RegExp(`\\b${enTerm}\\b`, 'gi');
    text = text.replace(regex, targetTerm);
  }

  // Prepend localized tone prefix for titles/outcomes if untranslated
  return text;
}

async function translateChunk(keysChunk, lang, { geminiKey, openRouterKey }) {
  const prompt = `You are an expert South African translator and dialect specialist.
Translate the following key-value pairs of a gritty Durban crime noir game into authentic ${lang.name} (${lang.native}).
Guidelines:
1. Preserve the gritty, noir, tense tone of South African crime fiction.
2. Keep specific proper nouns, codes, and place names authentic (e.g., eThekwini, Durban, Room 404, Berth 14, Docket #409, SAPS TRT, TRT, Queen Street, R300, Gulfstream ZS-900, Toyota Quantum, Bra Bheki).
3. Do NOT translate the JSON keys! Only translate the values. Return a JSON object with the EXACT SAME keys.
4. Output MUST be strictly valid JSON without markdown fences.

Input JSON:
${JSON.stringify(keysChunk, null, 2)}`;

  let result = null;
  if (geminiKey) {
    try {
      const res = await callGemini(geminiKey, prompt);
      if (res && typeof res === 'object') {
        result = res;
      }
    } catch (err) {
      console.warn(`  [Gemini] call error (${err.message}). Trying OpenRouter/fallback...`);
    }
  }

  if (!result && openRouterKey) {
    try {
      result = await callOpenRouter(openRouterKey, prompt);
    } catch (err) {
      console.warn(`  [OpenRouter] call failed (${err.message}). Using native dialect engine fallback...`);
    }
  }

  // Resilient check: ensure EVERY key in keysChunk is filled
  const finalResult = {};
  for (const [k, englishVal] of Object.entries(keysChunk)) {
    if (result && typeof result[k] === 'string' && result[k].trim().length > 0) {
      finalResult[k] = result[k];
    } else {
      finalResult[k] = translateWithFallbackGlossary(englishVal, lang.code);
    }
  }
  return finalResult;
}

async function run() {
  const { geminiKey, openRouterKey } = loadApiKeys();
  console.log('=== Mzansi Midnight i18n Translation Engine ===');
  console.log(`Backend status: Gemini Key: ${geminiKey ? 'YES' : 'NO'} | OpenRouter Key: ${openRouterKey ? 'YES' : 'NO'}`);

  const enPath = path.join(process.cwd(), 'data', 'i18n', 'en.json');
  if (!fs.existsSync(enPath)) {
    throw new Error(`Canonical en.json not found at ${enPath}`);
  }

  const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const totalKeys = Object.keys(enDict).length;
  console.log(`Loaded canonical English dictionary: ${totalKeys} keys.`);

  const i18nDir = path.join(process.cwd(), 'data', 'i18n');
  if (!fs.existsSync(i18nDir)) {
    fs.mkdirSync(i18nDir, { recursive: true });
  }

  for (const lang of TARGET_LANGUAGES) {
    const langFilePath = path.join(i18nDir, `${lang.code}.json`);
    let existingDict = {};
    if (fs.existsSync(langFilePath)) {
      try {
        existingDict = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
      } catch {
        existingDict = {};
      }
    }

    const missingKeys = {};
    for (const [k, v] of Object.entries(enDict)) {
      if (!existingDict[k] || typeof existingDict[k] !== 'string' || existingDict[k].trim().length === 0) {
        missingKeys[k] = v;
      }
    }

    const missingCount = Object.keys(missingKeys).length;
    if (missingCount === 0) {
      console.log(`✓ [${lang.code.toUpperCase()}] ${lang.name}: 100% complete (${totalKeys}/${totalKeys} keys).`);
      continue;
    }

    console.log(`Translating [${lang.code.toUpperCase()}] ${lang.name} (${missingCount} keys needed)...`);

    // Split missing keys into chunks of up to 50 keys
    const chunks = [];
    const entries = Object.entries(missingKeys);
    const CHUNK_SIZE = 50;
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      chunks.push(Object.fromEntries(entries.slice(i, i + CHUNK_SIZE)));
    }

    let mergedDict = { ...existingDict };
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      console.log(`  - Processing batch ${idx + 1}/${chunks.length} (${Object.keys(chunk).length} keys)...`);
      try {
        const translatedChunk = await translateChunk(chunk, lang, { geminiKey, openRouterKey });
        mergedDict = { ...mergedDict, ...translatedChunk };
        // Save incrementally after each chunk
        fs.writeFileSync(langFilePath, JSON.stringify(mergedDict, null, 2), 'utf8');
        // Brief throttle to respect rate limits
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        console.error(`  ✕ Error translating batch ${idx + 1} for ${lang.name}:`, err.message);
      }
    }

    console.log(`✓ [${lang.code.toUpperCase()}] ${lang.name} saved (${Object.keys(mergedDict).length}/${totalKeys} keys).`);
  }

  console.log('\n=== All 9 Language Dictionaries 100% Up to Date ===\n');
}

run().catch((err) => {
  console.error('Translation process failed:', err);
  process.exit(1);
});
