# Story Translation & Localization Blueprint

> **A Complete Developer Reference for Multi-Language Narrative Expansion in Mzansi Midnight**

This document catalogues every translated component, schema convention, runtime hook, and dictionary namespace in the *Mzansi Midnight* engine. When creating a second story (e.g. Act 3, a prequel, or a new regional campaign such as Johannesburg or Cape Town), follow this blueprint to guarantee that 100% of all UI, dialogue, game logs, and forensic items translate seamlessly across South Africa's official languages.

---

## 1. Architectural Overview

Mzansi Midnight uses a high-fidelity localization system designed for all **11 official South African languages** (English canonical master + Afrikaans, isiZulu, isiXhosa, Sesotho, Sepedi, Setswana, Xitsonga, siSwati, Tshivenḓa, and isiNdebele).

### Dual-Layer Localization Pipeline
1. **Static UI & Component Layer (`t(key, fallback, lang)`)**:
   Used inside React components to dynamically resolve text from the active language dictionary (`data/i18n/{lang}.json`). If a key is missing in a regional language, it falls back to the English dictionary, and finally to the developer fallback parameter.
2. **Dynamic Retrospective Engine Layer (`getLocalizedLogEntry`, `EN_REVERSE_MAP`)**:
   In-game logs (`activeLog`) record canonical narrative outcomes (such as dice rolls `[Roll 6 -> 8] Cross-Reference Docket #409: You trace the payments...` or background picks). The engine uses a reverse map (`EN_REVERSE_MAP`) to translate past logs into whatever language the player currently switches to in real time, even retroactively.

---

## 2. Catalog of All Translated Components & Elements

Below is the complete inventory of all UI components, modals, drawers, and gameplay surfaces that display localized story content:

### A. Core HUD & Dashboard (`components/GameDashboard.tsx`)
| UI Area | Element | Translation Method / Key |
| :--- | :--- | :--- |
| **Top Header** | Act, Cycle, Status button | `t('ui.cycle')`, `t('ui.status')` ("STATUS", "ISIMO", "BOEMO", etc.) |
| **Top Header** | Load Shedding Stage Badge | `t('ui.stage')`, `t('ui.load_shedding')` |
| **Left Panel** | Tactical Advisor Card | `getLocalizedRecommendation(rec, currentLang)` |
| **Left Panel** | Segmented Threat Clocks | `getLocalizedClockTitle(clock.id, clock.title, currentLang)` |
| **Left Panel** | 1/Day Faction Tactical Calls | `t('perk.<id>.name')`, `t('perk.<id>.desc')`, `t('ui.faction_calls')` |
| **Center Map** | District Node Markers & Tooltips | `getLocalizedNode(node, currentLang)` (`node.<id>.title`, `node.<id>.district`, `node.<id>.desc`) |
| **Center Map** | Map Legends & Warning Badges | `t('ui.active_corridor')`, `t('ui.saps_roadblock')`, `t('ui.stage6_offline')` |
| **Bottom Dock** | Dice Selection Prompts | `t('ui.select_die_prompt')` ("Select a die in bottom dock..."), `t('ui.drag_or_tap')` |
| **Bottom Dock** | End Cycle / Sleep Button | `t('ui.end_cycle')`, `t('ui.end_cycle_desc')` |
| **Bottom Dock** | Metro Dispatch & Comms Log | `getLocalizedLogEntry(entry, currentLang)` (translates dice rolls, perks, prologue choices, and crises) |
| **Right Drawer** | Contact Banner (Avatar & Name) | `getLocalizedContactName(activeNode.id, nodeContact.name, currentLang)` |
| **Right Drawer** | Contact Role Title | `getLocalizedContactRole(activeNode.id, nodeContact.role, currentLang)` (e.g. "Commission Evidence Leader • DPCI Hawks") |
| **Right Drawer** | Action Slot Stat Header | `t('ui.stat')`: `getLocalizedStatName(slot.stat, currentLang)` ("Any", "Dockets", "Influence", "Wire", "Street") |
| **Right Drawer** | Slot Title & Narrative Description | `locSlot.title`, `locSlot.description` (`slot.<id>.title`, `slot.<id>.desc`) |
| **Right Drawer** | Required Evidence Lead | `t('ui.requires')`: `getLocalizedItemName(slot.requiredItem, currentLang)` |
| **Right Drawer** | Stage 6 Blackout Cover Bonus | `t('ui.stage6_blackout_cover')`: +X `t('ui.roll_bonus')` |
| **Right Drawer** | 3-Tier Outcome Matrix Preview | 6+ `t('ui.clean')`, 4–5 `t('ui.risky')`, 1–3 `t('ui.fail')` with `formatLocalizedOutcomeSummary` |
| **Right Drawer** | Black-Market Hardware Shop | `getLocalizedItemName(item.id, currentLang)`, `getLocalizedItemEffect(item.id, currentLang)` |

