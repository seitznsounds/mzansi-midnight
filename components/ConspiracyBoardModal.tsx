import React, { useState } from 'react';
import { GameState } from '../types/game';
import { ITEMS_CATALOG } from '../data/itemsCatalog';
import { KEYSTONE_DOSSIERS } from '../data/campaignStories';
import { loadCampaignProgression } from '../engine/campaignStorage';
import { SupportedLanguage } from '../types/settings';
import { t, getLocalizedItemName } from '../engine/i18n';
import { soundscape } from '../engine/soundscape';


interface BoardPinNode {
  id: string;
  title: string;
  role: string;
  avatar?: string;
  tag: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  summary: string;
}

interface RedStringLink {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  evidenceItemIds: string[]; // Verified if player has ANY of these in state.inventory
  verifiedExplanation: string;
  unverifiedHint: string;
}

const ACT1_PINS: BoardPinNode[] = [
  {
    id: 'pin_sithole',
    title: 'Auditor Mandla Sithole',
    role: 'Murdered Municipal Forensic Auditor',
    tag: 'VICTIM // N2 AMBUSH',
    x: 17,
    y: 25,
    summary:
      'Intercepted and killed near the Umgeni off-ramp at 01:45 AM after photographing container MSCU-908114 and flagging 16 ghost water tankers.',
  },
  {
    id: 'pin_nandi',
    title: 'Constable Nandi',
    role: 'Wounded Whistleblower • Key Witness',
    avatar: '/assets/characters/nandi.jpg',
    tag: 'WITNESS // SAFEHOUSE',
    x: 17,
    y: 75,
    summary:
      'Survived the N2 weighbridge ambush with a gunshot wound and escaped to your Mercury Arcade flat carrying bloodstained Docket #409 and Sithole’s handset.',
  },
  {
    id: 'pin_masibi',
    title: 'Cllr. "Ma-Sibi" Khumalo',
    role: 'Metro Renewal Coalition • City Hall',
    avatar: '/assets/characters/masibi.jpg',
    tag: 'SUSPECT // TENDER MAFIA',
    x: 50,
    y: 19,
    summary:
      'Signed off on R42.5m emergency water-tanker vouchers while weaponizing Sub-Station 14 Stage 6 load shedding to blind Pier 2 harbour cameras.',
  },
  {
    id: 'pin_shell_co',
    title: 'Zululand Aqua-Logistics',
    role: 'R400m Water-Tanker Shell Company',
    tag: 'SHELL ENTITY // VOUCHER #8841-B',
    x: 50,
    y: 50,
    summary:
      'Front company paid to deliver potable water to drought-stricken northern wards, actually operating stainless-steel bladder tankers into Pier 2 Cold Storage.',
  },
  {
    id: 'pin_mokoena',
    title: 'Brig. Titus Mokoena',
    role: 'SAPS TRT Commander • 13th Floor',
    avatar: '/assets/characters/mokoena.jpg',
    tag: 'SUSPECT // ENFORCER',
    x: 50,
    y: 81,
    summary:
      'Uses SAPS Operation Shanela roadblocks and unmarked Golf GTIs to escort chemical tankers and hunt down Constable Nandi.',
  },
  {
    id: 'pin_zuko',
    title: 'Zuko "The Architect" Ndlovu',
    role: 'Abasanta Logistics Kingpin • Berth 14',
    avatar: '/assets/characters/zuko.jpg',
    tag: 'KINGPIN // PIER 2',
    x: 83,
    y: 26,
    summary:
      'Imports methylamine precursor drums aboard MV Southern Cross at Berth 14 and moves them inland under municipal water-tanker cover.',
  },
  {
    id: 'pin_vandermerwe',
    title: 'Col. Piet van der Merwe',
    role: 'DPCI Hawks Holdout • Old Archive',
    avatar: '/assets/characters/vandermerwe.jpg',
    tag: 'ALLY // HAWKS VAULT',
    x: 83,
    y: 75,
    summary:
      'Clean Hawks commander operating out of the magistrate court sub-basement, awaiting verified financial and wiretap proof to launch a national broadcast.',
  },
];

const ACT1_LINKS: RedStringLink[] = [
  {
    id: 'link_docket_409',
    fromId: 'pin_sithole',
    toId: 'pin_nandi',
    label: 'Docket #409 Originals',
    evidenceItemIds: ['docket_409_raw'],
    verifiedExplanation:
      'VERIFIED: Nandi pulled Voucher #8841-B and weighbridge slips from Sithole’s burning car, proving 16 water tankers diverted to Pier 2.',
    unverifiedHint: 'Starting evidence recovered by Constable Nandi.',
  },
  {
    id: 'link_auditor_phone',
    fromId: 'pin_sithole',
    toId: 'pin_mokoena',
    label: 'N2 Hit Voice Note',
    evidenceItemIds: ['auditor_encrypted_phone', 'berth_14_manifest'],
    verifiedExplanation:
      'VERIFIED: Sithole’s locked GraphemeOS handset cached audio from the N2 ambush linking Central Precinct TRT directly to his murder.',
    unverifiedHint: 'Examine the Murdered Auditor’s Handset.',
  },
  {
    id: 'link_masibi_shell',
    fromId: 'pin_masibi',
    toId: 'pin_shell_co',
    label: '40% Family Trust Kickback',
    evidenceItemIds: ['decoded_tanker_ledger'],
    verifiedExplanation:
      'VERIFIED: Cross-referencing Docket #409 proves Councillor Ma-Sibi’s family trust owns 40% of Zululand Aqua-Logistics.',
    unverifiedHint:
      'UNVERIFIED LEAD: Complete the "Audit Docket #409" clock at your Mercury Arcade Safehouse to trace the shell company owners.',
  },
  {
    id: 'link_zuko_shell',
    fromId: 'pin_shell_co',
    toId: 'pin_zuko',
    label: '60% Abasanta BVI Holding',
    evidenceItemIds: ['decoded_tanker_ledger'],
    verifiedExplanation:
      'VERIFIED: Abasanta Maritime Holdings (BVI) owns 60% of the municipal water tankers, lining them with stainless-steel precursor bladders.',
    unverifiedHint:
      'UNVERIFIED LEAD: Complete the "Audit Docket #409" clock at your Safehouse to link the water tankers to Pier 2.',
  },
  {
    id: 'link_mokoena_berth14',
    fromId: 'pin_mokoena',
    toId: 'pin_zuko',
    label: 'Berth 14 Convoy Wiretap',
    evidenceItemIds: ['berth_14_manifest'],
    verifiedExplanation:
      'VERIFIED: Decrypted audio captures Brigadier Mokoena ordering the Umgeni hit to protect Zuko’s container MSCU-908114 at Berth 14.',
    unverifiedHint:
      'UNVERIFIED LEAD: Complete the "Crack Auditor’s Handset" clock with Sparks at Golden Dragon Cyber-Pawn (N5).',
  },
  {
    id: 'link_hawks_case',
    fromId: 'pin_shell_co',
    toId: 'pin_vandermerwe',
    label: 'Hawks Prosecution File',
    evidenceItemIds: ['decoded_tanker_ledger', 'berth_14_manifest'],
    verifiedExplanation:
      'VERIFIED: With decrypted intelligence in hand, Colonel van der Merwe’s basement task force can unseal the national broadcast.',
    unverifiedHint:
      'UNVERIFIED LEAD: Decode the Tanker Ledger or crack the Auditor’s Handset to unlock Colonel van der Merwe’s basement archive.',
  },
];

