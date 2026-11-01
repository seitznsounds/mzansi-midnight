# Mzansi Midnight (`eThekwini-Gold`) — Development Roadmap

## Completed Milestones

### Phase 1: World-Building, Genre & Systems Design ✅
- [x] Defined the **Dice-and-Node Noir RPG** core loop (Daily Composure-driven `d6` pool, deterministic stat + blackout roll previews, segmented clocks).
- [x] Designed the **South African setting ("eThekwini-Gold")** blending Durban port logistics with Johannesburg brutalist verticality and state-capture mechanics.
- [x] Established the **4-Stat Investigator System** (`street`, `dockets`, `wire`, `influence`) and **5 Interlocking Factions** (`abasanta`, `city_hall`, `saps_trt`, `street_syndicate`, `hawks`).
- [x] Mapped the **7 Act 1 CBD & Waterfront Nodes** across three sectors (West Street Grid, Central Civic Spine, East Harbour Channel).

### Phase 2: Core TypeScript State Engine & Data Model ✅
- [x] Created framework-agnostic TypeScript interfaces in `types/game.ts`, `types/events.ts`, and `types/prologue.ts`.
- [x] Implemented `initialGameState` in `data/initialState.ts` with all 7 Act 1 nodes, SVG percentage coordinates, Stage 6 Load Shedding lockouts/bonuses, and action slots.
- [x] Implemented pure turn-resolution functions `resolveActionSlot` and `advanceToNextDay` in `engine/resolver.ts`.
- [x] Implemented `resolveTriggeredEvent` in `engine/eventResolver.ts` for queued crisis and breakthrough events.

### Phase 3: Interactive Prologue & Event Deck ✅
- [x] Authored the 4-beat interactive prologue (`data/prologueScript.ts` & `components/PrologueScreen.tsx`) featuring 3 selectable Hawks investigator backgrounds:
  - *The Paper-Trail Auditor* (`+2 Dockets, +1 Influence`)
  - *The Burned Enforcer* (`+2 Street, +1 Dockets`)
  - *The Ghost Wiretapper* (`+2 Wire, +1 Influence`)
- [x] Built the Act 1 Event Deck (`data/eventDeck.ts` & `components/EventModal.tsx`):
  - Threat Crises: *Blue Lights in the Alley* (`evt_trt_safehouse_raid`), *Septic Shock* (`evt_nandi_critical`), *Operation Shanela Lockdown* (`evt_shanela_roadblock`).
  - Investigation Breakthroughs: *The Water-Tanker Pipeline* (`evt_docket_decoded`), *Voice Note from Berth 14* (`evt_phone_decrypted`).

### Phase 4: Tactical SVG District Map & Single-Screen HUD ✅
- [x] Scaffolded the Next.js 15 + React 19 + Tailwind CSS application in the workspace.
- [x] Built `SegmentedClock` (`components/ThreatClock.tsx`) for 4, 6, 8, and 12-segment circular SVG clocks.
- [x] Built `DistrictSvgMap` (`components/DistrictSvgMap.tsx`) with transit corridors, dynamic SAPS roadblock indicators, Stage 6 power/darkness badges, and fog-of-war locked location leads.
- [x] Built `GameDashboard` (`components/GameDashboard.tsx`) with dual drag-and-drop / click-to-assign dice placement, live roll outcome color previews, Faction Standing panel, and Evidence Inventory.

### Phase 5: Act 1 Climax & Ending Paths ✅
- [x] Added the 4-segment `berth_14_countdown` World Clock and Finale Action Slots on Pier 2 Cold Storage (`n6_pier2_port`) and The Old Archive Basement (`n7_archive_basement`).
- [x] Built the **Midnight at Berth 14 (`evt_climax_berth14`)** showdown event and HUD trigger button.
- [x] Authored 4 complete Act 1 Endings in `data/endings.ts` and built the full-screen `EndingScreen` (`components/EndingScreen.tsx`) with epilogue narrative, district power-shift cards, final fixer ledger, and timeline reset:
  - **The Vigilante Path** (`ending_vigilante` — *"The Harbour Fire"*)
  - **The Whistleblower Path** (`ending_whistleblower` — *"Front Page of The Daily Veld"*)
  - **The Kingpin Path** (`ending_kingpin` — *"Twenty Percent of the Taps"*)
  - **Systemic Failure** (`ending_captured` — *"Buried in Shaft 9"*)

---

### Phase 6: Deepening Systemic Mechanics ✅
- [x] **Roadblock Travel Enforcement**: Require spending `1 Die` or `R200` "cold drink" bribe when switching between nodes separated by an active SAPS Roadblock, unless the player holds the cloned SAPS transponder (`saps_radio_scanner`) or `street_syndicate` Rep >= 2.
- [x] **Unlockable Faction Perks** (1/day tactical abilities in Left Panel):
  - *City Hall Rep >= 1*: **Grid Manipulation** (toggle Load Shedding between Stage 2 and Stage 6 on demand).
  - *SAPS TRT Rep >= 1*: **Blue-Light Escort** (clear `-2 Precinct Heat` and `-1 Mokoena's Sweep`).
  - *Street Syndicate Rep >= 2*: **Izinkabi Muscle** (spend `R600` to upgrade lowest unused die to a `6`).
  - *Hawks Rep >= 2*: **Hawks Safe-Channel** (recover `+15% Composure` and `-1 Mokoena's Sweep`).
- [x] **Generator Diesel Consumable**: Allow purchasing backup generator diesel (`R300`) during Stage 6 Load Shedding to override `disabledDuringStage6` server lockouts for the current cycle.

### Phase 7: Polish, Persistence, Audio Atmosphere & FAL.ai Visual Assets ✅
- [x] **AI Visual Asset Generation (`FAL_API_KEY`)**: Created `scripts/generate-assets.mjs` and generated 15 custom South African graphic-novel noir illustrations (`public/assets/backgrounds/*.jpg`, `public/assets/characters/*.jpg`, `public/assets/nodes/*.jpg`) integrated across `PrologueScreen`, `GameDashboard`, and `EventModal`.
- [x] **Local Storage Save/Load**: Auto-save `GameState` and `inPrologue` to `localStorage` (`mzansi_midnight_save_v1`) on every action and cycle transition, with a `RESET` timeline button in the Top HUD.
- [x] **Dice Roll & Blackout Micro-Animations**: Added dice-tumbling animation (`isRollingDice`) and grid-power transition flicker (`isGridFlashing`) on "End Cycle / Sleep".
- [x] **Web Audio Synth / Ambient Soundscape (`engine/soundscape.ts`)**: Procedural coastal rain loop, 55Hz Eskom substation transformer hum, tabletop dice clicks, harmonic roll outcome chords, and crisis alert tones with a Top HUD `AUDIO: ON / MUTED` toggle.
- [x] **Onboarding, Intro Briefing & In-Game Guidance**:
  - `components/TitleIntroScreen.tsx`: Cinematic title screen, 3-pillar "How the City Works" briefing, and Resume / Play Prologue / Quick-Start buttons.
  - `components/TutorialOverlay.tsx`: 4-step interactive HUD tour that launches on first map visit and via the `? GUIDE` button.
  - `components/ObjectiveTracker.tsx`: Dynamic context-aware objective & tactical hint banner mounted above the SVG District Map.
- [x] **Mobile-First & Responsive Gameplay (`360px–1023px` + `lg:` Desktop)**:
  - `components/GameDashboard.tsx`: Dynamic viewport height (`h-[100dvh]`), compact 2-row mobile header, 3-Tab Mobile Tactical Switcher (`1. District Map`, `2. Node Actions`, `3. Clocks & Turf`), one-thumb "Inspect Node" CTA bar, and persistent bottom Dice Dock that auto-switches to the `actions` tab when a die is tapped on mobile.
  - `components/DistrictSvgMap.tsx`: Touch-scrollable mobile quick-select Node Pill Strip (`lg:hidden`) and responsive node pin cards (`w-28 sm:w-40 lg:w-56`).
  - Scroll-safe modals (`max-h-[90dvh] overflow-y-auto`, `min-h-[100dvh]`) across `EventModal`, `TutorialOverlay`, `TitleIntroScreen`, `PrologueScreen`, and `EndingScreen`.

---

### Phase 8: Systemic Edge Cases, Dossier Reader & Morning Wires ✅
- [x] **Zero-Composure Breakdown Crisis (`0% Composure` Consequence)**:
  - Triggers **"Blackout Paranoia: Nervous Collapse" (`evt_composure_breakdown`)** when Composure drops to `0%`, forcing the player to spend `R500` on black-market stimulants (`+45% Composure, +1 Precinct Heat`), call a Hawks medic (`Hawks Rep >= 1` for `+50% Composure, -1 Sweep`), or pass out (`+35% Composure`, advancing Threat Clocks).
- [x] **Interactive Evidence Dossier & Item Inspection Modal (`data/itemsCatalog.ts` & `components/EvidenceDossierModal.tsx`)**:
  - Clicking any item in `Evidence & Gear Dossier` opens a classified Hawks Dossier reader displaying the item's source, forensic document/audio transcript excerpt, and mechanical utility.