### B. Prologue Screen (`components/PrologueScreen.tsx`)
| Element | Description | Translation Key Pattern |
| :--- | :--- | :--- |
| **Character Background Cards** | Title, Former Unit, Tagline, Description | `bg.<id>.title`, `bg.<id>.former_unit`, `bg.<id>.tagline`, `bg.<id>.desc` |
| **Selection Buttons & Banner** | Card select buttons, active badge & confirmation banner | `prologue.select_this_bg` ("Select This Background: {title}"), `prologue.choose_bg`, `prologue.chosen_path` |
| **Dialogue Options (Beat 1)** | Option labels with stats bonus | `pnode_opt.pick_forensic.label`, `pnode_opt.pick_breacher.label`, `pnode_opt.pick_intel.label` |
| **Background Selected Log** | Narrative comms log entry | `ui.background_selected`: `bg.<id>.title` (`bg.<id>.former_unit`) |
| **Prologue Narrative Beats** | Narrative text, Speaker names, Dialogue responses | `prologue.scene.<nodeId>.text`, `prologue.choice.<choiceId>.text` |
| **Stat Check Badges** | Stat requirements | `t('ui.stat_check')`: `getLocalizedStatName(stat, lang)` |

### C. Help Guide & Field Rules (`components/TutorialOverlay.tsx`)
| Step | Field | Translation Key Pattern |
| :--- | :--- | :--- |
| **All Steps (1–6)** | Header Badge | `tutorial.step<N>.badge` (e.g. `STEP 1 OF 6 // BOTTOM BAR & ADVISOR`) |
| **All Steps (1–6)** | HUD Zone Pill | `tutorial.step<N>.zone` (e.g. `Daily Action Dice, Composure & Tactical Advisor`) |
| **All Steps (1–6)** | Step Title & Description | `tutorial.step<N>.title`, `tutorial.step<N>.desc` |
| **All Steps (1–6)** | Actionable Bullet Points (3–4 per step) | `tutorial.step<N>.bullet1`, `tutorial.step<N>.bullet2`, `tutorial.step<N>.bullet3` |