const ACT2_PINS: BoardPinNode[] = [
  {
    id: 'pin_act1_legacy',
    title: 'The Berth 14 Fallout',
    role: 'Act 1 Harbour Climax Evidence',
    tag: 'ORIGIN // PIER 2',
    x: 16,
    y: 50,
    summary:
      'The smoking remnants of the Berth 14 precursor convoy forced the syndicate uphill to Umhlanga Ridge, the Midlands escarpment, and the High Court Commission.',
  },
  {
    id: 'pin_act2_masibi',
    title: 'Cllr. "Ma-Sibi" Khumalo',
    role: 'Umhlanga Ridge Penthouse Trustee',
    avatar: '/assets/characters/masibi.jpg',
    tag: 'TRUSTEE // 30% SHARE',
    x: 47,
    y: 20,
    summary:
      'Shredding municipal paper trails on the 28th floor of The Ridge while wiring coalition funds into Dubai escrow accounts.',
  },
  {
    id: 'pin_act2_trust',
    title: 'Sovereign Pearl Holdings',
    role: 'DIFC Offshore Shell Trust (Dubai)',
    tag: 'OFFSHORE APEX // ESCROW',
    x: 50,
    y: 50,
    summary:
      'The offshore holding company uniting Zuko Ndlovu (45%), Councillor Ma-Sibi (30%), and Brigadier Mokoena (25%) behind a single Dubai flight charter.',
  },
  {
    id: 'pin_act2_bheki',
    title: 'Bra Bheki’s Strike Depot',
    role: 'Impounded Northern Water Tankers',
    avatar: '/assets/characters/bheki.jpg',
    tag: 'TELEMETRY // KWAMASHU',
    x: 47,
    y: 80,
    summary:
      'Township residents and taxi marshals seized 14 false-baffle municipal tankers in KwaMashu whose dash GPS chips logged nightly runs to the Midlands.',
  },
  {
    id: 'pin_act2_zuko',
    title: 'Midlands Citrus Super-Lab',
    role: 'Zuko Ndlovu • Packhouse B',
    avatar: '/assets/characters/zuko.jpg',
    tag: 'SYNTHESIS // HOWICK SPUR',
    x: 83,
    y: 24,
    summary:
      'An inland hydroponic Valencia orange estate concealing industrial distillation towers that package 1.8 metric tons of crystal into export crates.',
  },
  {
    id: 'pin_act2_hangar7',
    title: 'Flight ZS-900 (Hangar 7)',
    role: 'Brig. Mokoena • King Shaka Apron',
    avatar: '/assets/characters/mokoena.jpg',
    tag: 'EXTRACTION // TARMAC',
    x: 83,
    y: 76,
    summary:
      'A private Gulfstream G550 fuelled at King Shaka Cargo Apron Hangar 7 under TRT armoured guard for midnight syndicate extraction to Dubai.',
  },
];

const ACT2_LINKS: RedStringLink[] = [
  {
    id: 'link_act2_carryover',
    fromId: 'pin_act1_legacy',
    toId: 'pin_act2_trust',
    label: 'Act 1 Legacy Trail',
    evidenceItemIds: [
      'item_act1_scorched_valves',
      'item_act1_subpoena_warrant',
      'item_act1_shadow_retainer',
    ],
    verifiedExplanation:
      'VERIFIED: Your carryover exhibit from the night of the Berth 14 climax exposed the inland and offshore tier of the conspiracy.',
    unverifiedHint: 'Carried over automatically upon entering Act 2.',
  },
  {
    id: 'link_act2_deed_masibi',
    fromId: 'pin_act2_masibi',
    toId: 'pin_act2_trust',
    label: 'Sovereign Pearl Trust Deed',
    evidenceItemIds: ['offshore_trust_deed'],
    verifiedExplanation:
      'VERIFIED: Unredacted DIFC registry schedule proving Zuko (45%), Ma-Sibi (30%), and Mokoena (25%) co-own Sovereign Pearl Holdings.',
    unverifiedHint:
      'UNVERIFIED LEAD: Complete the "Trace Sovereign Pearl Trust" clock at The Ridge Penthouses (N8) or High Court Chambers (N10).',
  },
  {
    id: 'link_act2_deed_hangar',
    fromId: 'pin_act2_trust',
    toId: 'pin_act2_hangar7',
    label: 'Gulfstream ZS-900 Charter Escrow',
    evidenceItemIds: ['offshore_trust_deed'],
    verifiedExplanation:
      'VERIFIED: Sovereign Pearl escrow records confirm Gulfstream G550 (ZS-900) is fuelled at King Shaka Hangar 7 for midnight extraction.',
    unverifiedHint:
      'UNVERIFIED LEAD: Obtain the Sovereign Pearl Offshore Trust Deed to pinpoint the Hangar 7 extraction flight.',
  },
  {
    id: 'link_act2_telemetry_depot',
    fromId: 'pin_act2_bheki',
    toId: 'pin_act2_zuko',
    label: 'Tanker GPS Batch Telemetry',
    evidenceItemIds: ['superlab_batch_telemetry'],
    verifiedExplanation:
      'VERIFIED: GPS route logs from 14 impounded KwaMashu water tankers trace nightly precursor deliveries straight to Midlands Citrus Estate Packhouse B.',
    unverifiedHint:
      'UNVERIFIED LEAD: Complete the "Synthesize Super-Lab Telemetry" clock at the Northern Township Depot (N9).',
  },
  {
    id: 'link_act2_crates_tarmac',
    fromId: 'pin_act2_zuko',
    toId: 'pin_act2_hangar7',
    label: 'Export Citrus Pallets -> Hangar 7',
    evidenceItemIds: ['superlab_batch_telemetry', 'offshore_trust_deed'],
    verifiedExplanation:
      'VERIFIED: 1.8 metric tons of pure crystal packaged in export citrus crates are being loaded directly onto Flight ZS-900 at Hangar 7.',
    unverifiedHint:
      'UNVERIFIED LEAD: Secure either the Offshore Trust Deed or Super-Lab Batch Telemetry to unlock the Hangar 7 tarmac.',
  },
];