- [x] **Encrypted Morning Briefings & Daily Street Events (`data/eventDeck.ts` & `engine/resolver.ts`)**:
  - Added Dawn Encrypted Wire & Street Dispatch events on Cycle transitions: Day 2 (*The 4th-Floor Olive Branch* `evt_morning_masibi_wire`), Day 3 (*Umgeni Feeder Cable Stripped* `evt_morning_cable_theft`), and Day 4 (*MV Southern Cross Docking* `evt_morning_port_tipoff`).
- [x] **Hostile Turf Retaliation (`getHostileTurfPenalty`)**:
  - Operating on a node owned by a faction with `Rep <= -2` applies a `-1 Hostile Turf Roll Penalty` with a live warning banner in the Node Action Drawer.

### Phase 9: Black-Market Gear Shop, NPC Portraits & UX Transparency ✅
- [x] **Black-Market Gear & Upgrades Shop (`purchaseBlackMarketGear`)**:
  - Added purchasable field hardware (no die required) at **Golden Dragon Cyber-Pawn** (`n5_cyber_pawn`) and **Queen Street Taxi Rank** (`n2_taxi_rank`):
    - *Sparks' Multi-IMSI Burner Array (`R900`)*: Permanent **`+1 WIRE`**
    - *Forged Treasury Compliance Credentials (`R1,000`)*: Permanent **`+1 DOCKETS`**
    - *Scratch-Serial Kevlar Under-Vest (`R1,100`)*: Permanent **`+1 STREET`** & **`+10% Composure`**
    - *Blue-Light VIP Dashboard Strobe (`R1,000`)*: Permanent **`+1 INFLUENCE`**
- [x] **NPC Contact Portrait Cards in Node Drawer**:
  - Integrated custom noir portraits (`nandi.jpg`, `bheki.jpg`, `mokoena.jpg`, `sparks.jpg`, `zuko.jpg`, etc.) and live Faction Standing badges into the top of the Right Node Action Drawer.
- [x] **3-Tier Action Outcome Consequence Matrix & Live Roll Callout (`GameDashboard.tsx`)**:
  - Every Action Slot card now displays the exact mechanical payout/penalty for `6+ Clean`, `4–5 Risky`, and `1–3 Fail` (`formatOutcomeSummary`), highlighting the active tier row when a die is held.
  - Added a live **Last Roll Result Callout Banner** at the top of the Node Action Drawer so both mobile and desktop players immediately see the narrative outcome and stat shifts right where they tapped.
- [x] **Daily Ticking Clock Badges (`ThreatClock.tsx`) & Locked Node Hints (`DistrictSvgMap.tsx`)**:
  - Added `+1 / Cycle` vs. `On Heat` / `On Roll` badges to all clocks and specific unlock instructions (`Unlock: Audit Docket #409`, `Unlock: Crack Auditor's Phone`) to locked map leads.
- [x] **Ending Save-State Reset Fix (`app/page.tsx`)**:
  - Cleans up `localStorage` when an Act 1 Ending is reached or reset so `Resume Saved Dossier` never traps players on a finished epilogue screen.

### Phase 10: Main Menu Intro Screen, Multi-Slot Case Dossiers & System Settings ✅
- [x] **Custom Main Menu Key Art & Complete NPC Portrait Set (`FAL_API_KEY`)**:
  - Generated widescreen noir title key art (`public/assets/backgrounds/title_keyart.jpg`) and the remaining NPC portraits (`masibi.jpg`, `vandermerwe.jpg`, `sparks.jpg`) so all 7 Act 1 nodes and all 5 factions have dedicated character portraits (18 custom `.jpg` assets total).
- [x] **Interactive Main Menu (`components/TitleIntroScreen.tsx`)**:
  - **New Game (`01 // START`)**: Choose target Case File storage slot (`Slot 01`, `Slot 02`, `Slot 03`) with overwrite warnings, and launch either the Interactive Prologue or Quick-Start to District Map.
  - **Load Game (`02 // DOSSIERS`)**: 4-slot Case File Inspector (`Auto-Save Dossier` + 3 manual Case File Slots) displaying Cycle number, Node location, Cash (`R`), Composure (`%`), Evidence count, Load Shedding Stage, and saved timestamp with `[Load Dossier]` and two-step `[Delete]` controls.
  - **Settings (`03 // SYSTEM`)**: Opens the persistent System & Audio Configuration modal directly from the Main Menu or in-game Top HUD (`⚙ SETTINGS`).
  - **Field Briefing (`04 // PRIMER`)**: Expandable 3-pillar operational manual.
- [x] **Persistent Settings & Audio Controls (`types/settings.ts`, `engine/storage.ts`, `components/SettingsModal.tsx`)**:
  - Independent volume sliders (`0–100%`) for **Coastal Rain & 55Hz Grid Hum** and **Tactical Dice & Crisis Alerts** (with `[Test]` button) wired into `engine/soundscape.ts`, plus **Reduce Blackout Screen Flicker**, **Auto-Show Field Guide**, and a two-step **Purge All Saved Dossiers** utility.

### Phase 11: Act 2 Campaign Expansion ("The Commission of Inquiry") ✅
- [x] **Act 1 -> Act 2 Save State Carryover (`data/act2State.ts` & `components/EndingScreen.tsx`)**:
  - Added `transitionToAct2(prevState, act1EndingId)` and the **"Continue to Act 2: The Commission →"** CTA on `EndingScreen`, carrying over the player's Cash, Stats, Faction Standing, and Black-Market Gear while granting a path-specific Legacy Dossier Item & bonus (`+1 STREET` for Vigilante, `+1 DOCKETS` for Whistleblower, or `+R1,500` for Kingpin). Also added a direct **"Act 2: The Commission →"** launch mode to the Main Menu.
- [x] **5 New District 2 Nodes & Custom FAL.ai Artwork (`public/assets/nodes/n8–n12.jpg`)**:
  - `n8_ridge_penthouses` (*The Ridge Penthouses* — Umhlanga Glass Towers & Inmarsat Sat-Terminal shop)
  - `n9_township_depot` (*Northern Township Depot* — Impounded water-tanker GPS telemetry & strike marshals)
  - `n10_high_court` (*High Court Chambers* — State Capture Commission of Inquiry & Section 205 subpoenas)
  - `n11_citrus_estate` (*Hydroponic Citrus Estate* — Midlands precursor super-lab with `+2` Stage 6 blackout stealth bonus)
  - `n12_cargo_apron` (*King Shaka Cargo Apron* — Hangar 7 Gulfstream `ZS-900` charter tarmac)
- [x] **5 Act 2 Clocks, Event Deck & 4 Grand Finale Endings (`data/eventDeck.ts` & `data/endings.ts`)**:
  - Threat Clocks (*Izinkabi Hit Squad*, *Contempt & Security Warrant*), Investigation Clocks (*Trace Sovereign Pearl Trust*, *Synthesize Super-Lab Telemetry*), and the *Flight ZS-900 Charter Departure* countdown leading to **"Wheels Up at Hangar 7"** (`evt_act2_climax_tarmac`) and 4 Act 2 endings (`ending_act2_reckoning`, `ending_act2_revolution`, `ending_act2_syndicate_state`, `ending_act2_vanished`).

### Phase 12: Interactive NPC Dialogue Trees & Contact Interrogations ✅
- [x] **Branching Contact Conversations (`data/contactDialogues.ts` & `components/ContactDialogueModal.tsx`)**:
  - Added a **"Speak with Contact"** button (with live `INTEL` notification pulse when new stat/evidence leads unlock) to all 12 Node Contact Portrait Cards across Act 1 (`n1`–`n7`) and Act 2 (`n8`–`n12`).
  - Built 12 multi-node *Disco Elysium*-style dialogue & interrogation trees (`Constable Nandi`, `Bra Bheki`, `Brig. Mokoena`, `Cllr. Ma-Sibi`, `Sparks`, `Zuko Ndlovu`, `Col. van der Merwe`) with stat-gated persuasion/intimidation lines (`STREET >= 2`, `DOCKETS >= 2`, `WIRE >= 2`, `INFLUENCE >= 2`), evidence presentation (`decoded_tanker_ledger`, `berth_14_manifest`, `offshore_trust_deed`, `superlab_batch_telemetry`), and one-time mechanical rewards tracked via `GameState.claimedDialogueRewards` (`applyDialogueReward()` in `engine/resolver.ts`).

### Phase 13: Red-String Conspiracy Board & Unlocked Endings Archive ✅
- [x] **Interactive Case Conspiracy Board (`components/ConspiracyBoardModal.tsx`)**:
  - Built a visual corkboard / red-string mind-map accessible anytime via the Top HUD **`◈ BOARD`** button in `components/GameDashboard.tsx`.
  - Maps all suspects, shell companies, and extraction routes across both **Act 1 Web** (`Docket #409 & Berth 14`) and **Act 2 Web** (`Sovereign Pearl Trust & Hangar 7`), lighting up glowing crimson red-string threads as the player collects linking Evidence Dossiers (`docket_409_raw`, `decoded_tanker_ledger`, `berth_14_manifest`, `offshore_trust_deed`, `superlab_batch_telemetry`) with one-click inspection into `EvidenceDossierModal`.
