# Mzansi Midnight (`eThekwini-Gold`) — Project Context & Architecture

## Overview
**Mzansi Midnight** is an episodic, connected **5-part Dice-and-Node Noir RPG anthology** inspired by *Citizen Sleeper* and *Disco Elysium*, mapping the systemic anatomy of South African state capture, resource cartels, and political conspiracy across five regional crucibles:
1. **Story 1: eThekwini-Gold** (*The Coastal Gateway* — Durban Port & Precursor Convoys, Docket #409) [LIVE]
2. **Story 2: Highveld-Chrome** (*The Capital Syndicate* — Joburg Grid Sabotage & Gold Reefs, Case File #711-GP) [LIVE]
3. **Story 3: Namaqua-Diamond** (*The Desert Skeleton Coast* — Richtersveld Dredging & Arms Corridors) [LIVE]
4. **Story 4: Cape-Nocturne** (*The Shadow Oligarchy* — Table Mountain Nightlife & Gang Federations) [LIVE]
5. **Story 5: The Sovereign Octagon** (*The Grand National Finale* — Drakensberg Bunker & Union Buildings) [LIVE]

Each story is locked until the player unlocks the preceding story by achieving a viable campaign ending and securing the chapter's **Keystone Dossier**. Complete story bible and progression specifications are detailed in [`STORIES.md`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/STORIES.md).

In **Story 1: eThekwini-Gold**, players take on the role of a suspended Hawks (DPCI) Warrant Officer surviving out of a generator-powered flat in the Mercury Arcade who is thrust into a conspiracy involving **Docket #409**—a R400 million municipal water-tanker tender secretly used to transport liquid chemical precursors from Pier 2 for methamphetamine super-labs.

---

## Core Gameplay Pillars

1. **Daily Action Dice & Composure**:
   - At the start of each Cycle (Day), the player rolls 3 to 5 six-sided dice (`d6`) based on their **Composure** (`80–100%` = 5 dice, `40–79%` = 4 dice, `<40%` = 3 dice).
   - **Dragging or clicking** a die onto a Map Node's **Action Slot** resolves deterministically using:
     $$\text{Final Roll} = \text{Die Value} + \text{Stat Modifier} + \text{Stage 6 Blackout Modifier} + \text{Hostile Turf Penalty}$$
   - **Outcome Tiers** (with full 3-tier mechanical preview on every slot card):
     - `6+`: **Clean Success** (+2 clock progress, high rewards, zero trace)
     - `4–5`: **Compromised Success** (+1 clock progress, minor Composure or Heat cost)
     - `1–3`: **Failure / Blowback** (Composure loss, Precinct Heat, or threat clock advancement)

2. **Four Investigator Stats (`-1` to `+3+`) & Black-Market Gear**:
   - `street`: Force, intimidation, taxi rank politics, surviving ambushes, covert physical recon.
   - `dockets`: Forensic accounting, municipal registry audits, court clerks, certified evidence.
   - `wire`: Signals intelligence, bypassing biometric locks, cloning SAPS radio transponders.
   - `influence`: Inside game, bribing precinct clerks, tapping driver networks, political blackmail.
   - **Field Hardware Upgrades**: Players can spend Rands (`R900–R1,300`, no die required) at Golden Dragon Cyber-Pawn (`n5`), Queen Street Taxi Rank (`n2`), or The Ridge Penthouses (`n8`) to permanently boost stats and Composure.

3. **Two-Act Campaign & Segmented Clocks (`action`, `threat`, `world`)**:
   - **Act 1 — *The Ghost Docket* (7 CBD & Harbour Nodes, `n1`–`n7`)**:
     - **Threat Clocks**: *Brigadier Mokoena's Sweep* (`0/6`, `+1 / Cycle`), *Nandi's Gunshot Wound* (`0/4`, `+1 / Cycle`), *Precinct Heat* (`0/6`, `On Heat`).
     - **Investigation Clocks**: *Audit Docket #409* (`0/4`), *Crack Auditor's Handset* (`0/4`).
     - **World Finale Clock**: *Berth 14 Precursor Convoy* (`0/4`, `+1 / Cycle` toward `evt_climax_berth14` and 4 Act 1 endings).
   - **Act 2 — *The Commission of Inquiry* (5 Upper Ridge, Midlands & Tarmac Nodes, `n8`–`n12`)**:
     - Carries over Stats, Cash, Faction Standing, and Black-Market Gear from any surviving Act 1 ending (`ending_vigilante`, `ending_whistleblower`, `ending_kingpin`), plus a path-specific Legacy Dossier Item (`+1 STREET`, `+1 DOCKETS`, or `+R1,500`).
     - **Threat Clocks**: *Izinkabi Hit Squad* (`0/6`, `+1 / Cycle`), *Contempt & Security Warrant* (`0/6`, `On Heat`).
     - **Investigation Clocks**: *Trace Sovereign Pearl Trust* (`0/4`), *Synthesize Super-Lab Telemetry* (`0/4`).
     - **World Finale Clock**: *Flight ZS-900 Charter Departure* (`0/4`, `+1 / Cycle` toward `evt_act2_climax_tarmac` at King Shaka Hangar 7 and 4 Act 2 Grand Finale endings).

4. **Rolling Blackouts (Load Shedding Grid) & Generator Override**:
   - Rotates across Stages `2 -> 4 -> 6 -> 2` each cycle.
   - **Stage 6 Lockouts**: Disables server-reliant slots (`disabledDuringStage6: true`) at City Hall Annex, Golden Dragon Cyber-Pawn, The Ridge Penthouses, and High Court Chambers unless the player spends `R300` on **Backup Generator Diesel** (`generatorActiveToday`) or triggers the City Hall **Grid Manipulation** perk.
   - **Stage 6 Cover Bonus**: Grants `+2` roll modifiers (`stage6BonusModifier: 2`) to covert infiltration actions at Pier 2 Cold Storage (`n6`), Hydroponic Citrus Estate (`n11`), and King Shaka Cargo Apron (`n12`).

5. **SAPS Roadblocks, Hostile Turf & Faction Standing Perks**:
   - **Roadblock Intercepts**: When Heat/Contempt $\ge 4$ or Sweep/Hit Squad $\ge 5$, primary transit corridors lock down. Travelling across a blocked corridor requires paying a `R200` "cold drink" bribe or burning `1 Unused Die` to detour—unless the player holds the cloned `saps_radio_scanner` or has `street_syndicate` Rep $\ge 2$.
   - **Hostile Turf Retaliation**: Operating on a node owned by a faction with `Rep <= -2` imposes a `-1 Hostile Turf Roll Penalty`.
   - **1/Day Tactical Faction Perks** (`usedPerksToday`):
     - `perk_grid_manipulation` (*City Hall Rep $\ge 1$*): Toggle Load Shedding between Stage 2 and Stage 6 on demand.
     - `perk_bluelight_escort` (*SAPS TRT Rep $\ge 1$*): Scrub vehicle plates (`-2 Heat/Contempt`, `-1 Sweep/Hit Squad`).
     - `perk_izinkabi_muscle` (*Street Syndicate Rep $\ge 2$, costs R600*): Upgrade lowest unused die to a `6`.
     - `perk_hawks_safechannel` (*Hawks Rep $\ge 2$*): Counter-surveillance briefing (`+15% Composure`, `-1 Sweep/Hit Squad`).

---

## The Interlocking Factions

| Faction ID | Name & Leader | Turf / Base | Role in the Ecosystem |
| :--- | :--- | :--- | :--- |
| `abasanta` | **Abasanta Logistics** (Zuko "The Architect" Ndlovu) | Pier 2 Cold Storage & The Glass House | Port smuggling conglomerate importing chemical precursors and laundering cash through municipal tenders. |
| `city_hall` | **Metro Renewal Coalition** (Councillor "Ma-Sibi" Khumalo) | City Hall Annex (4th Floor) | Tender mafia weaponizing service delivery and emergency water-tanker contracts. |
| `saps_trt` | **SAPS Organized Crime & TRT** (Brigadier Titus Mokoena) | Central Precinct (13th Floor) | Rogue police unit acting as cartel convoy escorts and burying forensic dockets. |
| `street_syndicate` | **The Queen Street Alliance** (Bheki "Bra Bheki" Sithole) | Queen St. Taxi Rank & Shisanyama | Minibus taxi bosses, route marshals, and *izinkabi* hitmen controlling the street grid. |
| `hawks` | **DPCI Hawks Holdouts** (Col. Piet van der Merwe) | The Old Archive Sub-Basement | Clean investigators working off paper files beneath the magistrate's court. |

---

## Codebase Architecture

- **`STORIES.md`**: Master narrative bible and campaign progression architecture for the 5-story Mzansi Midnight Quintet (*eThekwini-Gold*, *Highveld-Chrome*, *Namaqua-Diamond*, *Cape-Nocturne*, and *The Sovereign Octagon*).
- **`docs/`**
  - `docs/STORY_TRANSLATION_BLUEPRINT.md`: Comprehensive master architectural blueprint and developer specification for localizing game stories across all 11 South African official languages, documenting dictionary schemas, component hooks, reverse mapping mechanics, and guidelines for authoring future modular narrative campaigns.
- **`types/`**
  - `types/game.ts`: Core types (`GameState`, `MapNode`, `ActionSlot`, `Clock`, `Die`, `StatType`, `FactionId`, `FactionPerkId`, `LoadSheddingStage`, `EndingId`).
  - `types/events.ts`: `NarrativeEvent` and `EventChoice` interfaces (with `requiredCash`, `requiredItem`, `requiredAnyItem`, `requiredStat`, `requiredFactionRep`, `triggerEndingId`).
  - `types/prologue.ts`: `CharacterBackground`, `DialogueOption`, and `PrologueSceneNode`.
  - `types/settings.ts`: `SaveSlotId` (`'autosave' | 'slot_1' | 'slot_2' | 'slot_3'`), `SaveSlotRecord`, and `GameSettings` (including `LanguageCode` across all 11 official South African languages, `diceDisplayMode`, and procedural soundscape volume levels).
- **`data/`**
  - `data/initialState.ts`: Seed state for Act 1, including all 6 clocks (`mokoena_sweep`, `nandi_condition`, `precinct_heat`, `audit_docket_409`, `crack_auditor_phone`, `berth_14_countdown`) and all 7 CBD/Waterfront nodes with SVG coordinates and action slots.
  - `data/act2State.ts`: Act 2 campaign state (`ACT_2_CLOCKS`, `ACT_2_NODES` `n8_ridge_penthouses`–`n12_cargo_apron`, and `transitionToAct2()` state carryover from Act 1).
  - `data/prologueScript.ts`: 3 playable Hawks archetypes (`forensic_hawk`, `trt_breacher`, `crime_intel`) and the 4-beat interactive 2:00 AM prologue script.
  - `data/eventDeck.ts`: Triggered crisis events (including `evt_composure_breakdown`), investigation breakthroughs, Morning Encrypted Wire briefings, the Act 1 Climax showdown (`evt_climax_berth14`), and the Act 2 Event Deck & Hangar 7 Grand Finale (`evt_act2_climax_tarmac`).
  - `data/itemsCatalog.ts`: Structured forensic dossier excerpts, Act 1 -> Act 2 legacy items, and stat-boosting Black-Market Gear definitions (`ITEMS_CATALOG`).
  - `data/contactDialogues.ts`: Branching *Disco Elysium*-style NPC dialogue & interrogation trees across all 12 Act 1 and Act 2 nodes (`CONTACT_DIALOGUES`), supporting stat-gated checks, evidence presentations, faction rep checks, 43 unique speaker moods/stage directions, and one-time mechanical favors.
  - `data/endings.ts`: Full narrative epilogues and aftermath cards for all 4 Act 1 endings (`ending_vigilante`, `ending_whistleblower`, `ending_kingpin`, `ending_captured`) and all 4 Act 2 Grand Finale endings (`ending_act2_reckoning`, `ending_act2_revolution`, `ending_act2_syndicate_state`, `ending_act2_vanished`).
  - `data/story2HighveldState.ts`: Complete Story 2 Highveld seed state (`initialHighveldGameState`), 7 regional nodes (`h1_braamfontein_safehouse`–`h7_siu_headquarters`), 6 clocks, and 5 Highveld factions.
  - `data/story2HighveldPrologue.ts`: 3 Highveld investigator backgrounds (`siu_whistleblower`, `deep_reef_fixer`, `nia_ghost`) and 3-beat interactive Bra K prologue.
  - `data/story2HighveldDialogues.ts`: 5 Highveld contact dialogue trees (`Advocate Nomsa Khumalo`, `Helena Van Niekerk`, `Vusi Sithole`, `Mkhulu Sibanyoni`, `General Sibusiso Sithole`).
  - `data/story2HighveldEvents.ts`: Highveld event deck (`evt_highveld_blackout_crisis`, `evt_highveld_shaft_collapse`, `evt_highveld_nia_raid`, and 3 Kendon climax showdowns).
  - `data/story2HighveldEndings.ts`: 4 Story 2 climactic endings (`ending_highveld_siu_vindication`, `ending_highveld_red_blackout`, `ending_highveld_arbitrage_partner`, `ending_highveld_shaft_collapse`).
  - `data/story3NamaquaState.ts`, `data/story3NamaquaPrologue.ts`, `data/story3NamaquaDialogues.ts`, `data/story3NamaquaEvents.ts`, `data/story3NamaquaEndings.ts`: Story 3 Namaqua-Diamond campaign state, 7 nodes, 6 clocks, fog & decompression mechanics, 5 faction perks, and 4 endings.
  - `data/story4CapeState.ts`, `data/story4CapePrologue.ts`, `data/story4CapeDialogues.ts`, `data/story4CapeEvents.ts`, `data/story4CapeEndings.ts`: Story 4 Cape-Nocturne campaign state, 7 nodes, 6 clocks, gang crossfire & gale mechanics, 5 faction perks, and 4 endings.
  - `data/story5OctagonState.ts`, `data/story5OctagonPrologue.ts`, `data/story5OctagonDialogues.ts`, `data/story5OctagonEvents.ts`, `data/story5OctagonEndings.ts`: Story 5 The Sovereign Octagon grand national finale, 7 national command nodes (`o1`–`o7`), 6 clocks, 5 national factions with daily tactical perks, 5 contact dialogues, and 5 grand epilogues.
  - `data/i18n/*.json`: Canonical English master dictionary (`en.json`) and 10 full South African official language dictionaries (`zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`, `nr`), each with 2,041 synchronized canonical keys across all 5 stories with 0 missing keys.
- **`engine/`**
  - `engine/resolver.ts`: Pure state functions `resolveActionSlot()`, `advanceToNextDay()`, `travelToNode()`, `activateGeneratorDiesel()`, `activateFactionPerk()`, `getHostileTurfPenalty()`, `purchaseBlackMarketGear()`, `applyDialogueReward()`, and roadblock helpers across both Act 1 and Act 2, plus all 25 faction standing perks across Stories 1–5.
  - `engine/eventResolver.ts`: Pure state function `resolveTriggeredEvent()` handling multi-choice event consequences, clock completion triggers, and ending transitions.
  - `engine/advisor.ts`: Pure evaluation engine providing `getTacticalRecommendation()` (priority-ranked next-step advisor) and `calculateFixerEvaluation()` (S-to-C Fixer Grade, eThekwini Fixer Registry Leaderboard, and 6 Tactical Commendation Badges).
  - `engine/i18n.ts`: Pure runtime localization engine providing:
    - Direct key lookup: `t(key, fallback, lang)`
    - Reactive object transformers: `getLocalizedNode`, `getLocalizedSlot`, `getLocalizedClock`, `getLocalizedClockTitle`, `getLocalizedItem`, `getLocalizedEvent`, `getLocalizedDialogue`, `getLocalizedEnding`, `getLocalizedBackground`, `getLocalizedPrologueNode`, `getLocalizedContactName`, `getLocalizedContactRole`, `getLocalizedStatName`, `formatLocalizedOutcomeSummary`
    - Dynamic English reverse mapping: `EN_REVERSE_MAP` & `getLocalizedTextByEnglishValue(englishText, lang)`
    - Retrospective log translator: `getLocalizedLogEntry(entry, lang)`
    - Contextual tactical advisor translator: `getLocalizedRecommendation(rec, lang)`
  - `engine/__tests__/`: Automated `vitest` test suites (107 tests total across 7 suites):
    - `engine/__tests__/campaignStorage.test.ts` (8 tests): Cross-story progression, lock/unlock mechanics, Keystone Dossier awards, and legacy auto-sync.
    - `engine/__tests__/story2Highveld.test.ts` (11 tests): Story 2 Highveld state initialization, 7 nodes, 6 clocks, rockfall mechanics, faction perks, contact dialogues, endings, and Keystone extraction.
    - `engine/__tests__/story3Namaqua.test.ts` (15 tests): Story 3 Namaqua state initialization, 7 nodes, 6 clocks, fog & decompression mechanics, faction perks, contact dialogues, endings, and Keystone extraction.
    - `engine/__tests__/story4Cape.test.ts` (16 tests): Story 4 Cape-Nocturne state initialization, 7 nodes, 6 clocks, gang crossfire & gale mechanics, 5 faction perks, contact dialogues, 4 endings, and Keystone extraction unlocking Story 5.
    - `engine/__tests__/story5Octagon.test.ts` (22 tests): Story 5 The Sovereign Octagon state initialization, 7 national nodes, 6 clocks, 5 national factions with tactical perks, 5 contact dialogues, event deck & climax, and 5 grand epilogues.
    - `engine/__tests__/engine.test.ts` (17 tests): Core roll math, load shedding lockouts, daily clock progression, roadblocks, faction perks, black-market gear, dialogue rewards, Act 2 carryover, and tactical advisor grading.
    - `engine/__tests__/i18n.test.ts` (19 tests): Comprehensive multilingual translation coverage across all 11 South African languages, verifying UI labels, dynamic reverse mapping, clock types, contact roles, prologue nodes, dialogue notifications, rewards, speaker moods, and authentic isiNdebele resolution.
  - `engine/storage.ts`: Multi-slot save manager (`loadAllSaveSlots`, `writeSaveSlot`, `deleteSaveSlot`, legacy v1 auto-migration), persistent 8-ending Case Archive (`loadUnlockedEndings`, `recordUnlockedEnding`), and user settings (`loadSettings`, `saveSettings`, `clearAllSavesAndTutorial`).
  - `engine/soundscape.ts`: Zero-dependency Web Audio API procedural soundscape (filtered pink-noise coastal rain, 55Hz Eskom transformer hum that shifts pitch on Stage 6 blackouts, tabletop dice clicks, roll outcome chords, crisis alert tones, dynamic double-pulse heartbeat scaling with adrenaline, encrypted scanner squelch, and cutscene brass/sub-bass stingers) with independent ambient and SFX gain sliders.
  - `engine/adrenaline.ts`: Pure evaluation function calculating real-time narrative tension and adrenaline (levels 1–5: `COVERT`, `ALERT`, `TENSION`, `CRITICAL`, `CLIMAX`) based on climax clock countdowns, threat saturation, and composure levels.
- **`components/`**
  - `components/TitleIntroScreen.tsx`: Cinematic Case File `#409-ZA` Main Menu with custom widescreen key art (`title_keyart.jpg`), **New Game** slot & mode launcher (Act 1 Prologue, Act 1 Map, or Act 2 Direct), **Load Game** 4-slot dossier inspector, **Case Endings (`X/8`)** epilogue archive gallery, **Settings** launcher, and comprehensive 6-pillar **Help & Manual**.
  - `components/SettingsModal.tsx`: Persistent System & Audio Configuration modal with Master Mute, Ambient & SFX volume sliders (`0–100%`), Tactical Dice Face Style (`123` Numbers vs. `⚄` Dots), Reduce Blackout Screen Flicker toggle, Auto-Show Field Guide toggle, 11-language localizer switcher, and two-step save-data purge.
  - `components/PrologueScreen.tsx`: Interactive Scene 1 intro and background selector with custom noir artwork, dynamic personalized "Select This Background: {title}" confirmation buttons, localized active selection badges, localized stat check requirements, and localized action feedback banners.
  - `components/GameDashboard.tsx`: Responsive HUD supporting both a 3-column desktop command center (`lg:`) with full keyboard shortcuts (`1–5`, `Tab`, `Space`, `D`, `B`, `Esc`) and a mobile-first 3-tab tactical switcher (`1. District Map`, `2. Node Actions`, `3. Clocks & Turf`) with localized Left Menu, NPC Contact Cards (`Speak with Contact`), Black-Market Gear shop, persistent bottom Dice Dock (`[123 / ⚄]` switcher), real-time Adrenaline & Tension status meter, in-slot live outcome badges, `◈ BOARD`, `? GUIDE`, manual `SAVE`, `⚙ SETTINGS`, and `MENU` buttons.
  - `components/ActionOutcomeDispatch.tsx`: Floating, non-intrusive encrypted Hawks/SAPS scanner comms HUD with dynamic 5-tier ascending adrenaline visuals, dice math chips, audio scanner squelch, auto-dismiss countdown bar, and manual dismissal.
  - `components/AdrenalineVignette.tsx`: Viewport edge tension pulse and tactical reticle accents scaling dynamically from subtle noir darkness to rapid hazard crimson strobe.
  - `components/CutsceneModal.tsx`: 2.39:1 widescreen cinematic letterbox cutscene viewer with Ken Burns pan/zoom, beat-by-beat narrative crawl, audio stingers, and keyboard controls.
  - `components/ConspiracyBoardModal.tsx`: Interactive SVG red-string corkboard & forensic link inspector mapping suspects, shell companies, and evidence exhibits across Act 1 and Act 2, fully localized across all 11 South African official languages.
  - `components/ContactDialogueModal.tsx`: Interactive NPC conversation & interrogation modal with live stat checks, evidence presentation, faction standing badges, one-time favor claim tracking, localized `INTEL SECURED:` notifications, localized dismiss actions, localized speaker moods, and localized reward summaries.
  - `components/EvidenceDossierModal.tsx`: Interactive forensic document & hardware specification reader for all evidence items and black-market upgrades.
  - `components/DistrictSvgMap.tsx`: Tactical SVG map across all 5 stories with deconflicted node coordinates, bespoke cartographic regional map backgrounds (`public/assets/maps/`), a touch-scrollable mobile quick-select Node Pill Strip, sector columns, SAPS roadblock warnings, and fog-of-war locked leads.
  - `components/ObjectiveTracker.tsx`: Context-aware dynamic objective & next-step hint banner with 3-step Campaign Progress Bar and one-click `"Show Slot →"` navigation.
  - `components/TutorialOverlay.tsx`: 6-step interactive HUD walkthrough & Field Rules modal (auto-opens on first map visit or via `? GUIDE`), fully translated across all 11 languages.
  - `components/ThreatClock.tsx`: Pure SVG circular segmented clock renderer with localized clock titles, types, and trigger badges.
  - `components/EventModal.tsx`: Scroll-safe high-priority modal for triggered threat crises, breakthroughs, and the Berth 14 / Hangar 7 finale choices.
  - `components/EndingScreen.tsx`: Full-screen multi-phase cinematic epilogue showcase with 16:9 widescreen artwork, summary quote, epilogue narrative, district power shifts, and Fixer Registry Leaderboard.
  - `components/MissionStatusModal.tsx`: Mission objective modal with localized styled-span win conditions for Act 1 and Act 2.
  - `components/PwaRegistrar.tsx`: Client-side Service Worker registrar paired with `public/manifest.json`, `public/sw.js`, and `public/icons/icon.svg` for standalone PWA installation.
- **`public/assets/` & `scripts/`**
  - `public/assets/nodes/*.jpg`: All 40 district node banners across all 5 stories (`n1`–`n12`, `h1`–`h7`, `d1`–`d7`, `c1`–`c7`, `o1`–`o7`).
  - `public/assets/maps/*.jpg`: 5 bespoke high-resolution regional tactical cartographic maps (`map_ethekwini`, `map_highveld`, `map_namaqua`, `map_cape`, `map_octagon`).
  - `public/assets/backgrounds/*.jpg`: 20 widescreen backgrounds (all 12 prologue archetypes, title key art, and 8 climax endings).
  - `public/assets/characters/*.jpg`: 38 character portraits and faction crests (all 25 factions and key contacts).
  - `public/assets/cutscenes/*.jpg`: 5 widescreen regional climax cutscenes generated via FAL.ai Flux Schnell.
  - `public/assets/endings/*.jpg`: 9 widescreen cinematic ending illustrations generated via FAL.ai Flux Schnell.
  - `scripts/generate-cutscene-and-ending-assets.mjs`: FAL.ai Flux Schnell generator for cinematic cutscene and ending scene artworks.
  - `scripts/inject-adrenaline-and-ending-translations.mjs`: Multilingual translation injector for adrenaline, cutscene, and ending screen keys.
  - `scripts/audit-translations-and-assets.mjs`: Complete empirical audit tool verifying asset presence on disk and translation key counts across all 10 languages.
  - `scripts/find-missing-keys.mjs`: Automated UI scanner detecting untranslated `t()` keys.
  - `scripts/inject-missing-ui-keys.mjs`: Translation injector ensuring 100% key parity across all 10 South African languages.
  - `scripts/generate-map-backgrounds.mjs`: FAL.ai Flux Schnell regional cartographic map generator.
  - `scripts/build-master-i18n.mjs`: Automated extractor generating canonical `en.json` from all game code, data, and UI components.
  - `scripts/translate-game-data.mjs`: Gemini 2.5 Flash batch translation pipeline translating canonical strings into 9 official SA languages with dialect noir accuracy.

---

## Multilingual Localization Architecture (10 South African Languages)

Mzansi Midnight features deep, zero-compromise localization across **all 10 official South African regional languages**:
- `en` — English (Master Canonical Source — 2,041 keys)
- `zu` — isiZulu (2,041 keys)
- `xh` — isiXhosa (2,041 keys)
- `af` — Afrikaans (2,041 keys)
- `st` — Sesotho (2,041 keys)
- `nso` — Sepedi / Northern Sotho (2,041 keys)
- `tn` — Setswana (2,041 keys)
- `ts` — Xitsonga (2,041 keys)
- `ss` — Siswati (2,041 keys)
- `ve` — Tshivenḓa (2,041 keys)
- `nr` — isiNdebele (2,041 keys)

### Dual-Layer Translation Strategy
1. **Direct Structured Key Lookup (`t(key, fallback, lang)`)**:
   Used for static UI labels, tutorial guidance, modal headers, button text, and structured data properties (`node.n1_safehouse.title`, `dialogue.n1_safehouse.role`, etc.).
2. **Reverse English Value Mapping (`EN_REVERSE_MAP` & `getLocalizedTextByEnglishValue(text, lang)`)**:
   Enables dynamic translation of computed strings, dialogue reward summaries (e.g. `"+1 Audit Docket #409 Clock, +10% Composure"`), and NPC stage directions / speaker moods without refactoring the underlying numeric state engine.
3. **Retrospective Narrative Log Translation (`getLocalizedLogEntry(entry, lang)`)**:
   Translates dynamic active log entries (e.g. `"[Phonsa 6 -> 8] Cross-Reference Docket #409: ..."` or `"You spot it immediately..."`) retroactively when the player switches languages mid-campaign, maintaining a localized crime comms ledger.

For complete developer guidelines on authoring new narrative campaigns or expanding existing stories, see [`docs/STORY_TRANSLATION_BLUEPRINT.md`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/docs/STORY_TRANSLATION_BLUEPRINT.md).

---

## Development Commands

- `npm run dev` — Start the Next.js development server at `http://localhost:3000`
- `npm test` — Run the automated `vitest` unit test suites (137 tests total across 11 test suites)
- `npx tsc --noEmit` — Run TypeScript typechecking across all game modules
- `npm run build` — Build production bundle (`out/` static export)
- `npm start` — Run ultra-low-memory production server (`server.mjs`) for Host Africa HCODE & PaaS (<30MB RAM)
- `npm run cap:sync` — Build Next.js static export and sync web assets to Android
- `npm run cap:open` — Open the native project in Android Studio
- `npm run cap:build` — Build standalone Android Debug APK (`android/app/build/outputs/apk/debug/app-debug.apk`)
- `npm run cap:bundle` — Build Google Play Release App Bundle (`android/app/build/outputs/bundle/release/app-release.aab`)
- `node scripts/audit-translations-and-assets.mjs` — Run empirical audit of all visual assets and translation key parity
- `node scripts/find-missing-keys.mjs` — Scan codebase for missing `t()` translation keys
- `node scripts/build-master-i18n.mjs` — Extract 100% of master game strings into `data/i18n/en.json`
- `node scripts/translate-game-data.mjs` — Run Gemini 2.5 Flash batch translation across all 9 official SA languages
- `node scripts/generate-map-backgrounds.mjs` — Regenerate regional tactical map backgrounds via `FAL_API_KEY`