const HIGHVELD_PINS: BoardPinNode[] = [
  {
    id: 'pin_hv_lerato',
    title: 'Auditor Lerato Molefe',
    role: 'Assassinated Eskom Forensic Auditor',
    avatar: '/assets/characters/lerato.jpg',
    tag: 'VICTIM // M1 AMBUSH',
    x: 17,
    y: 25,
    summary:
      'Kagiso’s younger sister, ambushed on the M1 freeway after refusing to approve R800m emergency diesel purchase orders tied to Project Midas.',
  },
  {
    id: 'pin_hv_brak',
    title: 'Kagiso "Bra K" Molefe',
    role: 'Disgraced SIU Forensic Auditor',
    avatar: '/assets/characters/bra_k.jpg',
    tag: 'INVESTIGATOR // BRAAMFONTEIN',
    x: 17,
    y: 75,
    summary:
      'Operating from Room 902 in Braamfontein, tracing the thermite burns, shell accounts, and the conspiracy that killed his sister.',
  },
  {
    id: 'pin_hv_substation',
    title: 'Hillbrow Substation 44',
    role: 'City Power High-Voltage Transformer',
    tag: 'TARGET // SCADA OVERLOAD',
    x: 50,
    y: 20,
    summary:
      'Targeted with SCADA logic-bombs and thermite sabotage to trigger rolling blackouts and emergency diesel consumption across Johannesburg.',
  },
  {
    id: 'pin_hv_helena',
    title: 'Helena Van Niekerk',
    role: 'MD • Sandton Energy Arbitrage',
    avatar: '/assets/characters/helena.jpg',
    tag: 'SUSPECT // ARBITRAGE',
    x: 50,
    y: 50,
    summary:
      'Fronting private energy syndicates that buy municipal electricity at baseline and dump emergency diesel power at 600% markup.',
  },
  {
    id: 'pin_hv_zamazamas',
    title: 'Crown Mines Stopes (Level 18)',
    role: 'Mkhulu Sibanyoni • Deep Reef Haulage',
    avatar: '/assets/characters/mkhulu.jpg',
    tag: 'UNDERGROUND // 50,000L DIESEL',
    x: 50,
    y: 80,
    summary:
      'Abandoned gold stopes concealing 60 drums of diverted emergency diesel and dynamite caches under unstable quartzite fault lines.',
  },
  {
    id: 'pin_hv_sithole',
    title: 'General Sibusiso Sithole',
    role: 'Chief of Special Operations • NIA',
    avatar: '/assets/characters/sithole.jpg',
    tag: 'CABAL // PRETORIA APEX',
    x: 83,
    y: 25,
    summary:
      'Orchestrator of the Black-Sky grid sabotage directives, using unmarked tactical teams to execute uncooperative auditors.',
  },
  {
    id: 'pin_hv_khumalo',
    title: 'Advocate Nomsa Khumalo',
    role: 'SIU Lead Prosecutor • Special Tribunal',
    avatar: '/assets/characters/khumalo.jpg',
    tag: 'ALLY // HIGH COURT TRIBUNAL',
    x: 83,
    y: 75,
    summary:
      'Leading the Special Tribunal at the Johannesburg High Court, awaiting forensic coal samples and signed orders to seize syndicate assets.',
  },
];

const HIGHVELD_LINKS: RedStringLink[] = [
  {
    id: 'link_hv_lerato_brak',
    fromId: 'pin_hv_lerato',
    toId: 'pin_hv_brak',
    label: "Lerato's Recovered Laptop",
    evidenceItemIds: ['evidence_lerato_audit_notes'],
    verifiedExplanation:
      "VERIFIED: Lerato's encrypted drive reveals purchase orders linking emergency diesel to offshore entity Sovereign Pearl.",
    unverifiedHint: 'Starting evidence held by Kagiso Molefe.',
  },
  {
    id: 'link_hv_telemetry_substation',
    fromId: 'pin_hv_substation',
    toId: 'pin_hv_helena',
    label: 'Bloomberg Substation Telemetry',
    evidenceItemIds: ['evidence_bloomberg_substation_telemetry'],
    verifiedExplanation:
      'VERIFIED: Millisecond trade tickets prove Sandton Arbitrage shorted grid stability minutes before Hillbrow transformer blew.',
    unverifiedHint: 'Recover telemetry by resolving actions at Hillbrow Substation.',
  },
  {
    id: 'link_hv_zamazama_reef',
    fromId: 'pin_hv_zamazamas',
    toId: 'pin_hv_helena',
    label: 'Crown Mines Fuel Haulage Ledger',
    evidenceItemIds: ['evidence_zamazama_reef_map'],
    verifiedExplanation:
      'VERIFIED: 50,000 litres of subsidized state diesel diverted into Crown Mines stopes to manufacture synthetic power crises.',
    unverifiedHint: 'Obtain the reef map from Mkhulu Sibanyoni at Witwatersrand Shaft.',
  },
  {
    id: 'link_hv_nia_order',
    fromId: 'pin_hv_substation',
    toId: 'pin_hv_sithole',
    label: 'NIA Sabotage Directive',
    evidenceItemIds: ['evidence_nia_sabotage_order'],
    verifiedExplanation:
      'VERIFIED: Signed military orders by General Sithole directing tactical teams to destroy feeder cables during Stage 4 load shedding.',
    unverifiedHint: 'Extract classified orders from the Union Buildings backchannel.',
  },
  {
    id: 'link_hv_tribunal_docket',
    fromId: 'pin_hv_sithole',
    toId: 'pin_hv_khumalo',
    label: 'SIU Section 205 Subpoena',
    evidenceItemIds: ['evidence_nia_sabotage_order', 'evidence_bloomberg_substation_telemetry'],
    verifiedExplanation:
      'VERIFIED: Advocate Khumalo submits unredacted dockets to the Special Tribunal, freezing R2.8 billion in syndicate assets.',
    unverifiedHint: 'Present critical evidence to Advocate Khumalo at SIU Headquarters.',
  },
];