- [x] **Persistent Endings & Achievements Gallery (`engine/storage.ts`, `components/EndingScreen.tsx` & `components/TitleIntroScreen.tsx`)**:
  - Added `loadUnlockedEndings()` and `recordUnlockedEnding()` in `engine/storage.ts` (`mzansi_midnight_endings_v1`), automatically archiving all 8 Act 1 & Act 2 endings whenever reached.
  - Added the **`03 // ARCHIVE (X/8) — Case Endings`** tab to `components/TitleIntroScreen.tsx` with a completion progress bar, unlock hints for redacted paths, and a full Epilogue Dossier reader modal for unlocked timelines.

---

### Phase 14: Automated Engine Test Suite, Hotkeys, Tactical Advisor & PWA Packaging ✅
- [x] **Automated Unit Tests (`vitest` & `engine/__tests__/engine.test.ts`)**:
  - Added full unit test coverage for `resolveActionSlot`, `advanceToNextDay`, `resolveTriggeredEvent`, `transitionToAct2`, `travelToNode`, `activateFactionPerk`, `purchaseBlackMarketGear`, `applyDialogueReward`, `getTacticalRecommendation`, and `calculateFixerEvaluation`.
- [x] **Desktop Keyboard Shortcuts (`components/GameDashboard.tsx`)**:
  - Press `1–5` to select/toggle an unused Action Die, `Tab` to cycle unlocked map nodes, `Space` to End Cycle, `D` to toggle Numbers (`123`) vs. Dots (`⚄`) dice mode, `B` to open the Red-String Conspiracy Board, and `Esc` to close active modals or clear the held die.
- [x] **High-Contrast Numbers (`123`) vs. Dots (`⚄`) Dice Face Switcher**:
  - Added a persistent setting (`diceDisplayMode` in `GameSettings`) and a 1-click `[123 / ⚄]` toggle in the bottom dice dock with a custom `<svg>` 3×3 pip renderer and value-coded high-contrast pips.
- [x] **Smart Tactical Advisor, Fixer Registry Leaderboard & New Game+ (`engine/advisor.ts`, `components/ObjectiveTracker.tsx`, `components/EndingScreen.tsx`)**:
  - Context-aware Tactical Advisor with `"Show Slot →"` auto-navigation, `★ Recommended` badges, S-to-C Fixer Grade evaluation, eThekwini Fixer Registry Leaderboard, 6 Commendation Badges, and New Game+ hardware/stat carryover.
- [x] **Progressive Web App (PWA) Packaging (`public/manifest.json`, `public/sw.js`, `public/icons/icon.svg`, `components/PwaRegistrar.tsx`)**:
  - Installable standalone noir web app with custom vector emblem, offline cache-first service worker, and Next.js viewport/manifest metadata.

---

### Phase 15: Gemini AI Game Localization & Dynamic Multilingual Engine ✅
- [x] **100% Master String Extraction (`scripts/build-master-i18n.mjs`)**:
  - Extracted 907 canonical strings covering all static UI labels, tutorial steps, dialogue responses, advisor text, board notes, ending epilogues, and menu items into `data/i18n/en.json`.
- [x] **Gemini 2.5 Flash API Translation Pipeline (`scripts/translate-game-data.mjs`)**:
  - Integrated official Gemini 2.5 Flash REST API with dialect noir system prompting and batching across all 9 official South African target languages (`zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`), reaching 100% key parity (907 keys each).
- [x] **Reactive Localization Helper Suite (`engine/i18n.ts`)**:
  - Implemented `t()`, `getLocalizedNode()`, `getLocalizedSlot()`, `getLocalizedClock()`, `getLocalizedClockTitle()`, `getLocalizedItemName()`, `getLocalizedCatalogItem()`, `getLocalizedFactionName()`, `getLocalizedEvent()`, `getLocalizedDialogue()`, `getLocalizedEnding()`, `getLocalizedBackground()`, `getLocalizedPrologueNode()`, and `formatLocalizedOutcomeSummary()`.
- [x] **Full Component Language Reactivity**:
  - Wired `lang = settings.language` through `app/page.tsx` and all 15 components (`TitleIntroScreen`, `PrologueScreen`, `GameDashboard`, `DistrictSvgMap`, `ThreatClock`, `ObjectiveTracker`, `EventModal`, `ContactDialogueModal`, `EvidenceDossierModal`, `ConspiracyBoardModal`, `EndingScreen`, `TutorialOverlay`, `SettingsModal`, `EndCycleModal`, `MissionStatusModal`).
- [x] **Verification & Live Browser Testing (`browser_subagent`)**:
  - Verified in browser with recording `language_switch_demo_1792404816917.webp`: dynamic, real-time in-game switching across isiZulu (`zu`), Afrikaans (`af`), and isiXhosa (`xh`) with zero reload latency, 100% type safety, and 26 passing tests.

---

### Phase 16: Contextual Notifications, Tactical Advisor, Metro Dispatch & Map Legends Localization ✅
- [x] **Master Dictionary Expansion (`scripts/build-master-i18n.mjs` & `data/i18n/en.json`)**:
  - Ingested all 123 missing component `t()` keys, all Tactical Advisor templates (`advisor.*`), Metro Dispatch & Comms Log header and log entries (`ui.metro_dispatch_log`, `log.*`), Faction Perks (`perk.*`), and Map Sectors / Legends (`map.legend.*`, `map.sector.*`, `map.water.*`, `map.roadblock_warning`).
  - Canonical master dictionary expanded to 1,184 canonical keys.
- [x] **South African Language Translation Pipeline Execution**:
  - All 9 official South African target languages (`zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`) 100% synchronized with authentic crime noir dialect translations (zero untranslated English fallbacks remaining).
- [x] **Runtime Advisor & Log Localizers (`engine/i18n.ts`)**:
  - Implemented `getLocalizedRecommendation(rec, lang)` with dynamic node name substitution, localized badges (`FREE CONTACT INTEL (0 DICE)`, `CYCLE COMPLETE`, `URGENT MEDICAL CRISIS`, etc.), and action CTAs.
  - Implemented `getLocalizedLogEntry(entry, lang)` handling prologue choices, dice roll results (`[Roll X -> Y]`), faction perk alerts, and scenario beginnings.
- [x] **Component Integration & UI Wiring**:
  - Wired [`components/ObjectiveTracker.tsx`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/components/ObjectiveTracker.tsx), [`components/GameDashboard.tsx`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/components/GameDashboard.tsx) (Faction Calls, Perks, Metro Dispatch Log), and [`components/DistrictSvgMap.tsx`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/components/DistrictSvgMap.tsx) (Legends, Sectors, Waterways, Roadblock warning).
- [x] **Verification & Testing**:
  - All 26 unit tests passed (`npm test`).
  - Zero TypeScript compilation errors (`npx tsc --noEmit`).
  - Verified live in browser with Playwright screenshots in Afrikaans (`dashboard_afrikaans_1792412978733.png`) and isiZulu (`dashboard_isizulu_1792413012346.png`).

---

### Phase 17: Deep Narrative, Forensic Log, Stat Titles, Field Rules & Red-String Board Localization ✅
- [x] **Outcome Tiers, Stat Headers & Dice Dock Prompts**:
  - Localized `ui.risky` ("Risky" -> "Gevaarlik", "Ngobungozi") and `ui.fail` ("Fail" -> "Mislukking", "Ukwehluleka").
  - Localized `stat.any`, `stat.dockets`, `stat.influence`, `stat.wire`, `stat.street` and stat abbreviations (`STRT`, `DCKT`, `WIRE`, `INFL`).
  - Localized Dice Dock prompts: `ui.select_die_prompt` ("Select a die in bottom dock to preview & roll" -> "Kies 'n dobbelsteen in die onderste dok om te voorskou en te rol").
  - Localized HUD header `ui.status` ("Status" -> "Stand", "Isimo", "Boemo").
- [x] **Field Rules & Guide Walkthrough Modal (`TutorialOverlay.tsx`)**:
  - Localized all 6 onboarding steps: step badges, zone subtitles, titles, descriptions, and 24 actionable bullet points.
- [x] **Red-String Conspiracy Board Mind-Map (`ConspiracyBoardModal.tsx`)**:
  - Fully translated both **Act 1 Web** (`Docket #409 & Berth 14`) and **Act 2 Web** (`Sovereign Pearl Trust & Hangar 7`).
  - Localized all 13 suspects/evidence pins (tag, title, role, summary bio) and 11 red-string connection links (labels, verified explanations, unverified hints).
- [x] **Contact Roles & Retrospective Comms Log (`engine/i18n.ts`)**:
  - Added `getLocalizedContactRole` localizing titles such as "Commission Evidence Leader • DPCI Hawks" across all 10 languages.
  - Implemented `EN_REVERSE_MAP` retrospective log translator for dice rolls (`[Roll 6 -> 8] Cross-Reference Docket #409: ...`) and background picks.

---

### Phase 18: Story Win Condition Blueprints & Translation Architecture Guide ✅
- [x] **Styled Span Story Win Conditions (`MissionStatusModal.tsx`)**:
  - Localized Act 1 and Act 2 "How You Win" paragraphs (`mission.how_to_win_act1`, `mission.how_to_win_act2`) with HTML markup (`<span class="...">`) preserved for keywords (*Sovereign Pearl Trust Deed*, *Super-Lab Telemetry*, *Hangar 7 Finale*).
- [x] **Story Translation Blueprint Documentation (`docs/STORY_TRANSLATION_BLUEPRINT.md`)**:
  - Authored a comprehensive developer specification detailing all translation keys, component hooks, reverse mapping mechanics, and guidelines for authoring future narrative campaigns.