### D. Conspiracy Board / Mind-Map (`components/ConspiracyBoardModal.tsx`)
| Entity | Field | Translation Key Pattern |
| :--- | :--- | :--- |
| **Board Header & Verification Counter** | Top Header & Counter Banner | `board.header`, `board.links_verified` (e.g. `ROOI-TOU SAAMSWERINGSBORD // {count} / {total} SKAKELS BEVESTIG`) |
| **Act Switcher & Web Titles** | Act 1 & Act 2 Web Titles & Subtitles | `board.act1_title`, `board.act2_title`, `board.act1_web`, `board.act2_web` |
| **Board Navigation & Badges** | Close key, status badges, exhibit link | `board.esc` (`[ESC]`), `board.verified_link`, `board.unverified_lead`, `board.open_exhibit`, `board.tip` |
| **Act 1 Pins (7 Suspects & Assets)** | Tag, Title, Role, Summary Bio | `board.pin.pin_sithole.*`, `board.pin.pin_auditor_phone.*`, `board.pin.pin_masibi.*`, `board.pin.pin_zuko.*`, `board.pin.pin_berth14.*`, `board.pin.pin_hawks_safehouse.*`, `board.pin.pin_hawks_case.*` |
| **Act 1 Red-String Links (6 Ties)** | Label, Verified Explanation, Unverified Hint | `board.link.link_docket_409.*`, `board.link.link_auditor_phone.*`, `board.link.link_masibi_shell.*`, `board.link.link_zuko_shell.*`, `board.link.link_mokoena_berth14.*`, `board.link.link_hawks_case.*` |
| **Act 2 Pins (6 Suspects & Assets)** | Tag, Title, Role, Summary Bio | `board.pin.pin_act1_legacy.*`, `board.pin.pin_act2_masibi.*`, `board.pin.pin_act2_trust.*`, `board.pin.pin_act2_bheki.*`, `board.pin.pin_act2_zuko.*`, `board.pin.pin_act2_hangar7.*` |
| **Act 2 Red-String Links (5 Ties)** | Label, Verified Explanation, Unverified Hint | `board.link.link_act2_carryover.*`, `board.link.link_act2_deed_masibi.*`, `board.link.link_act2_deed_hangar.*`, `board.link.link_act2_telemetry_depot.*`, `board.link.link_act2_crates_tarmac.*` |
| **Forensic Inspector Exhibit Button** | Linked Classified Inventory Item | `getLocalizedItemName(itemId, itemObj?.title || itemId, lang)` (resolves exhibit title in player's language) |

### E. Mission Status & Case File (`components/MissionStatusModal.tsx`)
| Section | Field | Translation Key Pattern |
| :--- | :--- | :--- |
| **Header & Cycle** | Act Case File Title, Cycle, Close button | `mission.act1_title`, `mission.act2_title`, `mission.cycle`, `mission.close` |
| **Tabs (01–04)** | Tab Labels | `mission.tab_objective`, `mission.tab_faq`, `mission.tab_clocks`, `mission.tab_inventory` |
| **Campaign Progress** | 3-Step Milestone Pills | `mission.campaign_progress`, `mission.step_x_of_y`, `mission.crack_1st_exhibit`, `mission.secure_2nd_exhibit`, `mission.launch_grand_finale` |
| **Tactical Recommendation** | Dynamic Headline, Hint, Action Button | `getLocalizedRecommendation(rec, lang)` (`advisor.badge.*`, `advisor.headline.*`, `advisor.hint.*`, `advisor.action.*`) |
| **How You Win** | Act 1 & Act 2 Win Conditions | `mission.how_you_win`, `mission.how_to_win_act1`, `mission.how_to_win_act2` |
| **FAQ & Field Manual** | 5 In-Depth Narrative Questions & Answers | `mission.faq_q1` to `mission.faq_q5`, `mission.faq_a1` to `mission.faq_a5` |
| **Active Clocks List** | Clock Titles & Status | `getLocalizedClockTitle(clock.id, clock.title, lang)` |
| **Evidence Dossier** | Exhibit Names, Categories & Inspect Button | `getLocalizedItemName(id, lang)`, `mission.inspect`, `mission.no_evidence` |

### F. Contact Dialogues & Notifications (`components/ContactDialogueModal.tsx`)
| Entity | Translation Hook / Key |
| :--- | :--- |
| **Speaker Name & Role** | `dialogue.<nodeId>.name`, `dialogue.<nodeId>.role` (with fallback to `getLocalizedTextByEnglishValue`) |
| **Stage Direction / Speaker Mood** | `dialogue.<nodeId>.<dnodeId>.mood` with fallback to `getLocalizedTextByEnglishValue(dnode.speakerMood, lang)` (43 stage directions across all contacts) |
| **Spoken Paragraphs** | `dialogue.<nodeId>.<dnodeId>.p<N>` |
| **Response Line Selector Header** | `t('dialogue.select_response', 'Select Interrogation / Response Line (0 Dice Cost)', lang)` |
| **Player Choice Responses** | `dialogue_resp.<resp.id>.label` |
| **Stat Requirements** | `t('ui.stat_check')`: `getLocalizedStatName(resp.requiredStat.stat, lang) >= {min}` |
| **Required Evidence Item** | `t('dialogue.evidence')`: `getLocalizedItemName(resp.requiredItem, lang)` |
| **Required Faction Standing** | `getLocalizedFactionName(resp.requiredFactionRep.factionId, lang)` `t('dialogue.rep') >= +{min}` |
| **One-Time Intel Reward Tag** | `★ {t('dialogue.one_time_intel')}: {resp.rewardSummary}` (localized through `getLocalizedTextByEnglishValue`) |
| **Intel Claim Feedback Banner** | `t('dialogue.intel_secured', 'INTEL SECURED:', lang)` + `{getLocalizedTextByEnglishValue(lastClaimedBanner, lang)}` |
| **Banner Dismiss Button** | `t('ui.dismiss', 'Dismiss', lang)` |
| **Already Claimed Badge** | `t('dialogue.intel_claimed', '✓ Intel Already Claimed', lang)` |
| **Locked Line Indicator** | `t('dialogue.locked', 'LOCKED', lang)`: `{lockReason}` |
| **Exit / Escape Key** | `t('dialogue.esc', '✕ ESC', lang)` |

### F2. Left Menu & Threat Clocks (`components/ThreatClock.tsx` & `components/GameDashboard.tsx`)
| Entity | Translation Hook / Key |
| :--- | :--- |
| **Clock Types** | `clocks.type_threat` ("Threat Clock"), `clocks.type_opportunity` ("Investigation"), `clocks.type_world` ("Finale Countdown") |
| **Clock Advancement Triggers** | `clocks.on_heat` ("On Heat"), `clocks.on_roll` ("On Roll"), `clocks.daily` ("+1 / Cycle") |
| **Investigation Clock Titles** | `clock.audit_docket_409.title` ("Audit Docket #409" -> "Oudit Dossier #409" / "Ukuhlolwa Kwe-Docket #409") |
| **Evidence & Gear Dossier Header** | `t('ui.evidence_dossier', 'Evidence & Gear Dossier', lang)` |
| **Evidence Dossier Tap Prompt** | `t('ui.tap_to_inspect', 'Tap to inspect', lang)` |
| **Top Menu Return Button** | `t('ui.menu', 'MENU', lang)` ("KIESLYS", "IMENU", "LENANE", etc.) |
| **Whistleblower Roles** | `role.whistleblower`, `role.wounded_whistleblower`, `dialogue.n1_safehouse.role`, `pnode.scene_3_the_ambush.role`, `event.evt_nandi_critical.role` |
| **Prologue Action Feedback Banner** | `getLocalizedLogEntry(lastFeedback, lang)` (`prologue.log.fake_disaster`, `prologue.log.bolt_deadlocks`, etc.) |
| **Stat Requirement Tag (Prologue)** | `{t('ui.requires')} {getLocalizedStatName(opt.statCheck.stat, lang)} +{threshold}` |

### G. Crises & Narrative Events (`components/EventModal.tsx`)
| Entity | Translation Hook |
| :--- | :--- |
| **Event Title & Speaker** | `event.<id>.title`, `event.<id>.speaker` |
| **Event Description Body** | `event.<id>.desc` |
| **Choice Options** | `choice.<id>.text`, `choice.<id>.log` |

### H. Endings & Climax (`components/ClimaxResolutionModal.tsx`)
| Entity | Translation Hook |
| :--- | :--- |
| **Ending Headline & Title** | `ending.<id>.headline`, `ending.<id>.title` |
| **Epilogue Narrative Body** | `ending.<id>.desc` |
| **Aftermath Report** | `ending.<id>.aftermath` |

### I. Mission Status & Field Rules (`components/MissionStatusModal.tsx`)
| Entity | Translation Hook |
| :--- | :--- |
| **Modal Header & Act Titles** | `mission.act1_title`, `mission.act2_title`, `mission.cycle`, `mission.close` |
| **Tab Navigation Labels** | `mission.tab_objective`, `mission.tab_faq`, `mission.tab_clocks`, `mission.tab_inventory` |
| **How You Win (Act 1 & 2)** | `t('mission.how_to_win_act1')`, `t('mission.how_to_win_act2')` (rendered with `dangerouslySetInnerHTML` to preserve styled color spans) |
| **FAQ Q1–Q5 Titles & Answers** | `mission.faq_q1_title` – `mission.faq_q5_title`, `mission.faq_q1_body` – `mission.faq_q5_body` |
| **Clock Types & Advance Rules**| `mission.segmented_clocks_active`, `mission.clock_type_action`, `mission.clock_type_world`, `mission.clock_advances_daily`, `mission.clock_advances_rolls` |
| **Classified Exhibits & Categories** | `mission.classified_exhibits_header`, `item_category.gear`, `item_category.evidence`, `item_category.exhibit` |

### J. End Cycle Overnight Simulation (`components/EndCycleModal.tsx`)
| Entity | Translation Hook |
| :--- | :--- |
| **Unused Dice Warnings** | `endcycle.unused_dice_title`, `endcycle.unused_dice_desc` |
| **All Dice Spent Status** | `endcycle.all_dice_spent_title`, `endcycle.all_dice_spent_desc` |
| **Overnight Shift Steps** | `endcycle.overnight_sim_title`, `endcycle.threat_clocks_advance`, `endcycle.trigger_alert`, `endcycle.no_threat_clocks`, `endcycle.grid_rotation_label`, `endcycle.dawn_intel_label`, `endcycle.dawn_intel_desc`, `endcycle.dice_pool_label`, `endcycle.dice_pool_desc` |
| **Confirmation Buttons** | `endcycle.stay_awake_cancel`, `endcycle.confirm_sleep` |

### K. Top HUD Bar & Stat Abbreviations (`components/GameDashboard.tsx`)
| Entity | Translation Hook |
| :--- | :--- |
| **Stat Abbreviations** | `stat_abbr.street` (`STRT`), `stat_abbr.dockets` (`DCKT`), `stat_abbr.wire` (`WIRE`), `stat_abbr.influence` (`INFL`) |
| **Diesel Generator Controls** | `ui.add_diesel`, `ui.diesel_on` |
| **City Subheading & Tooltips** | `ui.city_subheading`, `ui.act2_prefix`, `ui.mission_status_tooltip` |

### L. Title Intro Screen & Dossier Archives (`components/TitleIntroScreen.tsx`)
| Entity | Translation Hook |
| :--- | :--- |
| **Pitch & Blackout Badge** | `intro.pitch`, `intro.stage4_blackout` |
| **5 Main Menu Command Buttons** | `intro.menu_start`, `intro.new_game`, `intro.menu_dossiers`, `intro.load_game`, `intro.menu_archive`, `intro.case_endings`, `intro.menu_system`, `intro.settings_lang`, `intro.menu_primer`, `intro.field_briefing` |
| **Active & Load Dossier Cards** | `intro.active_investigation_detected`, `intro.no_active_dossier`, `intro.no_active_dossier_desc`, `intro.open_new_case_file`, `intro.resume_investigation`, `intro.all_slots`, `intro.composure`, `intro.grid`, `intro.saved`, `intro.comp_abbr`, `intro.evidence_gear` |
| **New Setup & Slot Picker** | `intro.new_setup_title`, `intro.new_setup_subtitle`, `intro.choose_slot`, `intro.slot_selected`, `intro.empty_slot`, `intro.choose_mode`, `intro.mode_act1_prologue`, `intro.mode_act1_map`, `intro.mode_act2_commission`, `intro.load_header`, `intro.load_subtitle`, `intro.slot_empty`, `intro.slot_no_data`, `intro.slot_start_new`, `intro.load_dossier_btn`, `intro.delete`, `intro.confirm` |
| **Endings Archive** | `intro.archive_header`, `intro.archive_subtitle`, `intro.act2_finale`, `intro.classified_outcome`, `ending_hint.ending_*` |

---

## 3. Data Dictionary Key Naming Standards

When authoring keys in `data/i18n/{lang}.json`, follow these strict namespace conventions:

| Namespace | Example Key | Purpose |
| :--- | :--- | :--- |
| `stat.*` | `stat.dockets`, `stat.influence`, `stat.wire`, `stat.street`, `stat.any` | Investigator stats in action drawers & checks |
| `stat_abbr.*` | `stat_abbr.street`, `stat_abbr.dockets`, `stat_abbr.wire`, `stat_abbr.influence` | 4-character HUD abbreviations across all languages |
| `item_category.*` | `item_category.gear`, `item_category.evidence`, `item_category.exhibit` | Classified inventory and gear categorization |
| `ui.*` | `ui.clean`, `ui.risky`, `ui.fail`, `ui.select_die_prompt`, `ui.drag_or_tap`, `ui.stage6_blackout_cover` | General UI labels and action drawer prompts |
| `node.<id>.*` | `node.n1_safehouse.title`, `node.n1_safehouse.district`, `node.n1_safehouse.desc` | Map locations, venue names, and districts |
| `slot.<id>.*` | `slot.act_audit_docket.title`, `slot.act_audit_docket.desc`, `slot.act_audit_docket.clean` | Action slots and outcome narrative logs |
| `clock.<id>.*` | `clock.mokoena_sweep.title`, `clock.mokoena_sweep.desc` | Threat clocks and player investigation clocks |
| `bg.<id>.*` | `bg.forensic_hawk.title`, `bg.forensic_hawk.former_unit`, `bg.forensic_hawk.tagline`, `bg.forensic_hawk.desc` | Character background archetypes |
| `board.pin.<id>.*` | `board.pin.pin_sithole.tag`, `board.pin.pin_sithole.title`, `board.pin.pin_sithole.role`, `board.pin.pin_sithole.summary` | Conspiracy board entity pushpins |
| `board.link.<id>.*` | `board.link.link_docket_409.label`, `board.link.link_docket_409.verified`, `board.link.link_docket_409.hint` | Conspiracy board red-string evidence links |
| `tutorial.step<N>.*`| `tutorial.step1.badge`, `tutorial.step1.zone`, `tutorial.step1.title`, `tutorial.step1.desc`, `tutorial.step1.bullet1` | Field rules and tutorial overlay |
| `mission.*` | `mission.how_to_win_act1`, `mission.how_to_win_act2`, `mission.faq_q1_title`, `mission.faq_q1_body` | Case file modal, campaign steps, FAQ, win rules |
| `item.<id>.*` | `item.docket_409_raw.title`, `item.docket_409_raw.effect` | Black-market gear and classified exhibits |
| `faction.<id>.*` | `faction.hawks.name`, `faction.hawks.desc` | Faction names and summaries |
| `dialogue.<nodeId>.*`| `dialogue.n10_high_court.name`, `dialogue.n10_high_court.role`, `dialogue.n10_high_court.node.root` | Contact dialogue trees |
| `event.<id>.*` | `event.evt_composure_breakdown.title`, `event.evt_composure_breakdown.desc` | Midnight crisis events |
| `choice.<id>.*` | `choice.breakdown_rest.text`, `choice.breakdown_rest.log` | Event choices and narrative outcomes |
| `ending.<id>.*` | `ending.act1_whistleblower.title`, `ending.act1_whistleblower.desc` | Story endings and epilogues |
| `ending_hint.*` | `ending_hint.ending_act1_whistleblower` | Locked hints for case file archive endings |
| `endcycle.*` | `endcycle.unused_dice_title`, `endcycle.threat_clocks_advance`, `endcycle.confirm_sleep` | End of cycle sleep and nightfall simulation |
| `intro.*` | `intro.pitch`, `intro.stage4_blackout`, `intro.menu_start`, `intro.new_setup_title` | Title intro screen, slot manager, dossier loads |

---

## 4. Step-by-Step Blueprint for Creating Story 2

When you build the next story (e.g. Act 3: "The Drakensberg Pipeline" or "Joburg Syndicate"), execute the following 5 steps:

```
[1. Author Story Schema] 
   ↳ Define Map Nodes, Action Slots, Clocks, Contacts, Items, Pins, Links
[2. Extract Canonical Master (en.json)]
   ↳ Register all English text under standard namespace keys
[3. Batch Translation Pipeline]
   ↳ Run Gemini API / script across af, zu, xh, st, nso, tn, ts, ss, ve
[4. Connect Localization Hooks]
   ↳ Ensure components call getLocalizedNode, getLocalizedSlot, getLocPin, etc.
[5. Run Verification Suite]
   ↳ npx tsc --noEmit && npm test && Browser Inspection
```

### Step 1: Author TypeScript Definitions
Create the story state files with canonical English:
- `data/story2State.ts` (Map nodes, starting action slots, threat clocks)
- `data/story2Dialogues.ts` (NPC contact dialogue trees)
- `data/story2PinsAndLinks.ts` (Conspiracy board pins and red strings)
- `data/story2Endings.ts` (Story climax endings)

### Step 2: Register Keys in `en.json`
Add every narrative string from your new story into `data/i18n/en.json` using the standards in Section 3:
- Add `node.s2_*`
- Add `slot.s2_*`
- Add `board.pin.s2_*`
- Add `board.link.s2_*`
- Add `dialogue.s2_*`
- Add `item.s2_*`
- Add `ending.s2_*`

### Step 3: Run Translation Automation
Run your translation script or Gemini API batch runner (such as `scripts/build-master-i18n.mjs` or `scripts/inject-deep-translations.mjs`) to translate all newly introduced keys into the 9 regional dictionaries (`af`, `zu`, `xh`, `st`, `nso`, `tn`, `ts`, `ss`, `ve`).

### Step 4: Verify Component Connection
Ensure that any new modal or screen passes items through the localization helpers:
- Use `getLocalizedNode(node, currentLang)`
- Use `getLocalizedSlot(slot, currentLang)`
- Use `getLocalizedContactName` & `getLocalizedContactRole`
- Use `getLocalizedStatName(slot.stat, currentLang)`
- Use `getLocPin` & `getLocLink` on the Conspiracy Board
- Wrap logs with `getLocalizedLogEntry(entry, currentLang)`

### Step 5: Validate & Test
1. Run `npx tsc --noEmit` to confirm 0 TypeScript errors.
2. Run `npm test` to verify all translation unit tests pass.
3. Switch languages in the live game (Settings -> Language -> e.g. isiZulu or Afrikaans) and inspect:
   - Action slot drawer: outcome tiers show localized names ("Gevaarlik", "Kuyingozi", "Mislukking", "Kwehluleka").
   - Comms log: dice rolls show localized action titles and narratives.
   - Contact header: NPC titles are translated (e.g. "Kommissie-bewysleier • DPCI Hawks").
   - Conspiracy board: suspect pins and red-string hints are translated.
   - Help Guide: all 6 step badges, zones, and bullets are translated.

---

## 5. Story Creation Checklist

Use this checklist whenever adding a new story:

- [ ] **Character Backgrounds** (`bg.<id>.*`): Title, Former Unit, Tagline, Description
- [ ] **District Map Nodes** (`node.<id>.*`): Title, District/Subtitle, Description
- [ ] **Action Slots** (`slot.<id>.*`): Title, Description, Clean Log, Compromised Log, Failure Log
- [ ] **Stats** (`stat.*`): Any, Dockets, Influence, Wire, Street
- [ ] **Threat & Progress Clocks** (`clock.<id>.*`): Title
- [ ] **NPC Contacts** (`dialogue.<nodeId>.*`): Name, Role, Nodes, Choices
- [ ] **Conspiracy Board Pins** (`board.pin.<id>.*`): Tag, Title, Role, Summary
- [ ] **Conspiracy Board Links** (`board.link.<id>.*`): Label, Verified Explanation, Unverified Hint
- [ ] **Exhibits & Black-Market Gear** (`item.<id>.*`): Title, Category, Effect
- [ ] **Factions & Perks** (`faction.<id>.*`, `perk.<id>.*`): Name, Description
- [ ] **Crises & Events** (`event.<id>.*`, `choice.<id>.*`): Title, Description, Choice texts, Outcome logs
- [ ] **Climax Endings** (`ending.<id>.*`): Title, Headline, Description, Aftermath
- [ ] **Campaign Progress & Status** (`mission.*`): Step titles, Win condition descriptions, FAQ
- [ ] **UI Prompts & Outcome Tiers** (`ui.*`): Clean, Risky, Fail, Select Die, Drag or Tap