const NAMAQUA_PINS: BoardPinNode[] = [
  {
    id: 'pin_nq_giepie',
    title: 'Capt. Gideon "Giepie" Brand',
    role: 'Ex-Maritime Border Diver & Desert Tracker',
    avatar: '/assets/characters/giepie.jpg',
    tag: 'INVESTIGATOR // PORT NOLLOTH',
    x: 17,
    y: 75,
    summary:
      'Operating from a shipping container on Port Nolloth jetty, tracking how laundered energy funds were wired to buy illegal offshore dredging concessions.',
  },
  {
    id: 'pin_nq_sonar',
    title: 'Buoy Bravo-Four Dredge Trenches',
    role: 'Offshore Hydrographic Sonar Bathymetry',
    tag: 'SURVEY // SEABED SCARS',
    x: 17,
    y: 25,
    summary:
      'Multi-beam acoustic sonar mapping unflagged dredging suction trenches forty meters deep into the Atlantic bedrock off Port Nolloth.',
  },
  {
    id: 'pin_nq_bettie',
    title: 'Tannie Bettie van Zyl',
    role: 'Port Nolloth Fish Market Doyenne',
    avatar: '/assets/characters/bettie.jpg',
    tag: 'ALLY // ARTISANAL FLOTILLA',
    x: 50,
    y: 20,
    summary:
      'Mobilizing local shore divers and suction bakkies whose ancestral fishing waters are being encroached upon by private security gunboats.',
  },
  {
    id: 'pin_nq_diamonds',
    title: 'Alluvial Diamond Parcel (1,200ct)',
    role: 'Uncertified Conflict Stones',
    tag: 'LAUNDERING // CONCESSION 4B',
    x: 50,
    y: 50,
    summary:
      'Uncut gem-quality alluvial stones dredged off Alexander Bay and laundered through De Beers ghost mine sorting tables to buy tactical arms.',
  },
  {
    id: 'pin_nq_swartbooi',
    title: 'Swartbooi Witbooi',
    role: 'Nama Desert Elder • Kalahari Runners',
    avatar: '/assets/characters/swartbooi.jpg',
    tag: 'GUIDE // DESERT PASS',
    x: 50,
    y: 80,
    summary:
      'Guiding desert runner convoys and tracking private mercenary truck convoys through the blistering moon rock gorges of the Richtersveld.',
  },
  {
    id: 'pin_nq_petrov',
    title: 'Col. Yuri Petrov',
    role: 'Commander • Aegis-Atlantis Marine',
    avatar: '/assets/characters/petrov.jpg',
    tag: 'CABAL // MERCENARY FLEET',
    x: 83,
    y: 25,
    summary:
      'Operating private interceptor gunboats from Alexander Bay, flying assault rifles in from Walvis Bay to arm Cape Town private security cartels.',
  },
  {
    id: 'pin_nq_cloete',
    title: 'Capt. Annelize Cloete',
    role: 'Sea Fisheries & Maritime Enforcement',
    avatar: '/assets/characters/cloete.jpg',
    tag: 'LAW // SPRINGBOK MAGISTRATE',
    x: 83,
    y: 75,
    summary:
      'Holding the line at the Springbok District Court, ready to issue emergency High Court Admiralty seizure warrants against the mercenary vessels.',
  },
];

const NAMAQUA_LINKS: RedStringLink[] = [
  {
    id: 'link_nq_sonar_giepie',
    fromId: 'pin_nq_sonar',
    toId: 'pin_nq_giepie',
    label: 'Offshore Bathymetry Logs',
    evidenceItemIds: ['evidence_sonar_bathymetry_log'],
    verifiedExplanation:
      'VERIFIED: Sonar bathymetry proves unflagged dredging craft cut illegal diamond trenches into bedrock off Port Nolloth.',
    unverifiedHint: 'Starting evidence held by Gideon Brand.',
  },
  {
    id: 'link_nq_diamonds_concession',
    fromId: 'pin_nq_sonar',
    toId: 'pin_nq_diamonds',
    label: 'Concession 4B Gravel Yield',
    evidenceItemIds: ['evidence_namaqua_diamond_parcel'],
    verifiedExplanation:
      'VERIFIED: 1,200 carats of uncertified alluvial diamonds recovered from the seabed sorting vaults.',
    unverifiedHint: 'Recover the diamond parcel from Alexander Bay or De Beers Ghost Mine.',
  },
  {
    id: 'link_nq_diamonds_petrov',
    fromId: 'pin_nq_diamonds',
    toId: 'pin_nq_petrov',
    label: 'Stones-for-Arms Escrow',
    evidenceItemIds: ['evidence_namaqua_diamond_parcel', 'evidence_aegis_arms_bill'],
    verifiedExplanation:
      'VERIFIED: Uncut stones traded directly to Aegis-Atlantis to purchase Galil assault rifles and maritime radar.',
    unverifiedHint: 'Obtain the Aegis Arms Bill from the coastal compound or river pont.',
  },
  {
    id: 'link_nq_arms_cape',
    fromId: 'pin_nq_petrov',
    toId: 'pin_nq_cloete',
    label: 'Table Bay Admiralty Manifest',
    evidenceItemIds: ['evidence_aegis_arms_bill', 'dossier_admiralty_manifest'],
    verifiedExplanation:
      'VERIFIED: Stamped freight manifests expose the weapon consignments bound for Table Bay Harbor in Cape Town.',
    unverifiedHint: 'File an Admiralty injunction with Captain Cloete or infiltrate Aegis Command.',
  },
  {
    id: 'link_nq_runners_desert',
    fromId: 'pin_nq_swartbooi',
    toId: 'pin_nq_diamonds',
    label: 'Border Pont Smuggler Corridor',
    evidenceItemIds: ['gear_sand_tracks', 'gear_satellite_compass'],
    verifiedExplanation:
      'VERIFIED: Swartbooi’s trail routes bypass military roadblocks, linking the ghost mines directly to the Orange River pont.',
    unverifiedHint: 'Procure sand tracks or satellite compass from the desert nodes.',
  },
];