---

### Phase 19: Prologue Background Select Buttons & Personalized Confirmation Action ✅
- [x] **Prologue Archetype Cards (`PrologueScreen.tsx`)**:
  - Added dedicated interactive selection button on each of the 3 archetype cards: `t('prologue.select_this_bg')` ("Select This Background: {title}").
  - Added personalized active selection badge and confirmation feedback banner: `t('prologue.chosen_path')` ("Indlela Ekhethiwe", "Gekose Pad").
  - Synchronized across all 10 South African regional languages.

---

### Phase 20: Dialogue Notifications, Moods, Reward Summaries & Left Menu Clocks ✅
- [x] **Dialogue Notification Modal & Feedback Banner (`ContactDialogueModal.tsx`)**:
  - Localized `dialogue.intel_secured` ("INTEL SECURED:" -> "INLIGTING VERKRY:", "ULWAZI LUVUNYELWE:").
  - Localized `ui.dismiss` ("Dismiss" -> "Maak toe", "Susa").
  - Localized `dialogue.one_time_intel` ("One-Time Intel" -> "Eenmalige Inligting", "Ulwazi Lwesikhathi Esisodwa").
  - Localized `dialogue.select_response` ("Select Interrogation / Response Line (0 Dice Cost)").
  - Localized claim banner and response reward summaries (`getLocalizedTextByEnglishValue`) across 19 unique dialogue payouts, including `+1 Audit Docket #409 Clock, +10% Composure`.
- [x] **Complete Dialogue Speaker Moods (Stage Directions)**:
  - Translated **all 43 unique speaker moods** across all 12 contacts in Durban into all 10 South African regional languages, including `"Tracing a trembling finger across the carbon-copy invoice."`.
- [x] **Prologue Action Feedback Banner Localization (`PrologueScreen.tsx`)**:
  - Wrapped `lastFeedback` with `getLocalizedLogEntry(lastFeedback, lang)` so narrative decision banners like `"You spot it immediately..."` and `"You haul Nandi inside..."` resolve in the player's active language.
- [x] **Left Menu, Threat Clocks & Dossier**:
  - Localized `clock.audit_docket_409.title` ("Audit Docket #409" -> "Oudit Dossier #409", "Ukuhlolwa Kwe-Docket #409").
  - Localized clock types: `clocks.type_threat` ("Threat Clock"), `clocks.type_opportunity` ("Investigation"), `clocks.type_world` ("Finale Countdown").
  - Localized clock triggers: `clocks.on_heat` ("On Heat"), `clocks.on_roll` ("On Roll"), `clocks.daily` ("+1 / Cycle").
  - Localized Evidence Dossier: `ui.evidence_dossier` ("Evidence & Gear Dossier"), `ui.tap_to_inspect` ("Tap to inspect").
  - Localized Contact button: `ui.speak_with_contact` ("Speak with Contact" -> "Praat met Kontak", "Khuluma Nomuntu Oxhumana Naye").
  - Localized Whistleblower roles: `role.whistleblower`, `role.wounded_whistleblower`, `dialogue.n1_safehouse.role`, `pnode.scene_3_the_ambush.role`.
  - Localized header return button: `ui.menu` ("MENU" -> "KIESLYS", "IMENU", "LENANE", "MENYU").
- [x] **Verification & Test Suite**:
  - 35 / 35 unit tests passing in Vitest (`engine.test.ts` and `i18n.test.ts`).
  - Zero TypeScript compilation errors (`npx tsc --noEmit`).
  - Live visual verification via browser subagent with confirmed screenshots of localized Left Menu, Contact Dialogue, and Notification Banner.

---

---

## Planned Future Milestones: The Mzansi Midnight Quintet

The overarching narrative architecture is documented in [`STORIES.md`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/STORIES.md). The 5 stories form a progressive, connected anthology where completing each chapter unlocks the next regional crucible, culminating in the Grand National Finale.

```
[Story 1: eThekwini-Gold] (Live)
      │  (Keystone: Sovereign Pearl Trust Deed)
      ▼
[Story 2: Highveld-Chrome] (Phase 22)
      │  (Keystone: Project Midas Offshore Ledger)
      ▼
[Story 3: Namaqua-Diamond] (Phase 23)
      │  (Keystone: Table Bay Admiralty Manifest)
      ▼
[Story 4: Cape-Nocturne] (Phase 24)
      │  (Keystone: The Grand Sovereign Protocol)
      ▼
[Story 5: The Sovereign Octagon] (Phase 25 — Grand Finale)
```

---

### Phase 21: Modular Campaign Engine & Campaign Stitching Architecture ✅
- [x] **Campaign Progression Store (`engine/campaignStorage.ts`)**:
  - Implemented `mzansi_campaign_progression_v1` in `localStorage` tracking unlocked chapters (`story_1`–`story_5`), completed endings, and acquired Keystone Dossiers with automatic legacy save auto-sync (`mzansi_midnight_endings_v1`).
- [x] **Main Menu Story Selector (`components/TitleIntroScreen.tsx`)**:
  - Added the `00 // CAMPAIGN` tab and command bar selector with 5-story cards, dynamic lock/unlocked/completed badges, Keystone indicators, Briefing modal inspector, and Keystone Dossier reader.
- [x] **Cross-Story State & Keystone Carryover System (`app/page.tsx` & `data/itemsCatalog.ts`)**:
  - Added 4 federal Keystone Dossiers (`dossier_sovereign_pearl`, `dossier_project_midas`, `dossier_admiralty_manifest`, `dossier_red_protocol`) to `ITEMS_CATALOG`.
  - Injected Keystone carryover and hero legacy stat bonuses (`+1 DOCKETS`, `+1 WIRE`, etc.) directly into new game initialization via `handleStartNewGame`.
- [x] **National Red-String Conspiracy Board Foundation (`components/ConspiracyBoardModal.tsx`)**:
  - Expanded the corkboard engine with a 3-way mode switcher (`Act 1 Web`, `Act 2 Web`, `National Web (5S)`), rendering 5 regional conspiracy hubs and live-verified Keystone threads across the republic.
- [x] **10-Language Multilingual Parity & Test Suite**:
  - Added 37 translation keys synchronized across all 10 official South African regional languages (`en`, `zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`).
  - Added 7 dedicated unit tests in `engine/__tests__/campaignStorage.test.ts` (42/42 tests passing in Vitest, 0 TypeScript compilation errors).

---

### Phase 22: Story 2 — Highveld-Chrome ("The Capital Syndicate") ✅
- [x] **Setting & Geography**: Johannesburg & Pretoria (Gauteng) — 7 interactive map nodes (`h1_braamfontein_safehouse`, `h2_sandton_tower`, `h3_hillbrow_substation`, `h4_witwatersrand_shaft`, `h5_union_buildings`, `h6_kendon_coal_depot`, `h7_siu_headquarters`) with custom SVG positioning and sector divides.
- [x] **Protagonist & Prologue**: Kagiso "Bra K" Molefe — Disgraced Special Investigating Unit (SIU) forensic auditor with 3 unique playable backgrounds (*SIU Forensic Whistleblower*, *Deep Reef Fixer*, *Disavowed NIA Ghost*) and a 3-scene narrative prologue.
- [x] **The Case & Mechanics**: *The Megawatt Sabotage & Coal Cartel* — 6 regional clocks (`megawatt_sabotage`, `rockfall_hazard`, `nia_surveillance`, `siu_tribunal_docket`, `crack_midas_coldstorage`, `kendon_blackout_countdown`), SCADA Substation Overload, and Crown Mines deep-level rockfall hazards.
- [x] **Core Factions & Perks**: Implemented 5 Highveld factions (`megawatt_cartel`, `sandton_arbitrage`, `reef_zamazamas`, `siu_clean_hands`, `red_guard_populists`) with functional 1/day faction perks (`perk_substation_bypass`, `perk_sandton_liquidity`, `perk_zamazama_tunnels`, `perk_siu_subpoena`, `perk_red_guard_strike`).
- [x] **Branching NPC Dialogue Trees**: 5 fully interactive contact dialogue trees with stat checks, evidence presentation, and one-time intel rewards (*Advocate Nomsa Khumalo*, *Helena Van Niekerk*, *General Sibusiso Sithole*, *Mkhulu Sibanyoni*, *Vusi Sithole*).
- [x] **Highveld Conspiracy Board**: Added 7 Highveld pins and 5 red-string verified evidence links to `ConspiracyBoardModal`, with a dedicated `Highveld Web` mode.
- [x] **Endings & Keystone Extraction**: Authored 4 climactic narrative endings (`ending_highveld_siu_vindication`, `ending_highveld_red_blackout`, `ending_highveld_arbitrage_partner`, `ending_highveld_shaft_collapse`), extracting Keystone Dossier *Project Midas Highveld Coal Ledger* (`dossier_project_midas`) and automatically unlocking **Story 3: *Namaqua-Diamond***.
- [x] **10-Language Multilingual Parity & Test Suite**: 51 translation keys synchronized across all 10 official South African regional languages; dedicated 11-test suite in `engine/__tests__/story2Highveld.test.ts` (53/53 tests passing in Vitest, 0 TypeScript errors).

---