const CAPE_PINS: BoardPinNode[] = [
  {
    id: 'pin_cp_leila',
    title: 'Detective Leila Hendricks',
    role: 'Former Anti-Gang Unit Detective',
    avatar: '/assets/characters/leila.jpg',
    tag: 'INVESTIGATOR // LONG STREET',
    x: 17,
    y: 75,
    summary:
      'Discredited and cast out of the SAPS after refusing to cover up her partner’s murder. Now tracking the arms pipeline from Long Street to Table Bay Harbour.',
  },
  {
    id: 'pin_cp_damon',
    title: 'Detective David Damon (Deceased)',
    role: 'Murdered Anti-Gang Unit Whistleblower',
    avatar: '/assets/characters/damon.jpg',
    tag: 'VICTIM // HANOVER PARK',
    x: 17,
    y: 25,
    summary:
      'Executed with 9mm hollow-point rounds in a Cape Flats alleyway. The recovered projectile was secretly matched to Commissioner Swart’s personal service weapon.',
  },
  {
    id: 'pin_cp_zack',
    title: 'Zack "The Bull" Rossouw',
    role: 'Long Street Nightclub Security Boss',
    avatar: '/assets/characters/zack.jpg',
    tag: 'SUSPECT // PROTECTION RACKET',
    x: 50,
    y: 20,
    summary:
      'Controls bouncers across twenty-four City Bowl clubs, collecting R40k weekly protection retainers funneled to high-ranking police generals.',
  },
  {
    id: 'pin_cp_ronnie',
    title: 'Pastor Ronald Jacobs',
    role: 'Cape Flats Truce Elder • Ex-28s General',
    avatar: '/assets/characters/ronnie.jpg',
    tag: 'ALLY // COMMUNITY CEASEFIRE',
    x: 50,
    y: 50,
    summary:
      'Brokering an historic ceasefire across Manenberg and Hanover Park after realizing the police command was supplying arms to prolong gang bloodshed.',
  },
  {
    id: 'pin_cp_claudine',
    title: 'Baroness Claudine de Villiers',
    role: 'Winelands Capital Club Trustee',
    avatar: '/assets/characters/claudine.jpg',
    tag: 'OLIGARCH // STELLENBOSCH TRUST',
    x: 50,
    y: 80,
    summary:
      'Manages offshore family trusts in Geneva routing over R420 million into private paramilitary contractors and Table Bay port security.',
  },
  {
    id: 'pin_cp_swart',
    title: 'Major-Gen. Andre Swart',
    role: 'Western Cape Provincial Police Commissioner',
    avatar: '/assets/characters/general_swart.jpg',
    tag: 'CABAL // SOVEREIGN OCTAGON',
    x: 83,
    y: 25,
    summary:
      'Architect of the Cape protection racket and partner execution, awaiting delivery of 450 tactical rifles at Table Bay Pier 109 to arm his shadow army.',
  },
  {
    id: 'pin_cp_cassiem',
    title: 'Cassiem Petersen',
    role: 'Table Bay Stevedore Union Steward',
    avatar: '/assets/characters/cassiem.jpg',
    tag: 'ALLY // BERTH 109 DOCK STRIKE',
    x: 83,
    y: 75,
    summary:
      'Mobilizing port container crane operators to freeze Berth 109 and prevent Swart’s private security mercenaries from clearing the arms shipment.',
  },
];

const CAPE_LINKS: RedStringLink[] = [
  {
    id: 'link_cp_damon_swart',
    fromId: 'pin_cp_damon',
    toId: 'pin_cp_swart',
    label: 'Murder Ballistics Striation Match',
    evidenceItemIds: ['evidence_agu_ballistics_dossier'],
    verifiedExplanation:
      'VERIFIED: Forensic comparator proves David Damon was executed with Commissioner Swart’s registered 9mm Glock.',
    unverifiedHint: 'Recover the ballistics dossier from the charred AGU safehouse bunker.',
  },
  {
    id: 'link_cp_zack_swart',
    fromId: 'pin_cp_zack',
    toId: 'pin_cp_swart',
    label: 'Long Street Protection Kickbacks',
    evidenceItemIds: ['gear_reinforced_agu_vest', 'gear_encrypted_burner_mesh'],
    verifiedExplanation:
      'VERIFIED: Bouncer retainers laundered through Foreshore shell accounts funded Swart’s unsanctioned tactical unit.',
    unverifiedHint: 'Investigate nightclub protection rings on Long Street.',
  },
  {
    id: 'link_cp_claudine_arms',
    fromId: 'pin_cp_claudine',
    toId: 'pin_cp_swart',
    label: 'Geneva Offshore Armaments Wire',
    evidenceItemIds: ['evidence_winelands_trust_ledger'],
    verifiedExplanation:
      'VERIFIED: R420 million wired from Stellenbosch trusts directly to Aegis-Atlantis for Table Bay arms deliveries.',
    unverifiedHint: 'Audit the Winelands trust ledgers at Camps Bay or Stellenbosch cellars.',
  },
  {
    id: 'link_cp_berth109_manifest',
    fromId: 'pin_cp_swart',
    toId: 'pin_cp_cassiem',
    label: 'Pier 109 Arms Container Manifest',
    evidenceItemIds: ['evidence_pier109_arms_bill', 'gear_stevedore_prybar'],
    verifiedExplanation:
      'VERIFIED: Container MSCU-449102 carrying 450 tactical assault rifles seized at Berth 109 under stevedore blockade.',
    unverifiedHint: 'Audit the customs manifest at Table Bay container berth.',
  },
  {
    id: 'link_cp_ronnie_flats',
    fromId: 'pin_cp_ronnie',
    toId: 'pin_cp_swart',
    label: 'Flats Ammunition Diversion',
    evidenceItemIds: ['evidence_agu_ballistics_dossier', 'dossier_admiralty_manifest'],
    verifiedExplanation:
      'VERIFIED: Swart delivered state ammunition to gangs to manufacture urban chaos and justify private security decrees.',
    unverifiedHint: 'Present evidence to Pastor Ronnie in Manenberg.',
  },
  {
    id: 'link_cp_red_protocol',
    fromId: 'pin_cp_swart',
    toId: 'pin_cp_leila',
    label: 'The Grand Sovereign Protocol',
    evidenceItemIds: ['evidence_red_cipher_fragment', 'dossier_red_protocol'],
    verifiedExplanation:
      'VERIFIED: Unmasked the eight founders of The Sovereign Octagon and their master plan for Operation Midnight Sun.',
    unverifiedHint: 'Decrypt the Red Cipher or breach General Swart’s headquarters safe.',
  },
];