### Phase 23: Story 3 — Namaqua-Diamond ("The Desert Skeleton Coast") ✅
- [x] **Setting & Geography**: Port Nolloth, Alexander Bay, and Richtersveld Desert (Northern Cape) — 7 interactive map nodes (`d1_port_nolloth_jetty`, `d2_alexander_bay_quarry`, `d3_richtersveld_canyon`, `d4_debeers_ghost_mine`, `d5_orange_river_drift`, `d6_aegis_coastal_compound`, `d7_springbok_magistrate`) with custom SVG positioning, coastline banner, and sector divides.
- [x] **Protagonist & Prologue**: Captain Gideon "Giepie" Brand — Ex-maritime border enforcement diver and desert tracker with 3 unique playable backgrounds (*The Deep-Sea Diver*, *Kalahari Desert Tracker*, *Ex-Naval Infiltrator*) and a 3-scene narrative prologue.
- [x] **The Case & Mechanics**: *Operation Deep-Gravel* — 6 regional clocks (`atlantic_fog_clock`, `aegis_patrol_clock`, `desert_heat_clock`, `admiralty_investigation`, `decompression_hazard_clock`, `arms_drop_countdown`), Atlantic Malmokken fog stealth bonuses, and Richtersveld 46°C radiator heat penalties.
- [x] **Core Factions & Perks**: Implemented 5 Namaqua factions (`aegis_marine`, `artisanal_divers`, `kalahari_runners`, `namaqua_command`, `namib_syndicate`) with functional 1/day faction perks (`perk_diver_compression`, `perk_kalahari_fuel_drop`, `perk_sea_fisheries_impound`, `perk_namib_gem_valuation`, `perk_radar_scramble`).
- [x] **Branching NPC Dialogue Trees**: 5 fully interactive contact dialogue trees with stat checks, evidence presentation, and one-time intel/cash rewards (*Tannie Bettie van Zyl*, *Swartbooi Witbooi*, *Dirk "Oom Dirk" Coetzee*, *Colonel Yuri Petrov*, *Captain Annelize Cloete*).
- [x] **Namaqua Conspiracy Board**: Added 7 Namaqua pins and 6 red-string verified evidence links to `ConspiracyBoardModal`, with a dedicated `Namaqua Web` mode.
- [x] **Endings & Keystone Extraction**: Authored 4 climactic narrative endings (`ending_namaqua_naval_raid`, `ending_namaqua_divers_rebellion`, `ending_namaqua_diamond_flight`, `ending_namaqua_desert_dune_grave`), extracting Keystone Dossier *Table Bay Admiralty Manifest & Diamond Run* (`dossier_admiralty_manifest`) and automatically unlocking **Story 4: *Cape-Nocturne***.
- [x] **10-Language Multilingual Parity & Test Suite**: 74 translation keys synchronized across all 10 official South African regional languages (`en`, `zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`); dedicated 15-test suite in `engine/__tests__/story3Namaqua.test.ts` (68/68 tests passing in Vitest, 0 TypeScript errors).

---

### Phase 24: Story 4 — Cape-Nocturne ("The Shadow Oligarchy") ✅
- [x] **Setting & Geography**: Cape Town & The Winelands (Western Cape) — Camps Bay Atlantic strip, Long Street neon nightlife, Manenberg/Mitchells Plain gang tenements, Table Bay container docks, and historic Stellenbosch wine estates (7 map nodes `c1_long_street_strip` to `c7_provincial_police_hq`).
- [x] **Protagonist & Prologue**: Leila Hendricks — Former Anti-Gang Unit (AGU) detective turned private investigator with 3 unique playable backgrounds (*AGU Ballistics Detective*, *Cape Flats Underground Fixer*, *Winelands Forensic Auditor*) and a 3-scene narrative prologue.
- [x] **The Case & Mechanics**: *The Night-Economy Protection Racket & Cold War Arms Cache* — 6 regional clocks (`gang_turf_war_clock`, `cape_doctor_gale_clock`, `general_swart_manhunt`, `red_cipher_decryption`, `nightclub_extortion_clock`, `sovereign_arms_shipment`), Cape Flats gang warfare crossfire, Cape Doctor gales and blackout sea-mist, and Table Bay Berth 109 arms shipment countdown.
- [x] **Core Factions & Perks**: Implemented 5 Cape factions (`long_street_racket`, `cape_gang_federation`, `winelands_club`, `agu_renegades`, `dockers_union`) with functional 1/day faction perks (`perk_bouncer_shakedown`, `perk_flats_recon`, `perk_winelands_liquidity`, `perk_agu_ballistics`, `perk_dockers_blockade`).
- [x] **Branching NPC Dialogue Trees**: 5 fully interactive contact dialogue trees with stat checks, evidence presentation, and one-time intel/cash rewards (*Zack "The Bull" Rossouw*, *Pastor Ronald "Uncle Ronnie" Jacobs*, *Baroness Claudine de Villiers*, *Cassiem Petersen*, *Sergeant Warren Abrahams*).
- [x] **Cape Town Conspiracy Board**: Added 7 Cape Town pins and 6 red-string verified evidence links to `ConspiracyBoardModal`, with a dedicated `Cape Town Web` mode.
- [x] **Endings & Keystone Extraction**: Authored 4 climactic narrative endings (`ending_cape_sovereign_seizure`, `ending_cape_gang_truce`, `ending_cape_winelands_audit`, `ending_cape_shadow_execution`), extracting Keystone Dossier *The Grand Sovereign Protocol (The Red Cipher)* (`dossier_red_protocol`) and automatically unlocking **Story 5: *The Sovereign Octagon*** (Grand National Finale).
- [x] **10-Language Multilingual Parity & Test Suite**: 62 translation keys synchronized across all 10 official South African regional languages (`en`, `zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`); dedicated 16-test suite in `engine/__tests__/story4Cape.test.ts` (84/84 tests passing in Vitest, 0 TypeScript errors).

---

### Phase 25: Story 5 — The Sovereign Octagon ("The Grand National Finale") ✅
- [x] **Setting & Geography**: Multi-Theatre National Climax — Subterranean Drakensberg Cold War bunker (`o1`), Union Buildings Executive Crypt (`o2`), Apollo SCADA National Grid Control (`o3`), Durban & Table Bay Dual Port Redoubt (`o4`), Karoo Electronic Warfare Corridor (`o5`), Winelands Sovereign Vault (`o6`), and The Sovereign Octagon Summit Chamber (`o7`).
- [x] **Protagonist**: *The United Hawks Taskforce* — The player commands the united vanguard (Captain Nandi Ndlovu, Strike Lead Gideon Venter, Intelligence Operative Leila Patel) unifying the forensic dossiers from Stories 1–4.
- [x] **The Case**: *Operation Midnight Sun* — Total Stage 8 Black-Sky Grid Collapse countdown (`0/8`) and the planned authoritarian transfer of South African state sovereignty to the 8 corporate-state conspirators.
- [x] **Regional Mechanics**: Multi-Front National Operational Crisis Map with custom sector columns, 6 regional/national clocks, 5 national factions with daily tactical perks (`perk_taskforce_airlift`, `perk_constitutional_subpoena`, `perk_black_start_bypass`, `perk_mass_civil_mobilization`, `perk_signals_intercept_omega`), and master keystone dossier (`dossier_master_archive`).
- [x] **The 5 Grand Epilogues**:
  1. *The Constitutional Reckoning* (State salvaged via Constitutional Court trial)
  2. *The People's Revolution* (Mass civilian uprising dismantles tender mafia)
  3. *The Shadow Director* (Player usurps the Octagon to rule from the dark)
  4. *The Balkanized Republic* (National grid falls; country fractures into syndicate enclaves)
  5. *The Vanished Watchers* (Conspirators purged; taskforce disappears into the fog)
- [x] **10-Language Multilingual Parity & Test Suite**: 75 translation keys synchronized across all 10 official South African regional languages (`en`, `zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`) via `scripts/inject-phase25-translations.mjs`; dedicated 22-test suite in `engine/__tests__/story5Octagon.test.ts` (106/106 tests passing in Vitest, 0 TypeScript errors).

---