const NATIONAL_PINS: BoardPinNode[] = [
  {
    id: 'pin_nat_ethekwini',
    title: 'eThekwini Gateway (Docket #409)',
    role: 'Coastal Smuggling Axis • Pier 2 & Midlands',
    avatar: '/assets/characters/nandi.jpg',
    tag: 'THEATRE 01 // COASTAL PORT',
    x: 14,
    y: 72,
    summary:
      'The initial port pipeline: 20,000 litres of pharmaceutical chemical precursors smuggled under the cover of municipal water-tanker contracts.',
  },
  {
    id: 'pin_nat_highveld',
    title: 'Highveld Power Grid (Project Midas)',
    role: 'Capital Energy Cartel • Joburg & Pretoria',
    avatar: '/assets/characters/bra_k.jpg',
    tag: 'THEATRE 02 // MEGAWATT SABOTAGE',
    x: 32,
    y: 28,
    summary:
      'The capital power grid sabotage: deliberate destruction of Eskom generating units to force emergency open-cycle gas turbine diesel tenders.',
  },
  {
    id: 'pin_nat_namaqua',
    title: 'Namaqualand Coast (Operation Deep-Gravel)',
    role: 'Diamond Corridor • Port Nolloth & Richtersveld',
    avatar: '/assets/characters/giepie.jpg',
    tag: 'THEATRE 03 // SKELETON COAST',
    x: 52,
    y: 72,
    summary:
      'The desert diamond run: unregistered seabed dredging concessions and private naval mercenaries laundering energy cash into conflict stones.',
  },
  {
    id: 'pin_nat_cape',
    title: 'Cape Nocturne (The Red Sovereign)',
    role: 'Underworld Shadow Army • Table Bay & Winelands',
    avatar: '/assets/characters/leila.jpg',
    tag: 'THEATRE 04 // SHADOW OLIGARCHY',
    x: 72,
    y: 28,
    summary:
      'The Cape protection racket: police generals, Cape Flats gang federations, and Winelands oligarchs arming a shadow army.',
  },
  {
    id: 'pin_nat_octagon',
    title: 'The Sovereign Octagon',
    role: 'Grand Finale • Drakensberg Subterranean Vault',
    avatar: '/assets/characters/sterling_swart.jpg',
    tag: 'THEATRE 05 // NATIONAL CLIMAX',
    x: 88,
    y: 65,
    summary:
      'The central cabal orchestrating total Stage 8 grid collapse and authoritarian transfer of South African state sovereignty.',
  },
];

const NATIONAL_LINKS: RedStringLink[] = [
  {
    id: 'link_nat_durban_highveld',
    fromId: 'pin_nat_ethekwini',
    toId: 'pin_nat_highveld',
    label: 'Keystone 1: Sovereign Pearl Trust',
    evidenceItemIds: ['dossier_sovereign_pearl', 'offshore_trust_deed'],
    verifiedExplanation:
      'VERIFIED: Sovereign Pearl Dubai escrow accounts wired R140m directly to Megawatt Logistics in Sandton to bankroll power station conveyor sabotage.',
    unverifiedHint:
      'UNVERIFIED: Secure the Sovereign Pearl Trust Deed in eThekwini-Gold to connect the port to the Highveld.',
  },
  {
    id: 'link_nat_highveld_namaqua',
    fromId: 'pin_nat_highveld',
    toId: 'pin_nat_namaqua',
    label: 'Keystone 2: Project Midas Ledger',
    evidenceItemIds: ['dossier_project_midas'],
    verifiedExplanation:
      'VERIFIED: Emergency diesel procurement margins were laundered into 14,000 carats of uncertified rough diamonds dredged along the Skeleton Coast.',
    unverifiedHint:
      'UNVERIFIED: Complete Story 2 (Highveld-Chrome) to link the power cartel to the diamond run.',
  },
  {
    id: 'link_nat_namaqua_cape',
    fromId: 'pin_nat_namaqua',
    toId: 'pin_nat_cape',
    label: 'Keystone 3: Table Bay Admiralty Manifest',
    evidenceItemIds: ['dossier_admiralty_manifest'],
    verifiedExplanation:
      'VERIFIED: Diamond proceeds purchased 450 tactical assault rifles and radar suites shipped under naval escort to Table Bay Harbour.',
    unverifiedHint:
      'UNVERIFIED: Complete Story 3 (Namaqua-Diamond) to link the desert arms corridor to the Cape underworld.',
  },
  {
    id: 'link_nat_cape_octagon',
    fromId: 'pin_nat_cape',
    toId: 'pin_nat_octagon',
    label: 'Keystone 4: The Grand Sovereign Protocol',
    evidenceItemIds: [
      'dossier_red_protocol',
      'dossier_master_archive',
      'evidence_constitutional_indictment',
      'evidence_omega_protocol',
    ],
    verifiedExplanation:
      'VERIFIED: Unmasked all eight signatories of The Sovereign Octagon planning the nationwide Stage 8 Black-Sky Grid Collapse.',
    unverifiedHint:
      'UNVERIFIED: Complete Story 4 (Cape-Nocturne) or gather Master Archive evidence in Story 5 to unlock the Sovereign Octagon Grand Finale.',
  },
];