### Phase 26: Complete Anthology Visual Asset Generation (FAL.ai Flux Schnell) ✅
- [x] **Asset Architecture Plan**: Designed comprehensive master asset generation plan (`asset_generation_plan.md`) covering 57 custom graphic-novel noir assets across all four remaining campaigns.
- [x] **Story 2: Highveld-Chrome (14 Assets)**: Widescreen Johannesburg blackout key art (`story2_highveld_keyart.jpg`), 7 district node headers (`h1_braamfontein_safehouse.jpg` to `h7_siu_headquarters.jpg`), and 6 character portraits (*Bra K*, *Advocate Khumalo*, *Helena Van Niekerk*, *Vusi Sithole*, *Mkhulu Sibanyoni*, *General Sithole*).
- [x] **Story 3: Namaqua-Diamond (14 Assets)**: Widescreen Atlantic Skeleton Coast key art (`story3_namaqua_keyart.jpg`), 7 desert & coastal node headers (`m1_port_nolloth_jetty.jpg` to `m7_springbok_court.jpg`), and 6 character portraits (*Captain Giepie Brand*, *Tannie Bettie*, *Swartbooi Witbooi*, *Oom Dirk*, *Colonel Petrov*, *Captain Cloete*).
- [x] **Story 4: Cape-Nocturne (15 Assets)**: Widescreen Table Mountain & Long Street key art (`story4_cape_keyart.jpg`), 7 Cape Town node headers (`c1_long_street_strip.jpg` to `c7_foreshore_police_hq.jpg`), and 7 character portraits (*Leila Hendricks*, *Zack Rossouw*, *Pastor Ronnie*, *Baroness Claudine*, *Cassiem Petersen*, *Sergeant Warren Abrahams*, *Major-General Swart*).
- [x] **Story 5: The Sovereign Octagon (14 Assets)**: Widescreen Drakensberg summit & bunker key art (`story5_octagon_keyart.jpg`), 7 national crisis node headers (`o1_drakensberg_redoubt.jpg` to `o7_summit_sanctum.jpg`), and 6 character portraits (*Taskforce Lead*, *Justice Sindi Sithole*, *Minister Phumzile*, *Chief Engineer Kabelo*, *Bra Bheki & Cassiem Alliance*, *Lord Sterling & General Swart*).
- [x] **Game Code Wiring**:
  - `data/campaignStories.ts`: Connected dedicated 16:9 widescreen key art for all 5 stories.
  - `data/story2HighveldDialogues.ts`, `data/story3NamaquaDialogues.ts`, `data/story4CapeDialogues.ts`, `data/story5OctagonDialogues.ts`: Replaced placeholder avatar links with dedicated character portraits.
  - `components/EventModal.tsx`: Mapped all regional crisis & breakthrough events across all 5 stories to their corresponding node and character illustrations.
- [x] **Automation & Resumability**: Created `scripts/generate-remaining-story-assets.mjs` with exponential backoff, rate-limited batching (3 concurrent), and idempotency checks.

---

### Phase 26b: Complete Character Avatar & Asset Audit Integration ✅
- [x] **Full Asset Audit & Zero Missing References**: Conducted an automated audit across all `.ts` and `.tsx` source files in `components/`, `data/`, `engine/`, and `app/`. Successfully brought missing asset references from 16 broken paths down to **0 (100% verified asset presence on disk)**.
- [x] **Node Banner Filename Alignment (40/40 Nodes)**: Resolved filename divergences where dynamic `/assets/nodes/${activeNode.id}.jpg` loaders failed on Stories 2 through 5 (`h6_kendon_coal_depot`, all 7 Namaqua `d1`–`d7` nodes, 5 Cape Town nodes, and all 7 Octagon `o1`–`o7` nodes). Every single map node in the entire anthology now displays its high-resolution district banner illustration without 404s.
- [x] **Missing Visual Assets Generated via Fal.ai Flux Schnell (18 New Assets)**:
  - **12 Character Background Origin Cards (`public/assets/backgrounds/`)**: Generated rich 16:9 cinematic artwork for every playable character background in Stories 2 through 5 (*The SIU Whistleblower*, *The Deep Reef Fixer*, *The NIA Ghost Operative*, *The Deep Sea Diver*, *The Kalahari Desert Tracker*, *The Ex-Naval Infiltrator*, *AGU Ballistics Detective*, *Cape Flats Underground Fixer*, *Winelands Forensic Auditor*, *Captain Nandi Taskforce Director*, *Gideon Brand Tactical Vanguard*, *Leila Hendricks SIGINT Director*).
  - **6 Secondary & Lore Character Portraits (`public/assets/characters/`)**: Generated dedicated square portraits for all district contact roles and key lore murder victims (*Weighbridge Dispatcher*, *Artisanal Diver Shop Steward*, *Namib Pontoon Smuggler*, *Estate Cellar Master*, *Auditor Lerato Molefe*, *Detective David Damon*).
- [x] **Character Avatar Wiring Across All Systems**:
  - `components/GameDashboard.tsx`: Completely wired all 28 district nodes in `NODE_CONTACT_MAP` and all 25 factions in `FACTION_AVATARS` to high-resolution character portraits.
  - `components/PrologueScreen.tsx`: Wired prologue narrative speaker avatar resolution ladder to valid character portraits for all 5 stories.
  - `components/ConspiracyBoardModal.tsx`: Updated `HIGHVELD_PINS`, `NAMAQUA_PINS`, `CAPE_PINS`, and `NATIONAL_PINS` with dedicated character portrait bindings, including deceased victim memorials (`lerato.jpg`, `damon.jpg`).
- [x] **Live In-Browser & Automated Test Verification**:
  - Captured live browser screenshots confirming character avatars, prologue origin selection cards, and right drawer node headers render cleanly.
  - Vitest test suite passing 107/107 tests across all 7 test suites; 0 TypeScript compilation errors.

---

### Phase 26c: Regional Cartographic Maps & Marker Deconfliction ✅
- [x] **Regional Tactical Map Backgrounds (5/5 Maps via FAL.ai Flux Schnell)**:
  - Created `scripts/generate-map-backgrounds.mjs` and generated 5 high-resolution bespoke cartographic tactical map backgrounds (`public/assets/maps/`):
    - `map_ethekwini.jpg`: Coastal harbour, container berths, Umhlanga ridge, and illuminated CBD grid.
    - `map_highveld.jpg`: Johannesburg brutalist skyline, mining headgears, gold reefs, and substation grid.
    - `map_namaqua.jpg`: Richtersveld desert canyons, Atlantic diamond dredging coastline, and Orange River.
    - `map_cape.jpg`: Table Mountain, Atlantic Seaboard, Long Street neon nightlife, and Cape Flats grid.
    - `map_octagon.jpg`: Subterranean Drakensberg mountain redoubt, national power grid arteries, and Union Buildings.
- [x] **Map Marker Deconfliction & Coordinate Geometry**:
  - Re-anchored overlapping node coordinates across all 5 story campaign maps (e.g. deconflicted Braamfontein Loft and Hillbrow Substation in Gauteng, Long Street and Camps Bay in Cape Town, Port Nolloth Jetty and Alexander Bay Quarry in Namaqua).
  - Cleaned transit connection lines and sector dividers in `DistrictSvgMap.tsx` to prevent SVG overlap and maintain clear touch targets on mobile and desktop.

---

### Phase 26d: Complete Anthology Translation & Asset Completeness Audit ✅
- [x] **Empirical Asset Audit (100% Verified Presence)**:
  - Created `scripts/audit-translations-and-assets.mjs` verifying all 40 district node banners (`public/assets/nodes/`), 5 regional tactical maps (`public/assets/maps/`), 20 widescreen backgrounds (`public/assets/backgrounds/`), and 38 character avatars & faction crests (`public/assets/characters/`) with 0 broken references across the entire codebase.
- [x] **10-Language Translation Parity (1,836 Keys Each)**:
  - Injected all 27 newly introduced UI keys (map sectors, story-specific objective trackers, roadblock warnings, intro mode buttons) across all 10 official South African regional languages (`en`, `af`, `zu`, `xh`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`) via `scripts/inject-missing-ui-keys.mjs`.
  - Injected 6 missing prologue log keys in `nso`, `ss`, `st`, `tn`, `ts`, `ve`, `xh`, bringing all 10 language dictionaries to exact 1:1 parity at **1,836 canonical keys** each with `find-missing-keys.mjs` reporting **0 missing keys**.
- [x] **Comprehensive Quality & Regression Assurance**:
  - 107/107 unit tests passing across all 7 test suites in Vitest.
  - 0 TypeScript compilation errors (`npx tsc --noEmit`).

---

### Phase 26e: Standalone Capacitor Android App & Google Play Architecture ✅
- [x] **Next.js Static Export Architecture**: Configured `next.config.mjs` with `output: 'export'` and `images: { unoptimized: true }`, generating a completely standalone offline bundle (`out/`) containing all HTML, CSS, JS, and visual/audio assets.
- [x] **Capacitor 8 Integration & Configuration**:
  - Installed `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and native game plugins (`@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/haptics`).
  - Authored `capacitor.config.ts` targeting `com.mzansimidnight.game` with `webDir: 'out'`, dark status bar `#020617`, and offline asset serving via `https://localhost`.
- [x] **Native Android Project Generation & Gradle Build**:
  - Initialized native Gradle project in `android/` with Target SDK 36 (exceeding Google Play requirement API 34+).
  - Synchronized assets into `android/app/src/main/assets/public/` with 0 reliance on an external website or server.
  - Successfully compiled debug APK (`android/app/build/outputs/apk/debug/app-debug.apk` ~72MB with all 40 node banners, 5 regional maps, 20 backgrounds, and 38 character avatars).
- [x] **Hardware Integration & Native Bridge (`engine/nativeBridge.ts`)**:
  - Wired Android hardware back button to dismiss modals, deselect dice, or confirm exit.
  - Added native haptic rumble feedback on dice roll outcomes and threat alarms.
  - Added smooth native splash screen transition.
- [x] **Convenience Scripts & Publishing Documentation**:
  - Added `cap:sync`, `cap:open`, `cap:build`, and `cap:bundle` to `package.json`.
  - Authored comprehensive guide `docs/ANDROID_GOOGLE_PLAY_GUIDE.md` covering keystore generation, AAB bundle creation, and Google Play Console checklist.

---

### Phase 27: Ascending Adrenaline, Immersive Outcome Dispatches, Cutscenes & Cinematic Ending Scenes ✅
- [x] **Adrenaline & Tension Scaling Engine (`engine/adrenaline.ts`)**:
  - Implemented dynamic 5-tier Adrenaline calculation (`COVERT`, `ALERT`, `TENSION`, `CRITICAL`, `CLIMAX`) based on climax clock progression, threat clock saturation, composure depletion, and queued climax showdown events.
  - Added real-time HUD tension meter with live pulse indicators and scanner status.
  - Added full-screen tension edge vignette (`components/AdrenalineVignette.tsx`) that scales from dark noir into pulsing orange and rapid hazard crimson as danger spikes.
- [x] **Immersive In-Context Action Outcome Dispatches (`components/ActionOutcomeDispatch.tsx`)**:
  - Replaced the intrusive static notification banner that used to sit atop the action slot drawer and cause layout shifting.
  - Added in-slot outcome badges showing dice math and tier directly on the action card the player interacted with.
  - Added floating encrypted Hawks / SAPS radio scanner intercept card with adrenaline-responsive visuals, audio chirps, auto-dismiss countdown bar, and manual dismissal.
- [x] **Web Audio Adrenaline Soundscape Expansion (`engine/soundscape.ts`)**:
  - Added dynamic double-pulse heartbeat generator (`playHeartbeat`) scaling with adrenaline intensity.
  - Added encrypted tactical scanner squelch (`playScannerSquelch`).
  - Added cinematic cutscene brass/bass stinger chords (`playCutsceneStinger`).
  - Added escalated action outcome audio (`playAdrenalineOutcome`) scaling with adrenaline level.
- [x] **Cinematic Widescreen Cutscenes (`types/cutscenes.ts`, `data/cutscenes.ts`, `components/CutsceneModal.tsx`)**:
  - Authored full-screen 2.39:1 letterboxed cinematic cutscenes with Ken Burns slow-zoom for all 5 regional climaxes:
    - Story 1: *The Iron Convoy at Berth 14* (`cutscene_berth14_breach`)
    - Story 2: *The Megawatt Overload* (`cutscene_kendon_sabotage`)
    - Story 3: *Midnight Off Port Nolloth* (`cutscene_namaqua_drop`)
    - Story 4: *Gale-Force Strike at Berth 109* (`cutscene_cape_dockers`)
    - Story 5: *Breaching the Drakensberg Redoubt* (`cutscene_octagon_bunker`)
  - Multi-beat narrative typewriter delivery, speaker portraits, location timecodes, keyboard navigation (`Space`/`Enter`/`Esc`), and seamless climax showdown event launching.
- [x] **Cinematic Multi-Phase Ending Scenes (`components/EndingScreen.tsx`)**:
  - Redesigned the ending screen from a plain modal into an unforgettable cinematic multi-stage experience with dedicated 16:9 widescreen artwork.
  - 3 interactive epilogue phases: `01 // CINEMATIC SCENE` (widescreen artwork, summary quote, epilogue paragraphs), `02 // DISTRICT AFTERMATH` (district power shifts, final faction standing), and `03 // FIXER EVALUATION` (leaderboard, global percentile, tactical commendation badges).
- [x] **FAL.ai Flux Schnell Visual Asset Generation (14 New Cinematic Assets)**:
  - Generated 5 widescreen climax cutscene illustrations (`public/assets/cutscenes/*.jpg`).
  - Generated 9 widescreen ending scene epilogue illustrations (`public/assets/endings/*.jpg`).
  - 100% verified asset presence on disk.
- [x] **10-Language Multilingual Parity & Full Test Suite (115/115 Tests Passing)**:
  - Injected 17 new translation keys across all 10 official South African regional languages (`en`, `zu`, `xh`, `af`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`), maintaining exact 1:1 parity (1,853 canonical keys each) with 0 missing keys.
  - Added dedicated Vitest test suite `engine/__tests__/adrenalineAndCutscenes.test.ts` (115 passing tests across 8 test suites).

---

### Phase 27b: Host Africa HCODE & Cloud PaaS Runtime Hardening ✅
- [x] **Resolved Host Africa HCODE "Runtime Quota Conflict"**:
  - Identified root cause: `next.config.mjs` was configured with `output: 'export'` for Capacitor Android static generation, which caused standard `npm start` (`next start`) to fail with exit code 1 (`"next start" does not work with "output: export"`).
  - Rapid supervisor restart loops on HCODE triggered process limit throttling, container resource collisions, and "runtime quota conflict" rejections.
- [x] **Zero-Dependency Native Production Web Server (`server.mjs`)**:
  - Implemented high-performance, low-memory Node.js HTTP server (`node:http`, `node:fs`, `node:zlib`) that serves the pre-rendered `out/` static directory on `0.0.0.0:${PORT:-3000}`.
  - Ultra-low memory footprint: ~25MB to 30MB RAM (<5% of a 512MB HCODE plan quota), preventing memory quota exhaustions.
  - Built-in `/healthz` and `/api/health` endpoints returning HTTP 200 uptime telemetry for container supervisors.
  - Graceful `SIGTERM` and `SIGINT` signal trapping to eliminate dangling process locks and port collision errors.
- [x] **Runtime Version & Engine Constraints (`package.json`)**:
  - Locked Node version (`"engines": { "node": ">=18.18.0", "npm": ">=9.0.0" }`) to prevent runtime mismatches on HCODE buildpacks.
  - Updated `"start": "node server.mjs"`.
- [x] **Multi-Stage Containerization (`Dockerfile` & `.dockerignore`)**:
  - Added ultra-lean Alpine multi-stage Docker build (~75MB) with non-root security user and automated healthcheck for HCODE Docker deployments.

---

### Phase 27c: Full 11-Language Official Multilingual Expansion (isiNdebele `nr`) ✅
- [x] **11th Official Language Integration (`nr` — isiNdebele)**:
  - Extended `types/settings.ts` to include `'nr'` in `SupportedLanguage` and added Southern Ndebele to `SUPPORTED_LANGUAGES` (`isiNdebele`, `Mpumalanga & Gauteng`).
  - Integrated `nr.json` into `engine/i18n.ts` runtime bundle and reactive translation engine (`DICTIONARIES.nr`).
- [x] **Gemini Flash Translation Pipeline (`scripts/translate-ndebele.mjs`)**:
  - Engineered an automated Gemini translation pipeline utilizing `GEMINI_API_KEY` with authentic South African crime noir dialect prompting, standard Southern Ndebele orthography (relative `-ko`, `tj`/`tjh` phonology), and exponential backoff retry.
  - Translated all 2,041 canonical master strings into `data/i18n/nr.json`, achieving 100% 1:1 key parity (0 missing keys vs `en.json`).
  - Updated `scripts/translate-game-data.mjs` with `nr` in `TARGET_LANGUAGES` and authentic `SA_NOIR_GLOSSARY`.
- [x] **Test Suite & Verification Suite**:
  - Updated `engine/__tests__/i18n.test.ts` to test all 11 official South African languages, verifying `nr` language info and authentic in-game string resolution.
  - Verified 100% key parity across all 11 languages with `scripts/audit-translations-and-assets.mjs`.

---

### Phase 27d: Privacy Policy, POPIA Compliance & Store Listing Readiness ✅
- [x] **Dedicated Privacy Policy Route (`app/privacy/page.tsx`)**:
  - Prerendered static web route at `/privacy` (`out/privacy.html`) fulfilling statutory compliance for South Africa's **Protection of Personal Information Act, 2013 (Act 4 of 2013) ("POPIA")**, **GDPR**, and the Google Play Developer Policy.
  - Explicit disclosures covering local device offline storage (`localStorage`), optional Google OAuth & Supabase cloud backup, public leaderboard records, Web Audio synthesis (zero microphone access), and zero third-party tracking or advertising.
  - Complete data erasure protocol under POPIA Section 24 and GDPR Article 17, and South African Information Regulator contact details.
- [x] **In-Game Accessibility Across All Surfaces**:
  - Main menu footer link (`components/TitleIntroScreen.tsx`).
  - Settings Modal section `05 // Privacy & POPIA Compliance` (`components/SettingsModal.tsx`).
  - User Profile & Cloud Backup Modal privacy disclosure (`components/UserProfileModal.tsx`).
  - Updated `docs/ANDROID_GOOGLE_PLAY_GUIDE.md` with package ID `za.co.mzansimidnight.app` and privacy checklist.
- [x] **Automated Statutory Compliance Tests (`engine/__tests__/privacy.test.ts`)**:
  - Added dedicated test suite verifying POPIA, GDPR, Responsible Party, and UI linkage requirements (8 tests passing).

---

### Phase 27e: Mobile Tactical Dispatch Ticker, Blocked Action Notifications & Insufficient Funds UX ✅
- [x] **Unified Blocked Roll & Action Feedback (`components/ActionOutcomeDispatch.tsx`)**:
  - Added `'blocked'` tier alongside `'clean'`, `'compromised'`, and `'failure'`.
  - Elevated HUD card to `z-50` with high-visibility amber warning glow, countdown auto-dismiss bar, and actionable `REQUIRED TO UNBLOCK` guidance.
- [x] **Proactive Insufficient Funds UI in Node Action Drawer (`components/GameDashboard.tsx`)**:
  - Added `cannotAffordCash` detection across slot cards.
  - Replaced misleading active buttons with proactive warning cards: `⚠️ INSUFFICIENT FUNDS (Short R{shortfall})`.
  - Highlighted slot cost in warning red with shortfall indicators.
- [x] **In-Slot Pulse Badges & Clear Precondition Guidance**:
  - On blocked rolls, the clicked slot card pulses with `⚠️ ACTION BLOCKED: [INSUFFICIENT FUNDS [R150 / R400]]` directly beneath the title.
  - Detailed narrative explanations for SAPS Roadblock quarantines, Stage 6 Blackout lockouts, and missing evidence/gear.
  - Helpful hint provided when tapping slots without selecting a die first (`NO DIE SELECTED`).
- [x] **Mobile Live Tactical Scanner / Dispatch Ticker**:
  - Added persistent single-line dispatch ticker below mobile tabs displaying the latest `state.activeLog[0]` police scanner message across all 3 mobile tabs (Map, Actions, Clocks).
  - Included one-tap `Log →` shortcut to switch directly to the full Comms Log on the Map tab.
- [x] **Automated Tests (`engine/__tests__/diceNotifications.test.ts`)**:
  - 5 tests verifying blocked action state, roadblock/blackout behavior, and UI rendering (137/137 tests passing across 11 test suites).

---

### Phase 27f: Mobile Responsiveness, Tactical Map Beacons & HUD Menu Optimization ✅
- [x] **District Map Mobile Node Collision Elimination (`components/DistrictSvgMap.tsx`)**:
  - Replaced wide rectangular HTML cards (`w-28` to `w-44`), which collided and stacked on top of one another on mobile viewports (<640px), with tactile, circular **Tactical Beacon Pins** (`w-9 h-9` / `w-10 h-10`).
  - Centered exactly on the node's `(x, y)` coordinate with glowing faction border rings, high-contrast node alphanumeric code (`N1`–`N12`, `H1`–`H7`, `O1`–`O7`), golden location radar pulse (`★`), and micro-indicators for Stage 6 lockout (`⚡`), diesel (`D`), or stealth bonus (`+2`).
  - Adjacent nodes now have >70px clearance on standard 360px–412px viewports with zero overlap.
  - Locked leads render as dimmed dashed circular beacons with lock icons (`🔒`).
- [x] **Mobile Active Node Focus Bar (`components/DistrictSvgMap.tsx`)**:
  - Docked at the bottom of the map on mobile viewports: displays selected node's title, district, faction pill, `HERE` status, available slots, and a direct `ACTIONS →` CTA that transitions seamlessly to the actions tab (`onInspectNode`).
  - Preserved rich, multi-line cards on tablet and desktop screens (`sm:` and `lg:`).
  - Configured responsive container minimum height (`min-h-[290px] xs:min-h-[320px] sm:min-h-[360px]`) and enabled vertical scrolling (`overflow-y-auto lg:overflow-hidden`) on mobile.
- [x] **Top Header HUD Zero-Overflow Redesign (`components/GameDashboard.tsx`)**:
  - **Row 1**: Dedicated two-sided layout separating mission cycle, tension/adrenaline meter, and load shedding stage on the left from cash (`R{cash}`) and composure bar on the right with strict non-wrapping spacing.
  - **Row 2**: Consolidated the 4 loose investigator attributes (`STRT`, `DCKT`, `WIRE`, `INFL`) into a unified, sleek tactical chip alongside the elapsed speedrun stopwatch (`⏱️ 00:00`), taking under 190px of width. Added compact quick actions (`◈ BOARD`, `💾 SAVE`, direct `⚙` Settings shortcut, and `☰ OPS`).
  - **Desktop/Tablet Responsive Collapse (1024px–1440px)**: Secondary buttons (`SCORES`, `STATUS`, `GUIDE`, `SETTINGS`) collapse text labels on 1024px–1279px, expanding on wide screens (`xl:`, `2xl:`), preventing horizontal spilling.
- [x] **Conspiracy Board Mobile Pin Scaling (`components/ConspiracyBoardModal.tsx`)**:
  - Scaled pin cards on mobile from `w-36` down to `w-28 xs:w-32 sm:w-48` with compact typography and pushpins, eliminating card collisions on the corkboard canvas.
- [x] **Automated Architecture Test Suite (`engine/__tests__/mobileMapAndHud.test.ts`)**:
  - 5 tests verifying node tactical code generation, cartographic coordinate boundaries across all 5 story campaigns, 4-attribute chip string length (<45 chars), localized focus bar data, and callback invocation (142/142 tests passing across 12 test suites).

---

### Phase 28: Voiceover Stems & Audio Atmosphere Expansion ✅
- [x] **Regional Procedural Soundscape Engine (`engine/soundscape.ts`)**:
  - Implemented real-time Web Audio procedural synthesis tailored to each of the 5 campaign stories:
    - **Story 1 (eThekwini-Gold)**: Coastal subtropical rain (950Hz bandpass), 55Hz Eskom substation hum, and deep 110Hz/138.59Hz minor harbor foghorn.
    - **Story 2 (Highveld-Chrome)**: Lowpass summer thunder rumble (240Hz), 88Hz industrial mining winch hum, and rolling thunder crack down to 34Hz.
    - **Story 3 (Namaqua-Diamond)**: Atlantic swept desert wind (480Hz bandpass), 44Hz Benguela surf swell drone, and 698.46Hz Alexander Bay bronze fog bell.
    - **Story 4 (Cape-Nocturne)**: Resonant Cape Doctor gale (1150Hz bandpass, Q=4.2), 65Hz nocturnal city grid drone, and 1480Hz/1920Hz street whistle.
    - **Story 5 (Sovereign Octagon)**: Underground bunker HVAC airflow (160Hz lowpass), 38Hz Cold War sub-bass drone, and alternating 880Hz/660Hz SCADA emergency klaxons.
  - Added smooth cross-fading via `setRegionalAtmosphere(storyId, { loadSheddingStage, adrenalineLevel })` that adapts to Load Shedding Stage 6 blackouts and high adrenaline peaks.
  - Added `playBlockedWarning()` for distinctive tactile audio feedback when actions are blocked (insufficient cash, locked corridors, or blackouts).
- [x] **Multilingual Voice Stabs & Acoustic Earcons Registry (`engine/voiceStems.ts`)**:
  - Registered 17 authentic NPC voice profiles across South African languages with dual-bandpass formant synthesis (throat F1 cavity & mouth F2 cavity driven by glottal pulse oscillators):
    - **Bra Bheki** (*"Sho, mfowethu"*, folder snap earcon, 105Hz baritone).
    - **Constable Nandi** (*"Sbu..."*, tactical radio squelch earcon, 220Hz whisper).
    - **Brigadier Mokoena** (*"Hawu..."*, TRT police chirp earcon, 115Hz command).
    - **Ma-Sibi Khumalo** (*"Sawubona"*, luxury penthouse chime earcon, 195Hz soprano).
    - **Sparks** (*"Signal's live"*, 1200-baud modem burst earcon, 155Hz chatter).
    - **Zuko Ndlovu** (*"Heita"*, harbor kingpin drawl, 98Hz bass).
    - **Colonel van der Merwe** (*"Middag"*, mechanical typewriter strike earcon, 110Hz).
    - **Bra K Molefe** (*"Dumela"*, forensic auditor dossier snap, 125Hz).
    - **Nomsa Khumalo** (*"Agee"*, advocate boardroom chime, 210Hz).
    - **Vusi Sithole** (*"Heita da"*, union strike whistle/chirp, 130Hz).
    - **Tannie Bettie** (*"Môre, seun"*, coastal fog bell earcon, 185Hz).
    - **Swartbooi Witbooi** (*"Goeiedag"*, desert runner radio squelch, 110Hz).
    - **Colonel Petrov** (*"Petrov here"*, naval privateer chirp, 95Hz).
    - **Pastor Ronnie** (*"Aweh, my broe"*, Cape Flats street truce whistle, 120Hz).
    - **Zack Rossouw** (*"Wat soek jy?"*, bouncer shakedown rasp, 100Hz).
    - **Claudine de Villiers** (*"Bonsoir"*, winelands aristocratic chime, 230Hz).
    - **Hawk Taskforce** (*"Protocol verified"*, bunker satellite scrambler, 135Hz).
  - Built `resolveContactVoiceProfile(contactOrNodeId)` mapping both raw contact keys and all district map node IDs across all 5 stories with fallback handling.
- [x] **UI & Gameplay Integration (`components/ContactDialogueModal.tsx` & `components/GameDashboard.tsx`)**:
  - Automatically triggers character voice stabs on opening dialogue modal with interactive `🔊 "[Greeting]"` replay pill in the header.
  - Synchronizes regional soundscape atmosphere across active story IDs, load shedding transitions, and adrenaline shifts.
  - Linked `playBlockedWarning()` to dice assignment shortfall dispatches.
- [x] **Automated Test Suite & Verification (`engine/__tests__/soundscapeAndVoiceStems.test.ts`)**:
  - 10 comprehensive unit tests covering formant parameters, earcons, fuzzy resolvers across all 5 stories, regional acoustics, and non-blocking headless execution (152/152 tests passing across 13 test suites).
  - TypeScript validation passed (`tsc --noEmit`), Next.js static build verified (`npm run build`), and Android assets synced (`npx cap sync android`).