export const ConspiracyBoardModal: React.FC<{
  isOpen: boolean;
  state: GameState;
  lang?: SupportedLanguage;
  onClose: () => void;
  onInspectEvidenceItem: (itemId: string) => void;
}> = ({ isOpen, state, lang = 'en', onClose, onInspectEvidenceItem }) => {
  const progression = loadCampaignProgression();
  const [boardMode, setBoardMode] = useState<
    'act1' | 'act2' | 'highveld' | 'namaqua' | 'cape' | 'national'
  >(
    state.storyId === 'story_5_octagon'
      ? 'national'
      : state.storyId === 'story_4_cape'
      ? 'cape'
      : state.storyId === 'story_3_namaqua'
      ? 'namaqua'
      : state.storyId === 'story_2_highveld'
      ? 'highveld'
      : state.act === 2
      ? 'act2'
      : 'act1'
  );
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  if (!isOpen) return null;

  const getLocPin = (pin: BoardPinNode): BoardPinNode => ({
    ...pin,
    tag: t(`board.pin.${pin.id}.tag`, pin.tag, lang),
    title: t(`board.pin.${pin.id}.title`, pin.title, lang),
    role: t(`board.pin.${pin.id}.role`, pin.role, lang),
    summary: t(`board.pin.${pin.id}.summary`, pin.summary, lang),
  });

  const getLocLink = (link: RedStringLink): RedStringLink => ({
    ...link,
    label: t(`board.link.${link.id}.label`, link.label, lang),
    verifiedExplanation: t(`board.link.${link.id}.verified`, link.verifiedExplanation, lang),
    unverifiedHint: t(`board.link.${link.id}.hint`, link.unverifiedHint, lang),
  });

  const rawPins =
    boardMode === 'national'
      ? NATIONAL_PINS
      : boardMode === 'cape'
      ? CAPE_PINS
      : boardMode === 'namaqua'
      ? NAMAQUA_PINS
      : boardMode === 'highveld'
      ? HIGHVELD_PINS
      : boardMode === 'act2'
      ? ACT2_PINS
      : ACT1_PINS;
  const rawLinks =
    boardMode === 'national'
      ? NATIONAL_LINKS
      : boardMode === 'cape'
      ? CAPE_LINKS
      : boardMode === 'namaqua'
      ? NAMAQUA_LINKS
      : boardMode === 'highveld'
      ? HIGHVELD_LINKS
      : boardMode === 'act2'
      ? ACT2_LINKS
      : ACT1_LINKS;

  const pins = rawPins.map(getLocPin);
  const links = rawLinks.map(getLocLink);

  const isLinkVerified = (link: RedStringLink) =>
    link.evidenceItemIds.some(
      (id) =>
        state.inventory.includes(id) ||
        progression.collectedKeystones.includes(id)
    );

  const verifiedCount = links.filter(isLinkVerified).length;

  const activePin =
    pins.find((p) => p.id === selectedPinId) ||
    (!selectedLinkId ? pins[0] : null);
  const activeLink = links.find((l) => l.id === selectedLinkId) || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 select-none font-sans">
      <div className="w-full max-w-5xl rounded-2xl border border-red-500/40 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* TOP HEADER */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-zinc-900 via-red-950/30 to-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-red-400">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>
                {t('board.header', 'RED-STRING CONSPIRACY BOARD', lang)} // {verifiedCount} / {links.length}{' '}
                {t('board.links_verified', 'LINKS VERIFIED', lang)}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white mt-0.5">
              {boardMode === 'national'
                ? t('board.national_title', 'The Sovereign Octagon: 5-Story National Web', lang)
                : boardMode === 'highveld'
                ? t('board.highveld_title', 'Highveld Web: The Megawatt Cartel & Project Midas Sabotage', lang)
                : boardMode === 'act2'
                ? t('board.act2_title', 'Act 2 Web: Sovereign Pearl Trust & Flight ZS-900 Extraction', lang)
                : t('board.act1_title', 'Act 1 Web: Docket #409 & The Berth 14 Precursor Pipeline', lang)}
            </h2>
          </div>

          <div className="flex items-center gap-2 max-w-full">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[260px] sm:max-w-none rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 font-mono text-[11px] shrink">
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setBoardMode('act1');
                  setSelectedPinId(null);
                  setSelectedLinkId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  boardMode === 'act1'
                    ? 'bg-red-500/25 text-red-200 border border-red-500/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('board.act1_web', 'Act 1 Web', lang)}
              </button>
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setBoardMode('act2');
                  setSelectedPinId(null);
                  setSelectedLinkId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  boardMode === 'act2'
                    ? 'bg-red-500/25 text-red-200 border border-red-500/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('board.act2_web', 'Act 2 Web', lang)}
              </button>
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setBoardMode('highveld');
                  setSelectedPinId(null);
                  setSelectedLinkId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  boardMode === 'highveld'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('board.highveld_web', 'Highveld Web', lang)}
              </button>
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setBoardMode('namaqua');
                  setSelectedPinId(null);
                  setSelectedLinkId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  boardMode === 'namaqua'
                    ? 'bg-orange-500/25 text-orange-200 border border-orange-500/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('board.namaqua_web', 'Namaqua Web', lang)}
              </button>
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setBoardMode('cape');
                  setSelectedPinId(null);
                  setSelectedLinkId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  boardMode === 'cape'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('board.cape_web', 'Cape Town Web', lang)}
              </button>
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setBoardMode('national');
                  setSelectedPinId(null);
                  setSelectedLinkId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  boardMode === 'national'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('board.national_web', 'National Web (5S)', lang)}
              </button>
            </div>

            <button
              onClick={() => {
                soundscape.playDieSelect();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 font-mono text-xs text-zinc-300 hover:text-white cursor-pointer shrink-0"
            >
              {t('board.esc', '✕ ESC', lang)}
            </button>
          </div>
        </div>

        {/* KEYSTONE DOSSIER RIBBON */}
        <div className="px-4 sm:px-6 py-2 bg-black/60 border-b border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono">
          <div className="text-zinc-400 uppercase tracking-widest shrink-0 text-[10px] flex items-center gap-1.5">
            <span className="text-amber-400">★</span>
            <span>{t('board.keystones_label', 'KEYSTONE EVIDENCE THREADS:', lang)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {Object.values(KEYSTONE_DOSSIERS).map((k) => {
              const isHeld =
                state.inventory.includes(k.id) ||
                progression.collectedKeystones.includes(k.id);
              return (
                <button
                  key={k.id}
                  onClick={() => {
                    if (isHeld) {
                      soundscape.playDieSelect();
                      onInspectEvidenceItem(k.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] transition-all flex items-center gap-1.5 ${
                    isHeld
                      ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 hover:border-amber-400 cursor-pointer shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                  title={k.title}
                >
                  <span>{isHeld ? '✓' : '🔒'}</span>
                  <span>{k.title.split(' ')[0]} {k.title.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>


        {/* CORKBOARD / RED-STRING MIND-MAP CANVAS */}
        <div className="relative w-full h-[340px] sm:h-[400px] bg-zinc-950 overflow-hidden border-b border-zinc-800">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(248,113,113,0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG RED-STRING THREADS */}
          <svg
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {links.map((link) => {
              const fromPin = pins.find((p) => p.id === link.fromId);
              const toPin = pins.find((p) => p.id === link.toId);
              if (!fromPin || !toPin) return null;

              const x1 = fromPin.x * 10;
              const y1 = fromPin.y * 5;
              const x2 = toPin.x * 10;
              const y2 = toPin.y * 5;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const verified = isLinkVerified(link);
              const isSelected = selectedLinkId === link.id;

              return (
                <g
                  key={link.id}
                  onClick={() => {
                    soundscape.playDieSelect();
                    setSelectedLinkId(link.id);
                    setSelectedPinId(null);
                  }}
                  className="cursor-pointer"
                >
                  {/* Glow behind verified red string */}
                  {verified && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isSelected ? '#fbbf24' : '#ef4444'}
                      strokeWidth={isSelected ? 8 : 5}
                      strokeOpacity={0.28}
                    />
                  )}

                  {/* Main Red-String or Dashed Unverified Thread */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      isSelected
                        ? '#fbbf24'
                        : verified
                        ? '#ef4444'
                        : '#52525b'
                    }
                    strokeWidth={isSelected ? 3.5 : verified ? 2.5 : 1.8}
                    strokeDasharray={verified ? undefined : '8 6'}
                  />

                  {/* Midpoint Evidence Tag Pill */}
                  <rect
                    x={midX - 88}
                    y={midY - 13}
                    width={176}
                    height={26}
                    rx={6}
                    fill={
                      isSelected
                        ? '#451a03'
                        : verified
                        ? '#450a0a'
                        : '#18181b'
                    }
                    stroke={
                      isSelected
                        ? '#fbbf24'
                        : verified
                        ? '#ef4444'
                        : '#3f3f46'
                    }
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={
                      isSelected
                        ? '#fde68a'
                        : verified
                        ? '#fecaca'
                        : '#a1a1aa'
                    }
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {verified ? `✓ ${link.label}` : `? ${link.label}`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* PINNED SUSPECT & ENTITY CARDS */}
          {pins.map((pin) => {
            const isSelected = activePin?.id === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => {
                  soundscape.playDieSelect();
                  setSelectedPinId(pin.id);
                  setSelectedLinkId(null);
                }}
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-36 sm:w-48 p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-lg ${
                  isSelected
                    ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/30 z-20 scale-105'
                    : 'bg-zinc-900/95 border-zinc-700 hover:border-red-400/70 z-10'
                }`}
              >
                {/* Red Pushpin */}
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 border border-red-200 shadow" />

                <div className="flex items-center gap-2">
                  {pin.avatar && (
                    <img
                      src={pin.avatar}
                      alt={pin.title}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-amber-500/40 shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-red-400 truncate">
                      {pin.tag}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-white truncate">
                      {pin.title}
                    </div>
                    <div className="font-mono text-[9px] text-zinc-400 truncate hidden sm:block">
                      {pin.role}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* BOTTOM FORENSIC CONNECTION INSPECTOR */}
        <div className="p-4 sm:p-5 bg-zinc-900/90 flex-1 overflow-y-auto">
          {activeLink ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded border font-semibold ${
                      isLinkVerified(activeLink)
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {isLinkVerified(activeLink)
                      ? t('board.verified_link', '✓ VERIFIED EVIDENCE LINK', lang)
                      : t('board.unverified_lead', 'UNVERIFIED LEAD', lang)}
                  </span>
                  <span className="text-amber-300 font-semibold">
                    {activeLink.label}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {isLinkVerified(activeLink)
                    ? activeLink.verifiedExplanation
                    : activeLink.unverifiedHint}
                </p>
              </div>

              {/* Open linked Evidence Dossier button if verified */}
              {isLinkVerified(activeLink) && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  {activeLink.evidenceItemIds
                    .filter((id) => state.inventory.includes(id))
                    .map((itemId) => {
                      const itemObj = ITEMS_CATALOG[itemId];
                      return (
                        <button
                          key={itemId}
                          onClick={() => {
                            soundscape.playDieSelect();
                            onInspectEvidenceItem(itemId);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-200 font-mono text-xs uppercase tracking-wider cursor-pointer"
                        >
                          {t('board.open_exhibit', 'Open', lang)} {getLocalizedItemName(itemId, itemObj?.title || itemId, lang)} &rarr;
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          ) : activePin ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {activePin.avatar && (
                  <img
                    src={activePin.avatar}
                    alt={activePin.title}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/50 shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-red-400">
                    <span>{activePin.tag}</span>
                    <span>•</span>
                    <span className="text-zinc-400">{activePin.role}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {activePin.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {activePin.summary}
                  </p>
                </div>
              </div>
              <div className="font-mono text-[11px] text-zinc-400 shrink-0">
                {t('board.tip', 'Tip: Click any red-string thread on the board to inspect the linking forensic exhibit.', lang)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
