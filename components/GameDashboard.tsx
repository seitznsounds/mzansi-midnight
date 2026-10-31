'use client';

import React, { useState, useEffect } from 'react';
import {
  GameState,
  Die,
  ActionSlot,
  ActionEffect,
  FactionId,
  FactionPerkId,
} from '../types/game';
import {
  resolveActionSlot,
  advanceToNextDay,
  isCorridorRoadblocked,
  hasFreeRoadblockBypass,
  travelToNode,
  activateGeneratorDiesel,
  activateFactionPerk,
  getHostileTurfPenalty,
  purchaseBlackMarketGear,
} from '../engine/resolver';
import { ITEMS_CATALOG } from '../data/itemsCatalog';
import { initialGameState } from '../data/initialState';
import { transitionToAct2 } from '../data/act2State';
import { getTacticalRecommendation } from '../engine/advisor';
import { soundscape } from '../engine/soundscape';
import { triggerHaptic } from '../engine/nativeBridge';
import { SegmentedClock } from './ThreatClock';
import { DistrictSvgMap } from './DistrictSvgMap';
import { EventModal } from './EventModal';
import { EndingScreen } from './EndingScreen';
import { ObjectiveTracker } from './ObjectiveTracker';
import { TutorialOverlay } from './TutorialOverlay';
import { EvidenceDossierModal } from './EvidenceDossierModal';
import { ConspiracyBoardModal } from './ConspiracyBoardModal';
import { EndCycleModal } from './EndCycleModal';
import { MissionStatusModal } from './MissionStatusModal';
import ContactDialogueModal, {
  hasAvailableUnclaimedDialogueReward,
} from './ContactDialogueModal';
import { DEFAULT_GAME_SETTINGS, GameSettings } from '../types/settings';
import { calculateAdrenaline } from '../engine/adrenaline';
import { AdrenalineVignette } from './AdrenalineVignette';
import { ActionOutcomeDispatch, RollFeedbackData } from './ActionOutcomeDispatch';
import { CutsceneModal } from './CutsceneModal';
import { STORY_CUTSCENES } from '../data/cutscenes';
import { LeaderboardModal } from './LeaderboardModal';
import { UserProfileModal } from './UserProfileModal';
import { getSavedUserProfile, subscribeToUserProfile } from '../engine/cloudSync';
import { UserProfile } from '../types/leaderboard';
import { formatSpeedrunTime } from '../engine/scoringEngine';

const EVENT_TO_CUTSCENE_MAP: Record<string, string> = {
  evt_climax_berth14: 'cutscene_berth14_breach',
  evt_highveld_climax_kendon: 'cutscene_kendon_sabotage',
  evt_namaqua_climax_arms_drop: 'cutscene_namaqua_drop',
  evt_climax_pier109: 'cutscene_cape_dockers',
  evt_summit_breach_climax: 'cutscene_octagon_bunker',
};

import {
  t,
  getLocalizedNode,
  getLocalizedClockTitle,
  getLocalizedItemName,
  getLocalizedFactionName,
  getLocalizedSlot,
  formatLocalizedOutcomeSummary,
  getLocalizedCatalogItem,
  getLocalizedLogEntry,
  getLocalizedContactName,
  getLocalizedContactRole,
  getLocalizedStatName,
} from '../engine/i18n';

const GUIDE_SEEN_KEY = 'mzansi_midnight_seen_guide_v1';

const FACTION_LABELS: Record<FactionId, string> = {
  abasanta: 'Abasanta Cartel',
  city_hall: 'City Hall (Ma-Sibi)',
  saps_trt: 'SAPS TRT (Mokoena)',
  street_syndicate: 'Queen St. Syndicate',
  hawks: 'DPCI Hawks Holdout',
  megawatt_cartel: 'The Megawatt Cartel',
  sandton_arbitrage: 'Sandton Energy Arbitrage',
  reef_zamazamas: 'The Reef Zama-Zamas',
  siu_clean_hands: 'SIU Clean Hands',
  red_guard_populists: 'Red Guard Populists',
  aegis_marine: 'Aegis-Atlantis Marine',
  artisanal_divers: 'Artisanal Shore Divers',
  kalahari_runners: 'Kalahari Desert Runners',
  namaqua_command: 'Namaqua Coastal Command',
  namib_syndicate: 'Namib Diamond Syndicate',
  long_street_racket: 'Long Street Racket',
  cape_gang_federation: 'Cape Gang Federation',
  winelands_club: 'Winelands Capital Club',
  agu_renegades: 'AGU Renegades',
  dockers_union: 'Table Bay Dockers Union',
  united_hawks_taskforce: 'United Hawks Taskforce',
  the_sovereign_octagon: 'The Sovereign Octagon',
  constitutional_court_guard: 'Constitutional Court Guard',
  national_grid_command: 'National Grid Command',
  people_resistance_front: "People's Resistance Front",
};

const CLOCK_SHORT_LABELS: Record<string, string> = {
  mokoena_sweep: 'Sweep',
  nandi_condition: "Nandi's Wound",
  precinct_heat: 'Heat',
  audit_docket_409: 'Docket Audit',
  crack_auditor_phone: 'Phone Crack',
  berth_14_countdown: 'Berth 14 Finale',
  cartel_hit_squad: 'Hit Squad',
  commission_subpoena: 'Contempt',
  trace_offshore_trust: 'Trust Trace',
  compile_ballistics_file: 'Lab Telemetry',
  tarmac_extraction_countdown: 'Flight ZS-900',
  megawatt_sabotage: 'Grid Sabotage',
  rockfall_hazard: 'Rockfall Hazard',
  nia_surveillance: 'NIA Wiretaps',
  siu_tribunal_docket: 'SIU Docket',
  crack_midas_coldstorage: 'Midas Decrypt',
  kendon_blackout_countdown: 'Blackout Climax',
  malmokken_fog: 'Malmokken Fog',
  aegis_naval_patrol: 'Naval Patrol',
  desert_heat_exhaustion: 'Radiator Heat',
  admiralty_investigation: 'Admiralty Docket',
  diver_bends_hazard: 'Bends Hazard',
  orange_river_arms_drop: 'Arms Drop Climax',
  gang_turf_war_clock: 'Turf War',
  cape_doctor_gale_clock: 'Cape Doctor',
  general_swart_manhunt: 'Swart Purge',
  red_cipher_decryption: 'Red Cipher',
  nightclub_extortion_clock: 'Protection Racket',
  sovereign_arms_shipment: 'Berth 109 Arms',
  national_blackout_countdown: 'Blackout Countdown',
  octagon_mercenary_sweep: 'Mercenary Sweep',
  airspace_radar_jamming: 'Radar Jamming',
  treason_indictment_docket: 'Treason Docket',
  decrypt_master_omega_cipher: 'Omega Cipher',
  midnight_sun_coup_countdown: 'Coup Countdown',
};

function formatOutcomeSummary(effect: ActionEffect): string {
  const parts: string[] = [];
  if (effect.cashDelta) {
    parts.push(
      `${effect.cashDelta > 0 ? '+' : ''}R${effect.cashDelta.toLocaleString()}`
    );
  }
  if (effect.composureDelta) {
    parts.push(
      `${effect.composureDelta > 0 ? '+' : ''}${effect.composureDelta}% Comp`
    );
  }
  if (effect.clockProgress) {
    for (const cp of effect.clockProgress) {
      const label = CLOCK_SHORT_LABELS[cp.clockId] || cp.clockId;
      parts.push(`${cp.delta > 0 ? '+' : ''}${cp.delta} ${label}`);
    }
  }
  if (effect.factionRepDelta) {
    for (const fr of effect.factionRepDelta) {
      const label = FACTION_LABELS[fr.factionId]?.split(' ')[0] || fr.factionId;
      parts.push(`${fr.delta > 0 ? '+' : ''}${fr.delta} ${label} Rep`);
    }
  }
  if (effect.addInventoryItem) {
    parts.push(
      `+${ITEM_LABELS[effect.addInventoryItem] || effect.addInventoryItem}`
    );
  }
  if (effect.unlockNodeIds && effect.unlockNodeIds.length > 0) {
    parts.push(`Unlocks ${effect.unlockNodeIds.length} Lead(s)`);
  }
  return parts.length > 0 ? parts.join(' • ') : 'No status shift';
}

const FACTION_AVATARS: Record<FactionId, string> = {
  // Story 1: eThekwini-Gold
  abasanta: '/assets/characters/zuko.jpg',
  city_hall: '/assets/characters/masibi.jpg',
  saps_trt: '/assets/characters/mokoena.jpg',
  street_syndicate: '/assets/characters/bheki.jpg',
  hawks: '/assets/characters/nandi.jpg',

  // Story 2: Highveld-Chrome
  megawatt_cartel: '/assets/characters/sithole.jpg',
  sandton_arbitrage: '/assets/characters/helena.jpg',
  reef_zamazamas: '/assets/characters/mkhulu.jpg',
  siu_clean_hands: '/assets/characters/khumalo.jpg',
  red_guard_populists: '/assets/characters/vusi.jpg',

  // Story 3: Namaqua-Diamond
  aegis_marine: '/assets/characters/petrov.jpg',
  artisanal_divers: '/assets/characters/bettie.jpg',
  kalahari_runners: '/assets/characters/swartbooi.jpg',
  namaqua_command: '/assets/characters/cloete.jpg',
  namib_syndicate: '/assets/characters/oom_dirk.jpg',

  // Story 4: Cape-Nocturne
  long_street_racket: '/assets/characters/zack.jpg',
  cape_gang_federation: '/assets/characters/ronnie.jpg',
  winelands_club: '/assets/characters/claudine.jpg',
  agu_renegades: '/assets/characters/warren.jpg',
  dockers_union: '/assets/characters/cassiem.jpg',

  // Story 5: The Sovereign Octagon
  united_hawks_taskforce: '/assets/characters/taskforce.jpg',
  the_sovereign_octagon: '/assets/characters/sterling_swart.jpg',
  constitutional_court_guard: '/assets/characters/sindi.jpg',
  national_grid_command: '/assets/characters/kabelo.jpg',
  people_resistance_front: '/assets/characters/bheki_cassiem.jpg',
};

const NODE_CONTACT_MAP: Record<
  string,
  { name: string; role: string; avatar: string }
> = {
  n1_safehouse: {
    name: 'Constable Nandi',
    role: 'Wounded Whistleblower • Key Witness',
    avatar: '/assets/characters/nandi.jpg',
  },
  n2_taxi_rank: {
    name: 'Bra Bheki Sithole',
    role: 'Queen Street Taxi Boss • Syndicate Fixer',
    avatar: '/assets/characters/bheki.jpg',
  },
  n3_central_precinct: {
    name: 'Brigadier Titus Mokoena',
    role: 'SAPS TRT Commander • Cartel Enforcer',
    avatar: '/assets/characters/mokoena.jpg',
  },
  n4_city_hall: {
    name: 'Councillor "Ma-Sibi" Khumalo',
    role: 'Metro Renewal Coalition • Tender Mafia',
    avatar: '/assets/characters/masibi.jpg',
  },
  n5_cyber_pawn: {
    name: 'Sparks',
    role: 'Signals & Hardware Fixer • Black-Market Tech',
    avatar: '/assets/characters/sparks.jpg',
  },
  n6_pier2_port: {
    name: 'Zuko "The Architect" Ndlovu',
    role: 'Abasanta Logistics Kingpin • Berth 14',
    avatar: '/assets/characters/zuko.jpg',
  },
  n7_archive_basement: {
    name: 'Colonel Piet van der Merwe',
    role: 'DPCI Hawks Holdout • Clean Task Force',
    avatar: '/assets/characters/vandermerwe.jpg',
  },
  n8_ridge_penthouses: {
    name: 'Councillor "Ma-Sibi" Khumalo',
    role: 'Sovereign Pearl Trustee • Umhlanga Ridge',
    avatar: '/assets/characters/masibi.jpg',
  },
  n9_township_depot: {
    name: 'Bra Bheki Sithole',
    role: 'Northern Water Strike Marshal • Queen St. Alliance',
    avatar: '/assets/characters/bheki.jpg',
  },
  n10_high_court: {
    name: 'Colonel Piet van der Merwe',
    role: 'Commission Evidence Leader • DPCI Hawks',
    avatar: '/assets/characters/vandermerwe.jpg',
  },
  n11_citrus_estate: {
    name: 'Zuko "The Architect" Ndlovu',
    role: 'Midlands Super-Lab Proprietor • Abasanta',
    avatar: '/assets/characters/zuko.jpg',
  },
  n12_cargo_apron: {
    name: 'Brigadier Titus Mokoena',
    role: 'Hangar 7 Charter Escort • SAPS TRT',
    avatar: '/assets/characters/mokoena.jpg',
  },
  // Story 2: Highveld-Chrome Contacts
  h1_braamfontein_safehouse: {
    name: 'Kagiso "Bra K" Molefe',
    role: 'Disgraced SIU Auditor • Case Lead',
    avatar: '/assets/characters/bra_k.jpg',
  },
  h2_sandton_tower: {
    name: 'Helena Van Niekerk',
    role: 'Managing Director • Sandton Energy Arbitrage',
    avatar: '/assets/characters/helena.jpg',
  },
  h3_hillbrow_substation: {
    name: 'Vusi "Dynamite" Sithole',
    role: 'Red Guard Union Strike Marshal',
    avatar: '/assets/characters/vusi.jpg',
  },
  h4_witwatersrand_shaft: {
    name: 'Mkhulu "Ghost" Sibanyoni',
    role: 'Zama-Zama Mining Elder • Crown Mines',
    avatar: '/assets/characters/mkhulu.jpg',
  },
  h5_union_buildings: {
    name: 'General Sibusiso Sithole',
    role: 'Chief of Special Operations • NIA',
    avatar: '/assets/characters/sithole.jpg',
  },
  h6_kendon_coal_depot: {
    name: 'Weighbridge Dispatcher',
    role: 'Megawatt Cartel Logistics Overseer',
    avatar: '/assets/characters/dispatcher.jpg',
  },
  h7_siu_headquarters: {
    name: 'Advocate Nomsa Khumalo',
    role: 'SIU Lead Prosecutor • Special Tribunal',
    avatar: '/assets/characters/khumalo.jpg',
  },
  // Story 3: Namaqua-Diamond Contacts
  d1_port_nolloth_jetty: {
    name: 'Tannie Bettie van Zyl',
    role: 'Port Nolloth Fish Market Doyenne',
    avatar: '/assets/characters/bettie.jpg',
  },
  d2_alexander_bay_quarry: {
    name: 'Diver Shop Steward',
    role: 'Artisanal Shore Diver Foreman',
    avatar: '/assets/characters/shop_steward.jpg',
  },
  d3_richtersveld_canyon: {
    name: 'Swartbooi Witbooi',
    role: 'Nama Desert Elder • Kalahari Runners',
    avatar: '/assets/characters/swartbooi.jpg',
  },
  d4_debeers_ghost_mine: {
    name: 'Dirk "Oom Dirk" Coetzee',
    role: 'Dispossessed 1968 Concession Holder',
    avatar: '/assets/characters/oom_dirk.jpg',
  },
  d5_orange_river_pont: {
    name: 'Namib Pontoon Smuggler',
    role: 'Trans-Border Contraband Broker',
    avatar: '/assets/characters/pontoon_smuggler.jpg',
  },
  d6_aegis_coastal_compound: {
    name: 'Colonel Yuri Petrov',
    role: 'Commander • Aegis-Atlantis Marine',
    avatar: '/assets/characters/petrov.jpg',
  },
  d7_springbok_magistrate: {
    name: 'Captain Annelize Cloete',
    role: 'Sea Fisheries & Maritime Enforcement',
    avatar: '/assets/characters/cloete.jpg',
  },
  // Story 4: Cape-Nocturne Contacts
  c1_long_street_strip: {
    name: 'Zack "The Bull" Rossouw',
    role: 'Long Street Nightclub Security Boss',
    avatar: '/assets/characters/zack.jpg',
  },
  c2_manenberg_tenements: {
    name: 'Pastor Ronald "Uncle Ronnie" Jacobs',
    role: 'Community Peacemaker & Former 28s General',
    avatar: '/assets/characters/ronnie.jpg',
  },
  c3_camps_bay_promenade: {
    name: 'Baroness Claudine de Villiers',
    role: 'Winelands Heiress & Capital Club Trustee',
    avatar: '/assets/characters/claudine.jpg',
  },
  c4_table_bay_container_berth: {
    name: 'Cassiem Petersen',
    role: 'Harbour Stevedore Chief Shop Steward',
    avatar: '/assets/characters/cassiem.jpg',
  },
  c5_stellenbosch_wine_estate: {
    name: 'Estate Cellar Master',
    role: 'Winelands Trust Archivist',
    avatar: '/assets/characters/cellar_master.jpg',
  },
  c6_agu_safehouse_ruin: {
    name: 'Sergeant Warren Abrahams',
    role: 'Rogue AGU Ballistics Specialist',
    avatar: '/assets/characters/warren.jpg',
  },
  c7_provincial_police_hq: {
    name: 'Major-General Andre Swart',
    role: 'Provincial Police Commissioner • Shadow Commander',
    avatar: '/assets/characters/general_swart.jpg',
  },
  // Story 5: Sovereign Octagon Contacts
  o1_drakensberg_bunker: {
    name: 'Deputy Chief Justice Sindi Sithole',
    role: 'Constitutional Court of South Africa',
    avatar: '/assets/characters/sindi.jpg',
  },
  o2_union_buildings_subbasement: {
    name: 'Minister Phumzile Mthembu',
    role: 'Minister in the Presidency & Whistleblower',
    avatar: '/assets/characters/phumzile.jpg',
  },
  o3_apollo_grid_command: {
    name: 'Chief Engineer Kabelo Motaung',
    role: 'Apollo Transmission & SCADA Director',
    avatar: '/assets/characters/kabelo.jpg',
  },
  o4_durban_berth_command: {
    name: 'Bra Bheki & Cassiem Alliance',
    role: 'National Port Resistance Coordinators',
    avatar: '/assets/characters/bheki_cassiem.jpg',
  },
  o5_karoo_airspace_corridor: {
    name: 'Gideon Brand (Vanguard Lead)',
    role: 'Covert Strike Commander',
    avatar: '/assets/characters/giepie.jpg',
  },
  o6_stellenbosch_oligarch_vault: {
    name: 'Leila Hendricks (SIGINT Lead)',
    role: 'Forensic Intelligence Director',
    avatar: '/assets/characters/leila.jpg',
  },
  o7_octagon_summit_chamber: {
    name: 'Lord Sterling & General Swart',
    role: 'Supreme Architects of Operation Midnight Sun',
    avatar: '/assets/characters/sterling_swart.jpg',
  },
};

const ITEM_LABELS: Record<string, string> = {
  docket_409_raw: 'Docket #409 (Raw)',
  auditor_encrypted_phone: "Auditor's Encrypted Phone",
  decoded_tanker_ledger: 'Decoded Tanker Ledger',
  berth_14_manifest: 'Berth 14 Manifest',
  saps_radio_scanner: 'Cloned SAPS Scanner',
  item_burner_sim_array: 'Multi-IMSI Burner Array (+1 WIRE)',
  item_forged_auditor_id: 'Forged Treasury ID (+1 DCKT)',
  item_kevlar_vest: 'Kevlar Under-Vest (+1 STRT)',
  item_vip_transponder: 'VIP Dash Strobe (+1 INFL)',
  item_act1_scorched_valves: 'Scorched Berth 14 Valves (+1 STRT)',
  item_act1_subpoena_warrant: 'High Court Subpoena (+1 DCKT)',
  item_act1_shadow_retainer: 'Abasanta Retainer Key (+R1,500)',
  offshore_trust_deed: 'Sovereign Pearl Trust Deed',
  superlab_batch_telemetry: 'Super-Lab Batch Telemetry',
  item_sat_uplink: 'Inmarsat Sat-Terminal (+1 WIRE)',
  // Story 2 Highveld Items
  evidence_lerato_audit_notes: "Lerato's Cold Case Notes",
  evidence_bloomberg_substation_telemetry: 'Bloomberg Arbitrage Log',
  evidence_zamazama_reef_map: 'Crown Mines Stope Map',
  evidence_nia_sabotage_order: 'Signed NIA Black-Sky Order',
  gear_highveld_rebreather: 'Dräger Mining Respirator',
  gear_substation_scada_key: 'SCADA Optical Bypass Key',
  gear_sandton_pass: 'Sandton Arbitrage Smart-Card',
  dossier_project_midas: 'Project Midas Coal Ledger',
  // Story 3 Namaqua Items
  evidence_sonar_bathymetry_log: 'Sonar Bathymetry Survey',
  evidence_aegis_arms_bill: 'Aegis Armaments Consignment',
  evidence_namaqua_diamond_parcel: 'Alluvial Diamond Parcel (1,200ct)',
  gear_diver_knife: 'Titanium Diver’s Blade (+1 STRT)',
  gear_sand_tracks: 'Dune Recovery Tracks (+1 DCKT)',
  gear_satellite_compass: 'Iridium Satellite Compass (+1 WIRE)',
  dossier_admiralty_manifest: 'Table Bay Admiralty Manifest',
  // Story 4 Cape Items
  evidence_agu_ballistics_dossier: 'Murdered Partner Ballistics Dossier',
  evidence_winelands_trust_ledger: 'Stellenbosch Sovereign Trust Ledger',
  evidence_pier109_arms_bill: 'Pier 109 Stevedore Manifest',
  evidence_red_cipher_fragment: 'Red Protocol Cryptographic Key Fragment',
  gear_reinforced_agu_vest: 'Reinforced Tactical AGU Vest (+1 STRT)',
  gear_encrypted_burner_mesh: 'Encrypted Darknet Burner Mesh (+1 WIRE)',
  gear_stevedore_prybar: 'Hardened Stevedore Berth Prybar (+1 DCKT)',
  dossier_red_protocol: 'The Grand Sovereign Protocol',
  // Story 5 Octagon Items
  evidence_constitutional_indictment: 'Master Constitutional Indictment',
  evidence_omega_protocol: 'Operation Midnight Sun Master Cipher',
  gear_taskforce_satellite_uplink: 'Secure Military Satellite Transceiver (+1 WIRE)',
  gear_black_sky_respirator: 'Closed-Circuit Command Respirator (+1 STRT)',
  gear_scada_master_key: 'Eskom Apollo SCADA Master Key (+1 DCKT)',
  dossier_master_archive: 'The Consolidated Republic Archive',
};

const FACTION_PERKS: {
  id: FactionPerkId;
  title: string;
  factionId: FactionId;
  minRep: number;
  costCash?: number;
  description: string;
}[] = [
  {
    id: 'perk_grid_manipulation',
    title: 'Grid Manipulation',
    factionId: 'city_hall',
    minRep: 1,
    description: 'Toggle Stage 2 / Stage 6 Load Shedding',
  },
  {
    id: 'perk_bluelight_escort',
    title: 'Blue-Light Escort',
    factionId: 'saps_trt',
    minRep: 1,
    description: 'Clear -2 Precinct Heat & -1 Sweep',
  },
  {
    id: 'perk_izinkabi_muscle',
    title: 'Izinkabi Muscle (R600)',
    factionId: 'street_syndicate',
    minRep: 2,
    costCash: 600,
    description: 'Upgrade lowest unused die to a 6',
  },
  {
    id: 'perk_hawks_safechannel',
    title: 'Hawks Safe-Channel',
    factionId: 'hawks',
    minRep: 2,
    description: 'Recover +15% Composure & -1 Sweep',
  },
  // Story 2 Highveld Perks
  {
    id: 'perk_substation_bypass',
    title: 'Substation SCADA Bypass',
    factionId: 'red_guard_populists',
    minRep: 1,
    description: 'Reroute breakers to reduce Megawatt Sabotage (-1 Clock)',
  },
  {
    id: 'perk_sandton_liquidity',
    title: 'Sandton Liquidity Line',
    factionId: 'sandton_arbitrage',
    minRep: 1,
    description: 'Draw R800 operational liquidity advance from Sandton Arbitrage',
  },
  {
    id: 'perk_zamazama_tunnels',
    title: 'Zama-Zama Stope Infiltration',
    factionId: 'reef_zamazamas',
    minRep: 1,
    description: 'Navigate unmapped stopes (+10% Comp, -1 Rockfall Hazard)',
  },
  {
    id: 'perk_siu_subpoena',
    title: 'SIU Expedited Subpoena',
    factionId: 'siu_clean_hands',
    minRep: 1,
    description: 'Issue Section 205 asset freeze orders (+1 SIU Docket)',
  },
  {
    id: 'perk_red_guard_strike',
    title: 'Red Guard Highway Blockade (R300)',
    factionId: 'red_guard_populists',
    minRep: 2,
    costCash: 300,
    description: 'Blockade N4/N12 coal corridors (-1 Kendon Countdown)',
  },
  // Story 3 Namaqua Perks
  {
    id: 'perk_diver_compression',
    title: 'Diver Decompression Table',
    factionId: 'artisanal_divers',
    minRep: 1,
    description: 'Oxygen soak table (-2 Bends Hazard, +10% Composure)',
  },
  {
    id: 'perk_kalahari_fuel_drop',
    title: 'Kalahari Emergency Fuel Drop',
    factionId: 'kalahari_runners',
    minRep: 1,
    description: 'Deliver diesel jerrycans & springwater (-2 Heat Hazard, +R200)',
  },
  {
    id: 'perk_sea_fisheries_impound',
    title: 'Sea Fisheries Patrol Impound',
    factionId: 'namaqua_command',
    minRep: 1,
    description: 'Impound mercenary skiffs (+1 Admiralty Investigation, -1 Naval Patrol)',
  },
  {
    id: 'perk_namib_gem_valuation',
    title: 'Namib Gem Valuation Cashout',
    factionId: 'namib_syndicate',
    minRep: 1,
    description: 'Liquidate rough alluvial stones (+R750 cash, +5% Composure)',
  },
  {
    id: 'perk_radar_scramble',
    title: 'Coastal Radar Frequency Scramble',
    factionId: 'aegis_marine',
    minRep: 1,
    description: 'Blind tactical radar towers (-2 Naval Patrol, +1 Fog Stealth)',
  },
  // Story 4 Cape Perks
  {
    id: 'perk_bouncer_shakedown',
    title: 'Bouncer Shakedown Retainers',
    factionId: 'long_street_racket',
    minRep: 1,
    description: 'Collect nightclub protection retainers (+R600 cash, +10% Composure)',
  },
  {
    id: 'perk_flats_recon',
    title: 'Cape Flats Street Recon',
    factionId: 'cape_gang_federation',
    minRep: 1,
    description: 'Deploy street lookouts to track death squads (-2 Gang Turf War, -1 Swart Manhunt)',
  },
  {
    id: 'perk_winelands_liquidity',
    title: 'Winelands Capital Advance',
    factionId: 'winelands_club',
    minRep: 1,
    description: 'Draw R1,000 operational advance from Swiss trusts (-10% Composure)',
  },
  {
    id: 'perk_agu_ballistics',
    title: 'AGU Ballistics Audit',
    factionId: 'agu_renegades',
    minRep: 1,
    description: 'Run forensic striation match (+1 Decrypt Red Cipher)',
  },
  {
    id: 'perk_dockers_blockade',
    title: 'Stevedore Dock Blockade',
    factionId: 'dockers_union',
    minRep: 1,
    description: 'Kill power to container spreaders (-2 Sovereign Arms Shipment)',
  },
  // Story 5 Sovereign Octagon Perks
  {
    id: 'perk_taskforce_airlift',
    title: 'Taskforce Tactical Airlift',
    factionId: 'united_hawks_taskforce',
    minRep: 1,
    description: 'SAAF airlift repositions strike units (-2 Mercenary Sweep, +15% Composure)',
  },
  {
    id: 'perk_constitutional_subpoena',
    title: 'Constitutional Emergency Subpoena',
    factionId: 'constitutional_court_guard',
    minRep: 1,
    description: 'High Court Section 179 injunction (+1 Treason Indictment, -1 Coup Countdown)',
  },
  {
    id: 'perk_black_start_bypass',
    title: 'Apollo Black-Start Bypass',
    factionId: 'national_grid_command',
    minRep: 1,
    description: 'Isolate SCADA multiplexer relays (-2 Blackout Countdown, +10% Composure)',
  },
  {
    id: 'perk_mass_civil_mobilization',
    title: 'Mass Civil Mobilization',
    factionId: 'people_resistance_front',
    minRep: 1,
    description: 'Nationwide union blockades (-1 Mercenary Sweep, -1 Coup Countdown, +R300)',
  },
  {
    id: 'perk_signals_intercept_omega',
    title: 'Signals Intercept Omega',
    factionId: 'the_sovereign_octagon',
    minRep: 1,
    description: 'Tap Octagon satellite command link (+1 Omega Decryption, -1 Radar Jamming)',
  },
];

type MobileTab = 'map' | 'actions' | 'clocks';

// Standard 3x3 die face pip indices (0..8) for values 1..6
const DICE_PIP_INDICES: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const PIP_COORDS: { cx: number; cy: number }[] = [
  { cx: 9, cy: 9 },
  { cx: 18, cy: 9 },
  { cx: 27, cy: 9 },
  { cx: 9, cy: 18 },
  { cx: 18, cy: 18 },
  { cx: 27, cy: 18 },
  { cx: 9, cy: 27 },
  { cx: 18, cy: 27 },
  { cx: 27, cy: 27 },
];

const DiceFaceContent: React.FC<{
  value: number;
  mode: 'numbers' | 'dots';
  isUsed: boolean;
  isSelected: boolean;
  isRolling: boolean;
}> = ({ value, mode, isUsed, isSelected, isRolling }) => {
  if (mode === 'numbers') {
    return <span className="font-bold tracking-tight">{value}</span>;
  }

  const activeIndices = DICE_PIP_INDICES[value] || [4];

  // High-contrast pip fill & stroke colors by state
  const getPipColors = () => {
    if (isRolling) {
      return { fill: '#fde047', stroke: '#f59e0b', socket: 'rgba(253,224,71,0.15)' };
    }
    if (isUsed) {
      return { fill: '#71717a', stroke: '#3f3f46', socket: 'rgba(113,113,122,0.12)' };
    }
    if (isSelected) {
      // Dark obsidian pips on solid glowing gold selected die
      return {
        fill: value === 1 ? '#dc2626' : '#09090b',
        stroke: 'rgba(255,255,255,0.35)',
        socket: 'rgba(9,9,11,0.14)',
      };
    }
    // Unthrown / available die: ultra-bright ivory-gold pips (or bright crimson-amber ace pip) on lit slate surface
    if (value === 1) {
      return { fill: '#f87171', stroke: '#fecaca', socket: 'rgba(255,255,255,0.12)' };
    }
    if (value >= 5) {
      return { fill: '#6ee7b7', stroke: '#ffffff', socket: 'rgba(255,255,255,0.12)' };
    }
    return { fill: '#fef08a', stroke: '#f59e0b', socket: 'rgba(255,255,255,0.12)' };
  };

  const { fill, stroke, socket } = getPipColors();

  return (
    <svg
      viewBox="0 0 36 36"
      className="w-8 h-8 sm:w-9 sm:h-9 pointer-events-none shrink-0"
      aria-label={`Die value ${value}`}
    >
      {PIP_COORDS.map((coord, idx) => {
        const hasPip = activeIndices.includes(idx);
        if (!hasPip) {
          return (
            <circle
              key={idx}
              cx={coord.cx}
              cy={coord.cy}
              r={1.3}
              fill={socket}
            />
          );
        }
        return (
          <circle
            key={idx}
            cx={coord.cx}
            cy={coord.cy}
            r={value === 1 ? 4.6 : 3.7}
            fill={fill}
            stroke={stroke}
            strokeWidth={1.1}
          />
        );
      })}
    </svg>
  );
};

export const GameDashboard: React.FC<{
  initialData: GameState;
  settings?: GameSettings;
  onUpdateSettings?: (next: GameSettings) => void;
  onStateChange?: (nextState: GameState) => void;
  onManualSave?: (currentState: GameState) => void;
  onOpenSettings?: () => void;
  onReturnToMenu?: () => void;
  onRestart?: () => void;
}> = ({
  initialData,
  settings,
  onUpdateSettings,
  onStateChange,
  onManualSave,
  onOpenSettings,
  onReturnToMenu,
  onRestart,
}) => {
  const [state, setState] = useState<GameState>(initialData);
  const [fallbackDiceMode, setFallbackDiceMode] = useState<'numbers' | 'dots'>(
    'numbers'
  );
  const activeDiceMode = settings?.diceDisplayMode ?? fallbackDiceMode;
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initialData.currentNodeId || 'n1_safehouse'
  );
  const [selectedDieId, setSelectedDieId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('map');
  const [isRollingDice, setIsRollingDice] = useState<boolean>(false);
  const [isGridFlashing, setIsGridFlashing] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBoardOpen, setIsBoardOpen] = useState<boolean>(false);
  const [inspectedItemId, setInspectedItemId] = useState<string | null>(null);
  const [isContactDialogueOpen, setIsContactDialogueOpen] =
    useState<boolean>(false);
  const [isEndCycleModalOpen, setIsEndCycleModalOpen] = useState<boolean>(false);
  const [isMissionStatusOpen, setIsMissionStatusOpen] = useState<boolean>(false);
  const [saveFlash, setSaveFlash] = useState<boolean>(false);
  const [lastRollFeedback, setLastRollFeedback] =
    useState<RollFeedbackData | null>(null);
  const [lastResolvedSlotId, setLastResolvedSlotId] = useState<string | null>(null);
  const [activeCutsceneId, setActiveCutsceneId] = useState<string | null>(null);
  const [seenCutsceneIds, setSeenCutsceneIds] = useState<Set<string>>(new Set());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isMobileOpsOpen, setIsMobileOpsOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    getSavedUserProfile()
  );

  // Subscribe to real-time user profile & cloud auth changes
  useEffect(() => {
    const unsubscribe = subscribeToUserProfile((updated) => {
      setUserProfile(updated);
    });
    return () => unsubscribe();
  }, []);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Speedrun stopwatch tracker
  useEffect(() => {
    if (!state.runStartTime) {
      setState((prev) => ({ ...prev, runStartTime: Date.now() }));
    }
    const interval = setInterval(() => {
      if (state.runStartTime) {
        setElapsedSeconds(
          Math.max(0, Math.floor((Date.now() - state.runStartTime) / 1000))
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.runStartTime]);

  const adrenaline = calculateAdrenaline(state);

  // Auto-trigger cinematic cutscene when a climax showdown event reaches the queue
  useEffect(() => {
    const topEventId = state.triggeredEventsQueue[0];
    if (topEventId && EVENT_TO_CUTSCENE_MAP[topEventId]) {
      const cutsceneId = EVENT_TO_CUTSCENE_MAP[topEventId];
      if (!seenCutsceneIds.has(cutsceneId)) {
        setActiveCutsceneId(cutsceneId);
      }
    }
  }, [state.triggeredEventsQueue, seenCutsceneIds]);


  // Auto-open tutorial on first-ever map visit (if enabled in settings)
  useEffect(() => {
    if (settings && !settings.autoShowTutorial) return;
    try {
      const seen = window.localStorage.getItem(GUIDE_SEEN_KEY);
      if (!seen) {
        setIsGuideOpen(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Sync state up for localStorage persistence
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  const currentLang = settings?.language ?? 'en';
  const activeNode = state.nodes[selectedNodeId];
  const localizedActiveNode = activeNode
    ? getLocalizedNode(activeNode.id, activeNode.title, activeNode.subtitle, currentLang)
    : null;
  const selectedDie = state.dicePool.find((d) => d.id === selectedDieId);
  const turfPenalty = getHostileTurfPenalty(state, selectedNodeId);
  const nodeContact = NODE_CONTACT_MAP[selectedNodeId];
  const nodeShopItems = Object.values(ITEMS_CATALOG).filter(
    (item) => item.category === 'gear' && item.soldAtNodeId === selectedNodeId
  );

  const hasFinaleLeverage =
    state.act === 2
      ? state.inventory.includes('offshore_trust_deed') ||
        state.inventory.includes('superlab_batch_telemetry')
      : state.inventory.includes('decoded_tanker_ledger') ||
        state.inventory.includes('berth_14_manifest');

  // Count critical threat clocks (within 1 segment of max) for mobile badge
  const urgentThreatCount = Object.values(state.clocks).filter(
    (c) => c.type === 'threat' && c.current >= c.max - 1
  ).length;

  const unusedDiceCount = state.dicePool.filter((d) => !d.isUsed).length;
  const usedDiceCount = state.dicePool.filter((d) => d.isUsed).length;

  const currentRecommendation = getTacticalRecommendation(state, selectedDieId);

  const isBlockedByRoadblock =
    state.currentNodeId !== selectedNodeId &&
    isCorridorRoadblocked(state, state.currentNodeId, selectedNodeId) &&
    !hasFreeRoadblockBypass(state);

  const handleSelectNode = (nodeId: string) => {
    soundscape.playDieSelect();
    setSelectedNodeId(nodeId);
    if (
      state.currentNodeId !== nodeId &&
      (!isCorridorRoadblocked(state, state.currentNodeId, nodeId) ||
        hasFreeRoadblockBypass(state))
    ) {
      setState((prev) => travelToNode(prev, nodeId, 'free'));
    }
  };

  // Calculate live outcome preview when a die is held/selected
  const getPreviewStyle = (slot: ActionSlot, die: Die | undefined) => {
    if (slot.isCompleted || isBlockedByRoadblock) {
      return 'border-zinc-900 bg-zinc-950/60 opacity-45 cursor-not-allowed';
    }
    if (
      state.loadSheddingStage === 6 &&
      slot.disabledDuringStage6 &&
      !state.generatorActiveToday
    ) {
      return 'border-zinc-800 bg-zinc-950 opacity-40 cursor-not-allowed';
    }
    if (slot.requiredItem && !state.inventory.includes(slot.requiredItem)) {
      return 'border-zinc-800 bg-zinc-950 opacity-50 cursor-not-allowed';
    }
    if (slot.costCash && state.cash < slot.costCash) {
      return 'border-red-800/80 bg-red-950/20';
    }
    if (!die || die.isUsed) return 'border-zinc-800 bg-zinc-900/60';

    const statMod = slot.stat === 'any' ? 0 : state.stats[slot.stat];
    const blackoutMod =
      state.loadSheddingStage === 6 ? (slot.stage6BonusModifier ?? 0) : 0;
    const total = die.value + statMod + blackoutMod + turfPenalty;

    if (total >= 6) return 'border-emerald-500 bg-emerald-950/30 cursor-pointer';
    if (total >= 4) return 'border-amber-500 bg-amber-950/30 cursor-pointer';
    return 'border-red-500 bg-red-950/30 cursor-pointer';
  };

  const handleAssignDie = (slotId: string, dieId?: string) => {
    const slot = activeNode?.actionSlots.find((s) => s.id === slotId);
    if (!slot || slot.isCompleted) return;

    const locSlot = getLocalizedSlot(slot, currentLang);
    const activeDieId = dieId || selectedDieId;

    if (!activeDieId) {
      soundscape.playOutcome('failure');
      triggerHaptic('warning');
      setLastResolvedSlotId(slotId);
      setLastRollFeedback({
        title: locSlot.title,
        rollMath: t('ui.no_die_selected', 'NO DIE SELECTED', currentLang),
        tier: 'blocked',
        narrative: t(
          'ui.no_die_selected_desc',
          'Select an available die from the bottom dock (Dice #1–5) before assigning it to this action slot.',
          currentLang
        ),
        summary: t('ui.assign_die_prompt', 'SELECT A DIE BELOW', currentLang),
      });
      return;
    }

    const die = state.dicePool.find((d) => d.id === activeDieId);
    if (!die || die.isUsed) return;

    const nextState = resolveActionSlot(
      state,
      selectedNodeId,
      slotId,
      activeDieId
    );

    // Check if the die was actually consumed (not blocked by roadblock/cash/Stage 6)
    const wasConsumed = nextState.dicePool.find((d) => d.id === activeDieId)?.isUsed;

    if (wasConsumed) {
      const statMod = slot.stat === 'any' ? 0 : state.stats[slot.stat];
      const blackoutMod =
        state.loadSheddingStage === 6 ? (slot.stage6BonusModifier ?? 0) : 0;
      const totalMod = statMod + blackoutMod + turfPenalty;
      const finalRoll = die.value + totalMod;
      const tier: 'clean' | 'compromised' | 'failure' =
        finalRoll >= 6 ? 'clean' : finalRoll >= 4 ? 'compromised' : 'failure';
      const chosenOutcome = slot.outcomes[tier];

      soundscape.playAdrenalineOutcome(tier, adrenaline.level);
      triggerHaptic(
        tier === 'clean' ? 'success' : tier === 'compromised' ? 'impact' : 'heavy'
      );
      setLastResolvedSlotId(slotId);
      setLastRollFeedback({
        title: locSlot.title,
        rollMath: `Die ${die.value} ${totalMod >= 0 ? `+ ${totalMod}` : `- ${Math.abs(totalMod)}`} = ${finalRoll}`,
        tier,
        narrative: chosenOutcome.narrativeLog,
        summary: formatOutcomeSummary(chosenOutcome),
      });
      setSelectedDieId(null);
    } else {
      soundscape.playOutcome('failure');
      triggerHaptic('warning');
      setLastResolvedSlotId(slotId);

      // Extract precise blocking reason with tactical advice
      let blockedMath = t('ui.action_blocked', 'ACTION BLOCKED', currentLang);
      let blockedNarrative =
        nextState.activeLog[0] ||
        t('ui.action_cannot_execute', 'Cannot execute this action.', currentLang);
      let blockedSummary = t('ui.blocked', 'BLOCKED', currentLang);

      if (slot.costCash && state.cash < slot.costCash) {
        const shortfall = slot.costCash - state.cash;
        blockedMath = `${t('ui.insufficient_funds', 'INSUFFICIENT FUNDS', currentLang)} [R${state.cash.toLocaleString()} / R${slot.costCash.toLocaleString()}]`;
        blockedNarrative = t(
          'ui.blocked_funds_desc',
          'Insufficient funds: Requires R{cost} to bribe or finance this action, but your operative war-chest only has R{have}. You are short R{shortfall}. Liquidate evidence at the pawn shop or collect syndicate retainers.',
          currentLang
        )
          .replace('{cost}', slot.costCash.toLocaleString())
          .replace('{have}', state.cash.toLocaleString())
          .replace('{shortfall}', shortfall.toLocaleString());
        blockedSummary = `${t('ui.short', 'SHORT', currentLang)} R${shortfall.toLocaleString()}`;
      } else if (
        state.currentNodeId !== selectedNodeId &&
        isCorridorRoadblocked(state, state.currentNodeId, selectedNodeId) &&
        !hasFreeRoadblockBypass(state)
      ) {
        blockedMath = t('ui.saps_roadblock', 'SAPS ROADBLOCK ACTIVE', currentLang);
        blockedNarrative = t(
          'ui.blocked_roadblock_desc',
          'Corridor to {node} is quarantined by SAPS Highway Patrol. Bribe the cordon (R200) or sacrifice 1 Die for a back-alley detour before executing actions here.',
          currentLang
        ).replace('{node}', activeNode?.title ?? '');
        blockedSummary = t('ui.roadblock_quarantine', 'CORDON ACTIVE', currentLang);
      } else if (
        state.loadSheddingStage === 6 &&
        slot.disabledDuringStage6 &&
        !state.generatorActiveToday
      ) {
        blockedMath = t('ui.stage6_blackout', 'STAGE 6 BLACKOUT', currentLang);
        blockedNarrative = t(
          'ui.blocked_stage6_desc',
          'Terminal offline: Stage 6 Load Shedding has cut power to this sector. Purchase Generator Diesel (R300) in the top bar to restore power.',
          currentLang
        );
        blockedSummary = t('ui.diesel_required', 'DIESEL REQUIRED', currentLang);
      } else if (slot.requiredItem && !state.inventory.includes(slot.requiredItem)) {
        const itemName = getLocalizedItemName(slot.requiredItem, currentLang);
        blockedMath = t('ui.missing_required_item', 'MISSING ITEM', currentLang);
        blockedNarrative = t(
          'ui.blocked_item_desc',
          'This action requires specialized gear or evidence: {item}. Secure it from contacts or district nodes first.',
          currentLang
        ).replace('{item}', itemName);
        blockedSummary = itemName;
      }

      setLastRollFeedback({
        title: locSlot.title,
        rollMath: blockedMath,
        tier: 'blocked',
        narrative: blockedNarrative,
        summary: blockedSummary,
      });
    }

    setState(nextState);
  };

  const executeEndCycle = () => {
    setIsEndCycleModalOpen(false);
    setSelectedDieId(null);
    setLastRollFeedback(null);
    setIsRollingDice(true);
    if (!settings?.reduceScreenFlicker) {
      setIsGridFlashing(true);
    }

    const nextState = advanceToNextDay(state);
    soundscape.playCycleRoll(nextState.loadSheddingStage === 6);

    setTimeout(() => {
      setState(nextState);
      setIsRollingDice(false);
    }, 320);

    setTimeout(() => {
      setIsGridFlashing(false);
    }, 450);
  };

  const handleEndCycle = () => {
    soundscape.playDieSelect();
    setIsEndCycleModalOpen(true);
  };

  // Phase 14: Desktop Keyboard Shortcuts (1-5 = Select Die, Tab = Cycle Nodes, Space = End Cycle, D = Toggle Dice Mode, B = Conspiracy Board, Esc = Close/Deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 1. Escape closes active modals or clears selected die
      if (e.key === 'Escape') {
        if (isEndCycleModalOpen) {
          soundscape.playDieSelect();
          setIsEndCycleModalOpen(false);
          return;
        }
        if (isMissionStatusOpen) {
          soundscape.playDieSelect();
          setIsMissionStatusOpen(false);
          return;
        }
        if (inspectedItemId) {
          soundscape.playDieSelect();
          setInspectedItemId(null);
          return;
        }
        if (isContactDialogueOpen) {
          soundscape.playDieSelect();
          setIsContactDialogueOpen(false);
          return;
        }
        if (isBoardOpen) {
          soundscape.playDieSelect();
          setIsBoardOpen(false);
          return;
        }
        if (isGuideOpen) {
          soundscape.playDieSelect();
          setIsGuideOpen(false);
          return;
        }
        if (selectedDieId) {
          soundscape.playDieSelect();
          setSelectedDieId(null);
          return;
        }
        return;
      }

      // If End Cycle confirmation is open, Space or Enter confirms sleep!
      if (isEndCycleModalOpen) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          executeEndCycle();
        }
        return;
      }

      // Ignore gameplay shortcuts when an ending screen or modal is open
      const hasOpenModal =
        Boolean(state.activeEndingId) ||
        state.triggeredEventsQueue.length > 0 ||
        Boolean(inspectedItemId) ||
        isContactDialogueOpen ||
        isBoardOpen ||
        isGuideOpen ||
        isMissionStatusOpen;
      if (hasOpenModal || isRollingDice) return;

      // 2. Keys 1..5 select/toggle unused Action Die
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        const die = state.dicePool[idx];
        if (die && !die.isUsed) {
          e.preventDefault();
          soundscape.playDieSelect();
          setSelectedDieId((prev) => (prev === die.id ? null : die.id));
        }
        return;
      }

      // 3. Tab cycles through unlocked District Map nodes in the active Act
      if (e.key === 'Tab') {
        e.preventDefault();
        const actNodePrefix = state.act === 2 ? ['n8_', 'n9_', 'n10_', 'n11_', 'n12_'] : ['n1_', 'n2_', 'n3_', 'n4_', 'n5_', 'n6_', 'n7_'];
        const unlockedIds = Object.keys(state.nodes).filter(
          (id) =>
            state.nodes[id]?.isUnlocked &&
            actNodePrefix.some((prefix) => id.startsWith(prefix))
        );
        if (unlockedIds.length > 0) {
          const curIdx = unlockedIds.indexOf(selectedNodeId);
          const nextIdx = e.shiftKey
            ? (curIdx - 1 + unlockedIds.length) % unlockedIds.length
            : (curIdx + 1) % unlockedIds.length;
          handleSelectNode(unlockedIds[nextIdx]);
        }
        return;
      }

      // 4. Space triggers End Cycle / Sleep
      if (e.code === 'Space') {
        e.preventDefault();
        handleEndCycle();
        return;
      }

      // 5. 'd' or 'D' toggles Dice Display Mode (Numbers vs. Dots)
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        soundscape.playDieSelect();
        const nextMode = activeDiceMode === 'numbers' ? 'dots' : 'numbers';
        setFallbackDiceMode(nextMode);
        if (onUpdateSettings) {
          onUpdateSettings({
            ...(settings ?? DEFAULT_GAME_SETTINGS),
            diceDisplayMode: nextMode,
          });
        }
        return;
      }

      // 6. 'b' or 'B' opens the Red-String Conspiracy Board
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        soundscape.playDieSelect();
        setIsBoardOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      className={`h-[100dvh] w-screen overflow-hidden bg-slate-950 text-zinc-100 flex flex-col select-none font-sans transition-opacity duration-200 ${
        isGridFlashing ? 'opacity-65' : 'opacity-100'
      }`}
    >
      {/* 1. RESPONSIVE TOP HUD BAR */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-3 sm:px-6 py-2 lg:py-0 lg:h-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 shrink-0">
        {/* ROW 1 ON MOBILE / LEFT SIDE ON DESKTOP */}
        <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                soundscape.playDieSelect();
                setIsMissionStatusOpen(true);
              }}
              className="text-xs sm:text-sm font-mono uppercase tracking-widest text-amber-400 font-semibold hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
              title={t('ui.mission_status_tooltip', 'Click to view Mission Status, Active Clocks & Field Manual', currentLang)}
            >
              <span>{state.act === 2 ? t('ui.act2_prefix', 'ACT 2 // ', currentLang) : ''}{t('ui.cycle', 'CYCLE', currentLang)} {state.day}</span>
              <span className="hidden sm:inline text-zinc-500">
                //{' '}
                {state.storyId === 'story_4_cape'
                  ? 'CAPE-NOCTURNE'
                  : state.storyId === 'story_3_namaqua'
                  ? 'NAMAQUA-DIAMOND'
                  : state.storyId === 'story_2_highveld'
                  ? 'HIGHVELD-COAL'
                  : t('ui.city_subheading', 'ETHEKWINI-GOLD', currentLang)}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                {t('ui.status', 'STATUS', currentLang)}
              </span>
            </button>

            {/* REAL-TIME ASCENDING ADRENALINE & TENSION METER */}
            <div
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono border flex items-center gap-1.5 ${
                adrenaline.level >= 4
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : adrenaline.level >= 3
                  ? 'bg-orange-950/60 border-orange-500 text-orange-300'
                  : adrenaline.level >= 2
                  ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                  : 'bg-emerald-950/30 border-emerald-700/60 text-emerald-400'
              }`}
              title={`Story Tension & Adrenaline: ${adrenaline.score}% (${adrenaline.levelName})`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  adrenaline.level >= 4
                    ? 'bg-red-400 animate-ping'
                    : adrenaline.level >= 3
                    ? 'bg-orange-400'
                    : adrenaline.level >= 2
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-bold">{adrenaline.levelName}</span>
              <span className="hidden sm:inline opacity-75">{adrenaline.score}%</span>
            </div>

            <div
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono border ${
                state.loadSheddingStage === 6
                  ? `bg-red-950/60 border-red-600 text-red-300 ${
                      settings?.reduceScreenFlicker ? '' : 'animate-pulse'
                    }`
                  : 'bg-amber-950/40 border-amber-700 text-amber-300'
              }`}
            >
              {t('ui.stage', 'STAGE', currentLang)} {state.loadSheddingStage}{' '}
              <span className="hidden sm:inline">{t('ui.load_shedding', 'LOAD SHEDDING', currentLang)}</span>
            </div>
            {state.loadSheddingStage === 6 && !state.generatorActiveToday && (
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setState((prev) => activateGeneratorDiesel(prev));
                }}
                disabled={state.cash < 300}
                className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono border transition-colors ${
                  state.cash >= 300
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-300 hover:bg-cyan-900/60 cursor-pointer'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {t('ui.add_diesel', '+ Diesel (R300)', currentLang)}
              </button>
            )}
            {state.generatorActiveToday && (
              <span className="px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono bg-cyan-950/50 border border-cyan-700 text-cyan-300">
                {t('ui.diesel_on', 'DIESEL ON', currentLang)}
              </span>
            )}
          </div>

          {/* CASH & COMPOSURE (SHOWN ON ROW 1 FOR MOBILE) */}
          <div className="flex lg:hidden items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400 font-semibold">
              R{state.cash.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-14 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${state.composure}%` }}
                />
              </div>
              <span className="text-cyan-300">{state.composure}%</span>
            </div>
          </div>
        </div>

        {/* ROW 2 ON MOBILE / RIGHT SIDE ON DESKTOP */}
        <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-5 text-xs sm:text-sm font-mono">
          {/* CASH & COMPOSURE (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="text-emerald-400">
              {t('ui.cash', 'CASH', currentLang)}: R{state.cash.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">{t('ui.composure', 'COMPOSURE', currentLang)}:</span>
              <div className="w-24 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${state.composure}%` }}
                />
              </div>
              <span>{state.composure}%</span>
            </div>
          </div>

          {/* SPEEDRUN STOPWATCH & 4 INVESTIGATOR STATS */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:border-l lg:border-zinc-800 lg:pl-4 text-[11px] sm:text-xs text-zinc-300">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[10px] sm:text-[11px]"
              title="Speedrun Elapsed Time"
            >
              <span>⏱️</span>
              <span>{formatSpeedrunTime(elapsedSeconds)}</span>
            </div>

            <span>
              {t('stat_abbr.street', 'STRT', currentLang)}:{' '}
              {state.stats.street >= 0
                ? `+${state.stats.street}`
                : state.stats.street}
            </span>
            <span>
              {t('stat_abbr.dockets', 'DCKT', currentLang)}:{' '}
              {state.stats.dockets >= 0
                ? `+${state.stats.dockets}`
                : state.stats.dockets}
            </span>
            <span>
              {t('stat_abbr.wire', 'WIRE', currentLang)}:{' '}
              {state.stats.wire >= 0 ? `+${state.stats.wire}` : state.stats.wire}
            </span>
            <span>
              {t('stat_abbr.influence', 'INFL', currentLang)}:{' '}
              {state.stats.influence >= 0
                ? `+${state.stats.influence}`
                : state.stats.influence}
            </span>
          </div>

          {/* MOBILE QUICK ACTION CONTROLS (<1024px) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundscape.playDieSelect();
                setIsBoardOpen(true);
              }}
              className="px-2 py-1 rounded bg-red-500/15 border border-red-500/50 hover:border-red-400 text-[11px] text-red-300 cursor-pointer flex items-center gap-1 font-mono transition-colors"
              title="Open Conspiracy Board"
            >
              ◈ <span className="hidden xs:inline">{t('ui.board', 'BOARD', currentLang)}</span>
            </button>
            {onManualSave && (
              <button
                type="button"
                onClick={() => {
                  soundscape.playOutcome('clean');
                  onManualSave(state);
                  setSaveFlash(true);
                  setTimeout(() => setSaveFlash(false), 1500);
                }}
                className={`px-2 py-1 rounded border text-[11px] font-mono cursor-pointer transition-colors ${
                  saveFlash
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 hover:border-emerald-500/60 text-zinc-300'
                }`}
                title="Quick Save"
              >
                {saveFlash ? '✓' : '💾'} <span className="hidden xs:inline">{saveFlash ? t('ui.saved', 'SAVED', currentLang) : t('ui.save', 'SAVE', currentLang)}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundscape.playDieSelect();
                setIsMobileOpsOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/60 hover:border-amber-400 text-[11px] text-amber-200 font-mono font-bold cursor-pointer flex items-center gap-1 transition-colors"
              title="Tactical Operations Menu"
            >
              ☰ {t('ui.ops', 'OPS', currentLang)}
            </button>
          </div>

          {/* DESKTOP EXTENDED CONTROLS (>=1024px) */}
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2 lg:border-l lg:border-zinc-800 lg:pl-4">
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsLeaderboardOpen(true);
              }}
              className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/60 hover:border-amber-400 text-[10px] sm:text-[11px] text-amber-200 cursor-pointer flex items-center gap-1 font-mono font-semibold transition-colors"
              title="Open Leaderboard, Speedruns & 25-Ending Completionists"
            >
              🏆 {t('ui.scores', 'SCORES', currentLang)}
            </button>
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsProfileOpen(true);
              }}
              className="px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/50 hover:border-cyan-400 text-[10px] sm:text-[11px] text-cyan-300 cursor-pointer flex items-center gap-1 font-mono transition-colors"
              title="Operative Profile, Google Login & Cloud Vault"
            >
              👤 {userProfile.isGuest ? 'VAULT' : userProfile.displayName.substring(0, 8)}
            </button>
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsMissionStatusOpen(true);
              }}
              className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/60 hover:border-amber-400 text-[10px] sm:text-[11px] text-amber-200 cursor-pointer flex items-center gap-1 font-mono font-semibold transition-colors"
              title="Open Case File, Mission Objectives & Field Manual"
            >
              📋 {t('ui.status', 'STATUS', currentLang)}
            </button>
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsBoardOpen(true);
              }}
              className="px-2 py-1 rounded bg-red-500/15 border border-red-500/50 hover:border-red-400 text-[10px] sm:text-[11px] text-red-300 cursor-pointer"
              title="Open Red-String Conspiracy Mind-Map"
            >
              ◈ {t('ui.board', 'BOARD', currentLang)}
            </button>
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsGuideOpen(true);
              }}
              className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/50 hover:border-amber-400 text-[10px] sm:text-[11px] text-amber-300 cursor-pointer"
            >
              ? {t('ui.guide', 'GUIDE', currentLang)}
            </button>
            {onManualSave && (
              <button
                onClick={() => {
                  soundscape.playOutcome('clean');
                  onManualSave(state);
                  setSaveFlash(true);
                  setTimeout(() => setSaveFlash(false), 1500);
                }}
                className={`px-2 py-1 rounded border text-[10px] sm:text-[11px] cursor-pointer transition-colors ${
                  saveFlash
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 hover:border-emerald-500/60 text-zinc-300'
                }`}
              >
                {saveFlash ? t('ui.saved', 'SAVED ✓', currentLang) : t('ui.save', 'SAVE', currentLang)}
              </button>
            )}
            {onOpenSettings && (
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  onOpenSettings();
                }}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-[10px] sm:text-[11px] text-zinc-300 cursor-pointer"
              >
                ⚙ {t('ui.settings', 'SETTINGS', currentLang)}
              </button>
            )}
            {onReturnToMenu && (
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  onReturnToMenu();
                }}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 text-[10px] sm:text-[11px] text-zinc-400 hover:text-amber-300 cursor-pointer"
              >
                {t('ui.menu', 'MENU', currentLang)}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE TACTICAL TAB SWITCHER (<1024px) */}
      <nav className="lg:hidden grid grid-cols-3 border-b border-zinc-800 bg-zinc-950 font-mono text-xs shrink-0">
        <button
          onClick={() => {
            soundscape.playDieSelect();
            setMobileTab('map');
          }}
          className={`py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'map'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60 font-semibold'
              : 'border-transparent text-zinc-400'
          }`}
        >
          1. {t('ui.tab_map', 'District Map', currentLang)}
        </button>

        <button
          onClick={() => {
            soundscape.playDieSelect();
            setMobileTab('actions');
          }}
          className={`py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'actions'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60 font-semibold'
              : 'border-transparent text-zinc-400'
          }`}
        >
          <span className="truncate max-w-[110px]">
            2. {activeNode ? getLocalizedNode(activeNode.id, activeNode.title, activeNode.subtitle, currentLang).title.split(' (')[0] : t('ui.tab_actions', 'Actions', currentLang)}
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300">
            {activeNode?.actionSlots.length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            soundscape.playDieSelect();
            setMobileTab('clocks');
          }}
          className={`py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'clocks'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60 font-semibold'
              : 'border-transparent text-zinc-400'
          }`}
        >
          <span>3. {t('ui.tab_clocks', 'Clocks & Turf', currentLang)}</span>
          {urgentThreatCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[10px] text-white animate-pulse">
              !
            </span>
          )}
        </button>
      </nav>

      {/* MOBILE LIVE TACTICAL SCANNER / DISPATCH TICKER (<1024px) */}
      <div className="lg:hidden px-3 py-1.5 bg-black/90 border-b border-zinc-800/80 flex items-center justify-between gap-2 font-mono text-[11px] text-zinc-300 overflow-hidden shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-[9px] uppercase tracking-wider text-amber-400/90 font-bold shrink-0">
            DISPATCH:
          </span>
          <span className="truncate text-zinc-300 text-[10px]">
            {state.activeLog[0]
              ? getLocalizedLogEntry(state.activeLog[0], currentLang)
              : t('ui.scanning_metro', 'Scanning police frequencies...', currentLang)}
          </span>
        </div>
        {mobileTab !== 'map' && (
          <button
            type="button"
            onClick={() => {
              soundscape.playDieSelect();
              setMobileTab('map');
            }}
            className="text-[9px] uppercase tracking-wider text-cyan-400 hover:text-cyan-300 shrink-0 underline underline-offset-1 cursor-pointer font-bold"
          >
            Log →
          </button>
        )}
      </div>

      {/* 2. MAIN WORKSPACE (3 COLUMNS ON DESKTOP, TABBED ON MOBILE) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: THREAT CLOCKS, FACTION STANDING, PERKS & INVENTORY */}
        <aside
          className={`${
            mobileTab === 'clocks' ? 'flex w-full' : 'hidden'
          } lg:flex lg:w-80 border-r border-zinc-800 bg-zinc-950/80 p-4 flex-col gap-4 overflow-y-auto shrink-0`}
        >
          <div className="flex flex-col gap-2.5">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              {t('ui.active_clocks', 'Active Clocks', currentLang)}
            </h2>
            {Object.values(state.clocks).map((clock) => (
              <SegmentedClock key={clock.id} clock={clock} lang={currentLang} />
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              {t('ui.faction_standing', 'Faction Standing', currentLang)}
            </h2>
            <div className="space-y-1.5 text-xs font-mono">
              {(Object.keys(FACTION_LABELS) as FactionId[]).map((fid) => {
                const rep = state.factionRep[fid];
                const localizedFaction = getLocalizedFactionName(fid, currentLang);
                return (
                  <div
                    key={fid}
                    className="flex items-center justify-between px-2 py-1.5 rounded bg-zinc-900/70 border border-zinc-800/80"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={FACTION_AVATARS[fid]}
                        alt={localizedFaction}
                        className="w-6 h-6 rounded object-cover border border-zinc-700"
                      />
                      <span className="text-zinc-300">{localizedFaction}</span>
                    </div>
                    <span
                      className={
                        rep > 0
                          ? 'text-emerald-400'
                          : rep < 0
                          ? 'text-red-400'
                          : 'text-zinc-400'
                      }
                    >
                      {rep > 0 ? `+${rep}` : rep}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FACTION TACTICAL PERKS */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              {t('ui.faction_calls', 'Faction Tactical Calls (1/Day)', currentLang)}
            </h2>
            <div className="space-y-1.5">
              {FACTION_PERKS.map((perk) => {
                const unlocked = state.factionRep[perk.factionId] >= perk.minRep;
                const used = state.usedPerksToday.includes(perk.id);
                const canAfford = !perk.costCash || state.cash >= perk.costCash;
                const canActivate = unlocked && !used && canAfford;

                return (
                  <button
                    key={perk.id}
                    disabled={!canActivate}
                    onClick={() => {
                      soundscape.playOutcome('clean');
                      setState((prev) => activateFactionPerk(prev, perk.id));
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border font-mono text-xs transition-all ${
                      canActivate
                        ? 'bg-zinc-900 border-amber-500/60 hover:border-amber-400 text-zinc-100 cursor-pointer'
                        : 'bg-zinc-950/60 border-zinc-900 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t(`perk.${perk.id}.name`, perk.title, currentLang)}</span>
                      <span className="text-[10px] uppercase">
                        {used
                          ? t('ui.used_today', 'USED TODAY', currentLang)
                          : unlocked
                          ? t('ui.ready', 'READY', currentLang)
                          : `${t('ui.req', 'REQ', currentLang)} +${perk.minRep} ${t('dialogue.rep', 'REP', currentLang)}`}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {t(`perk.${perk.id}.desc`, perk.description, currentLang)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                {t('ui.evidence_dossier', 'Evidence & Gear Dossier', currentLang)}
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">
                {t('ui.tap_to_inspect', 'Tap to inspect', currentLang)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.inventory.map((item) => {
                const catalogEntry = ITEMS_CATALOG[item];
                const isGear = catalogEntry?.category === 'gear';
                return (
                  <button
                    key={item}
                    onClick={() => {
                      soundscape.playDieSelect();
                      setInspectedItemId(item);
                    }}
                    className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isGear
                        ? 'bg-cyan-950/35 border-cyan-700/50 hover:border-cyan-400 text-cyan-300'
                        : 'bg-amber-950/35 border-amber-700/50 hover:border-amber-400 text-amber-300'
                    }`}
                  >
                    <span>{getLocalizedItemName(item, currentLang)}</span>
                    <span className="text-[9px] opacity-75 uppercase">{t('ui.read_bracket', '[Read]', currentLang)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: OBJECTIVE TRACKER, INTERACTIVE SVG DISTRICT MAP & NARRATIVE LOG */}
        <main
          className={`${
            mobileTab === 'map' ? 'flex w-full' : 'hidden'
          } lg:flex flex-1 flex-col gap-2.5 sm:gap-3 p-2.5 sm:p-4 bg-slate-950 overflow-hidden`}
        >
          <ObjectiveTracker
            state={state}
            selectedDieId={selectedDieId}
            lang={currentLang}
            onOpenGuide={() => {
              soundscape.playDieSelect();
              setIsGuideOpen(true);
            }}
            onFollowRecommendation={(rec) => {
              if (rec.targetNodeId) {
                handleSelectNode(rec.targetNodeId);
              }
              if (rec.recommendedDieId && !selectedDieId) {
                setSelectedDieId(rec.recommendedDieId);
              }
              setMobileTab('actions');
            }}
          />

          <DistrictSvgMap
            state={state}
            selectedNodeId={selectedNodeId}
            lang={currentLang}
            onSelectNode={handleSelectNode}
          />

          {/* MOBILE ONE-THUMB NODE ACTION DRAWER CTA */}
          {activeNode && (
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setMobileTab('actions');
              }}
              className="lg:hidden w-full py-2.5 px-4 rounded-xl bg-amber-500/15 border border-amber-400/70 text-amber-300 font-mono text-xs flex items-center justify-between shrink-0 cursor-pointer"
            >
              <span>
                {t('ui.inspect', 'Inspect', currentLang)}{' '}
                <strong className="text-white">
                  {getLocalizedNode(activeNode.id, activeNode.title, activeNode.subtitle, currentLang).title}
                </strong>
              </span>
              <span>
                {activeNode.actionSlots.length} {t('ui.action_slots_arrow', 'Action Slot(s) →', currentLang)}
              </span>
            </button>
          )}

          {/* Live Police Scanner / Narrative Feed */}
          <div className="h-24 sm:h-32 bg-zinc-950/90 border border-zinc-800 rounded-lg p-2.5 sm:p-3 overflow-y-auto font-mono text-xs space-y-1.5 shrink-0">
            <div className="text-[10px] uppercase text-zinc-500">
              {t('ui.metro_dispatch_log', 'Metro Dispatch & Comms Log', currentLang)}
            </div>
            {state.activeLog.map((entry, idx) => (
              <p
                key={idx}
                className={idx === 0 ? 'text-amber-300' : 'text-zinc-500'}
              >
                &gt; {getLocalizedLogEntry(entry, currentLang)}
              </p>
            ))}
          </div>
        </main>

        {/* RIGHT DRAWER: SELECTED NODE ARTWORK, NPC CONTACT, ACTION SLOTS & BLACK-MARKET SHOP */}
        {activeNode && (
          <aside
            className={`${
              mobileTab === 'actions' ? 'flex w-full' : 'hidden'
            } lg:flex lg:w-96 border-l border-zinc-800 bg-zinc-950 flex-col overflow-y-auto shrink-0`}
          >
            {/* GENERATED LOCATION HEADER BANNER */}
            <div className="relative h-36 sm:h-40 w-full shrink-0 overflow-hidden border-b border-zinc-800">
              <img
                src={`/assets/nodes/${activeNode.id}.jpg`}
                alt={activeNode.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
              <div className="absolute top-3 left-4 lg:hidden">
                <button
                  onClick={() => {
                    soundscape.playDieSelect();
                    setMobileTab('map');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-700 text-[11px] font-mono text-zinc-200"
                >
                  &larr; {t('ui.back_to_map', 'Back to Map', currentLang)}
                </button>
              </div>
              <div className="absolute bottom-3 left-4 right-4 sm:left-5 sm:right-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-amber-400">
                    {getLocalizedNode(activeNode.id, activeNode.title, activeNode.subtitle, currentLang).district}
                  </span>
                  {state.currentNodeId === activeNode.id && (
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-mono font-semibold uppercase">
                      {t('ui.current_location', 'Current Location', currentLang)}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-medium text-white mt-0.5">
                  {getLocalizedNode(activeNode.id, activeNode.title, activeNode.subtitle, currentLang).title}
                </h2>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-4">
              {/* KEY NPC CONTACT PORTRAIT CARD (PHASE 9 & PHASE 12 DIALOGUE) */}
              {nodeContact && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={nodeContact.avatar}
                      alt={nodeContact.name}
                      className="w-11 h-11 rounded-lg object-cover border border-amber-500/40 shrink-0"
                    />
                    <div className="font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-100">
                          {getLocalizedContactName(activeNode.id, nodeContact.name, currentLang)}
                        </span>
                        {activeNode.factionOwner !== 'neutral' && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              state.factionRep[activeNode.factionOwner] > 0
                                ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                                : state.factionRep[activeNode.factionOwner] <= -2
                                ? 'bg-red-950/60 border-red-600 text-red-300'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {t('dialogue.rep', 'Rep', currentLang)}:{' '}
                            {state.factionRep[activeNode.factionOwner] > 0
                              ? `+${state.factionRep[activeNode.factionOwner]}`
                              : state.factionRep[activeNode.factionOwner]}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {getLocalizedContactRole(activeNode.id, nodeContact.role, currentLang)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundscape.playDieSelect();
                      setIsContactDialogueOpen(true);
                    }}
                    className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    <span>{t('ui.speak_with_contact', 'Speak with Contact', currentLang)}</span>
                    {hasAvailableUnclaimedDialogueReward(
                      state,
                      activeNode.id
                    ) && (
                      <span
                        className="px-1.5 py-0.2 rounded bg-amber-400 text-zinc-950 font-bold text-[9px] animate-pulse"
                        title={t('dialogue.new_lead_title', 'New stat check or evidence lead available!', currentLang)}
                      >
                        {t('ui.intel_badge', 'INTEL', currentLang)}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* HOSTILE TURF RETALIATION WARNING BANNER (PHASE 8) */}
              {turfPenalty < 0 && (
                <div className="p-3 rounded-xl border border-red-600/80 bg-red-950/30 font-mono text-xs text-red-300 flex items-center justify-between">
                  <span>{t('ui.hostile_turf', '! HOSTILE FACTION TURF (Rep ≤ -2)', currentLang)}</span>
                  <span className="font-bold text-red-400">{t('ui.roll_penalty', '-1 Roll Penalty', currentLang)}</span>
                </div>
              )}

              {/* SAPS ROADBLOCK INTERCEPT PROMPT IF CORRIDOR IS BLOCKED */}
              {isBlockedByRoadblock && (
                <div className="p-4 rounded-xl border-2 border-red-600/80 bg-red-950/30 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-red-300">
                    ! SAPS Operation Shanela Roadblock
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Armed TRT and Metro Police cordons block the route from{' '}
                    <span className="text-white font-medium">
                      {state.nodes[state.currentNodeId]?.title}
                    </span>{' '}
                    to{' '}
                    <span className="text-white font-medium">
                      {activeNode.title}
                    </span>
                    . Pay a cordon bribe or burn an unused Action Die to detour
                    through back alleys.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={state.cash < 200}
                      onClick={() => {
                        soundscape.playDieSelect();
                        setState((prev) =>
                          travelToNode(prev, activeNode.id, 'bribe')
                        );
                      }}
                      className={`px-3 py-2 rounded-lg border font-mono text-xs transition-colors ${
                        state.cash >= 200
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30 cursor-pointer'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Bribe Cordon (R200)
                    </button>
                    <button
                      disabled={!state.dicePool.some((d) => !d.isUsed)}
                      onClick={() => {
                        soundscape.playDieSelect();
                        setState((prev) =>
                          travelToNode(
                            prev,
                            activeNode.id,
                            'die',
                            selectedDieId || undefined
                          )
                        );
                      }}
                      className={`px-3 py-2 rounded-lg border font-mono text-xs transition-colors ${
                        state.dicePool.some((d) => !d.isUsed)
                          ? 'bg-red-500/20 border-red-500 text-red-200 hover:bg-red-500/30 cursor-pointer'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Alley Detour (-1 Die)
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {activeNode.actionSlots.map((slot) => {
                  const locSlot = getLocalizedSlot(slot, currentLang);
                  const statMod = slot.stat === 'any' ? 0 : state.stats[slot.stat];
                  const blackoutMod =
                    state.loadSheddingStage === 6
                      ? (slot.stage6BonusModifier ?? 0)
                      : 0;
                  const totalMod = statMod + blackoutMod + turfPenalty;
                  const previewRoll = selectedDie
                    ? selectedDie.value + totalMod
                    : null;
                  const missingItem =
                    slot.requiredItem &&
                    !state.inventory.includes(slot.requiredItem);
                  const stage6Locked =
                    state.loadSheddingStage === 6 &&
                    slot.disabledDuringStage6 &&
                    !state.generatorActiveToday;
                  const cannotAffordCash = Boolean(
                    slot.costCash && state.cash < slot.costCash
                  );

                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleAssignDie(slot.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const droppedDieId = e.dataTransfer.getData('text/plain');
                        handleAssignDie(slot.id, droppedDieId);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${getPreviewStyle(
                        slot,
                        selectedDie
                      )}`}
                    >
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {t('ui.stat', 'Stat', currentLang)}: {getLocalizedStatName(slot.stat, currentLang)} (
                          {statMod >= 0 ? `+${statMod}` : statMod})
                        </span>
                        <div className="flex items-center gap-2">
                          {currentRecommendation.targetSlotId === slot.id &&
                            !slot.isCompleted && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold animate-pulse">
                                ★ {t('ui.recommended', 'Recommended', currentLang)}
                              </span>
                            )}
                          {slot.isCompleted && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">
                              {t('ui.completed', 'Completed', currentLang)}
                            </span>
                          )}
                          {slot.costCash && (
                            <span
                              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                                cannotAffordCash
                                  ? 'bg-red-950/80 text-red-400 border-red-700/80'
                                  : 'text-emerald-400 bg-emerald-950/40 border-emerald-700/40'
                              }`}
                            >
                              {t('ui.cost', 'Cost', currentLang)}: R{slot.costCash.toLocaleString()}
                              {cannotAffordCash && (
                                <span className="ml-1 text-[10px] text-red-300 font-normal">
                                  ({t('ui.short', 'Short', currentLang)} R{(slot.costCash - state.cash).toLocaleString()})
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-zinc-100 mt-2">
                        {locSlot.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {locSlot.description}
                      </p>

                      {/* IN-SLOT RECENT RESOLUTION BADGE (IN-PLACE FEEDBACK WITHOUT TOP LAYOUT SHIFT) */}
                      {lastResolvedSlotId === slot.id && lastRollFeedback && (
                        <div
                          className={`mt-2.5 p-2 rounded-lg font-mono text-[10px] flex items-center justify-between border animate-in zoom-in-95 duration-200 ${
                            lastRollFeedback.tier === 'clean'
                              ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300'
                              : lastRollFeedback.tier === 'compromised'
                              ? 'bg-amber-950/70 border-amber-500/80 text-amber-300'
                              : lastRollFeedback.tier === 'blocked'
                              ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                              : 'bg-red-950/70 border-red-500/80 text-red-300'
                          }`}
                        >
                          <span className="font-bold">
                            {lastRollFeedback.tier === 'clean'
                              ? `✓ ${t('ui.clean_success', 'CLEAN SUCCESS', currentLang)}`
                              : lastRollFeedback.tier === 'compromised'
                              ? `⚡ ${t('ui.compromised', 'COMPROMISED', currentLang)}`
                              : lastRollFeedback.tier === 'blocked'
                              ? `⚠️ ${t('ui.action_blocked', 'ACTION BLOCKED', currentLang)}`
                              : `✕ ${t('ui.blowback', 'BLOWBACK / FAILURE', currentLang)}`}
                          </span>
                          <span className="text-zinc-400 font-normal">
                            [{lastRollFeedback.rollMath}]
                          </span>
                        </div>
                      )}

                      {missingItem && (
                        <div className="mt-2 text-[11px] font-mono text-red-400">
                          {t('ui.requires', 'Requires', currentLang)}:{' '}
                          {getLocalizedItemName(slot.requiredItem!, currentLang)}
                        </div>
                      )}

                      {stage6Locked && (
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-red-400">
                            {t('ui.stage6_offline', 'Offline during Stage 6 Blackout', currentLang)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundscape.playDieSelect();
                              setState((prev) => activateGeneratorDiesel(prev));
                            }}
                            disabled={state.cash < 300}
                            className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-[10px] font-mono text-cyan-300 hover:bg-cyan-900 cursor-pointer"
                          >
                            {t('ui.buy_diesel', 'Buy Diesel (R300)', currentLang)}
                          </button>
                        </div>
                      )}

                      {state.loadSheddingStage === 6 &&
                        slot.disabledDuringStage6 &&
                        state.generatorActiveToday && (
                          <div className="mt-2 text-[11px] font-mono text-cyan-400">
                            {t('ui.diesel_powered', 'Powered by Backup Diesel Generator', currentLang)}
                          </div>
                        )}

                      {state.loadSheddingStage === 6 &&
                        (slot.stage6BonusModifier ?? 0) > 0 && (
                          <div className="mt-2 text-[11px] font-mono text-emerald-400">
                            {t('ui.stage6_blackout_cover', 'Stage 6 Blackout Cover', currentLang)}: +{slot.stage6BonusModifier}{' '}
                            {t('ui.roll_bonus', 'Roll Bonus', currentLang)}
                          </div>
                        )}

                      {/* 3-TIER OUTCOME CONSEQUENCE MATRIX (HIGHLIGHTS ACTIVE DIE TIER) */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 font-mono text-[10px]">
                        <div
                          className={`flex items-center justify-between px-2 py-1 rounded ${
                            previewRoll !== null && previewRoll >= 6
                              ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-200 font-semibold'
                              : 'bg-zinc-950/60 text-zinc-400'
                          }`}
                        >
                          <span className="text-emerald-400 shrink-0 mr-2">
                            6+ {t('ui.clean', 'Clean', currentLang)}:
                          </span>
                          <span className="text-right truncate">
                            {formatLocalizedOutcomeSummary(slot.outcomes.clean, currentLang)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between px-2 py-1 rounded ${
                            previewRoll !== null &&
                            previewRoll >= 4 &&
                            previewRoll < 6
                              ? 'bg-amber-500/20 border border-amber-500/60 text-amber-200 font-semibold'
                              : 'bg-zinc-950/60 text-zinc-400'
                          }`}
                        >
                          <span className="text-amber-400 shrink-0 mr-2">
                            4–5 {t('ui.risky', 'Risky', currentLang)}:
                          </span>
                          <span className="text-right truncate">
                            {formatLocalizedOutcomeSummary(slot.outcomes.compromised, currentLang)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between px-2 py-1 rounded ${
                            previewRoll !== null && previewRoll <= 3
                              ? 'bg-red-500/20 border border-red-500/60 text-red-200 font-semibold'
                              : 'bg-zinc-950/60 text-zinc-400'
                          }`}
                        >
                          <span className="text-red-400 shrink-0 mr-2">
                            1–3 {t('ui.fail', 'Fail', currentLang)}:
                          </span>
                          <span className="text-right truncate">
                            {formatLocalizedOutcomeSummary(slot.outcomes.failure, currentLang)}
                          </span>
                        </div>
                      </div>

                      {/* Live Roll Preview & Direct Commit Button */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-2">
                        {slot.isCompleted ? (
                          <span className="text-xs font-mono text-zinc-500">
                            {t('ui.action_completed', 'Action already completed', currentLang)}
                          </span>
                        ) : isBlockedByRoadblock ? (
                          <span className="text-xs font-mono text-red-400">
                            {t('ui.cross_roadblock', 'Cross SAPS Roadblock above to access node', currentLang)}
                          </span>
                        ) : stage6Locked ? (
                          <span className="text-xs font-mono text-red-400">
                            {t('ui.terminal_offline', 'Terminal offline during Stage 6 Blackout (Diesel required)', currentLang)}
                          </span>
                        ) : missingItem ? (
                          <span className="text-xs font-mono text-red-400">
                            {t('ui.requires', 'Requires', currentLang)}: {getLocalizedItemName(slot.requiredItem!, currentLang)}
                          </span>
                        ) : cannotAffordCash ? (
                          <div className="space-y-1.5 p-2.5 rounded-xl bg-red-950/40 border border-red-600/70 font-mono text-xs">
                            <div className="flex items-center justify-between text-red-300 font-bold">
                              <span>⚠️ {t('ui.insufficient_funds', 'INSUFFICIENT FUNDS', currentLang)}</span>
                              <span className="text-[11px] text-red-400">
                                {t('ui.short', 'Short', currentLang)} R{(slot.costCash! - state.cash).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                              {t('ui.need_cash_for_action', 'Requires R{cost} to bribe or finance this action. War-chest: R{have}.', currentLang)
                                .replace('{cost}', slot.costCash!.toLocaleString())
                                .replace('{have}', state.cash.toLocaleString())}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignDie(slot.id);
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-red-900/50 hover:bg-red-900/70 border border-red-500/80 text-red-200 font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>⚠️ {t('ui.attempt_action', 'Attempt Action', currentLang)}</span>
                              <span className="text-[10px] text-red-300 underline">[R{slot.costCash} Required]</span>
                            </button>
                          </div>
                        ) : selectedDie ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-300">
                                Die ({selectedDie.value}) + Mod ({totalMod >= 0 ? `+${totalMod}` : totalMod}) ={' '}
                                <span className="text-white font-bold underline">
                                  {previewRoll}
                                </span>
                              </span>
                              <span className="font-semibold uppercase text-[11px]">
                                {previewRoll! >= 6 ? (
                                  <span className="text-emerald-400">{t('ui.clean_success', 'Clean Success (6+)', currentLang)}</span>
                                ) : previewRoll! >= 4 ? (
                                  <span className="text-amber-400">{t('ui.risky_outcome', 'Risky Outcome (4–5)', currentLang)}</span>
                                ) : (
                                  <span className="text-red-400">{t('ui.blowback_fail', 'Blowback / Fail (1–3)', currentLang)}</span>
                                )}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignDie(slot.id);
                              }}
                              className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-lg transition-transform active:scale-[0.98] cursor-pointer ${
                                previewRoll! >= 6
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                                  : previewRoll! >= 4
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                                  : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <span>▶ {t('ui.roll_die', 'Roll Die', currentLang)} #{state.dicePool.findIndex((d) => d.id === selectedDie.id) + 1} ({t('ui.face', 'Face', currentLang)}: {selectedDie.value})</span>
                              </span>
                              <span className="shrink-0 font-extrabold ml-2">
                                {t('ui.execute_action', 'Execute Action', currentLang)} &rarr;
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                            <span>{t('ui.select_die_prompt', 'Select a die in bottom dock to preview & roll', currentLang)}</span>
                            <span className="text-[10px] text-zinc-600">[{t('ui.drag_or_tap', 'Drag or Tap', currentLang)}]</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BLACK-MARKET GEAR & UPGRADES SHOP (PHASE 9) */}
              {nodeShopItems.length > 0 && (
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                      {t('ui.gear_shop', 'Black-Market Gear & Upgrades', currentLang)}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {t('ui.no_die_req', 'No Die Required', currentLang)}
                    </span>
                  </div>
                  {nodeShopItems.map((gear) => {
                    const locGear = getLocalizedCatalogItem(gear, currentLang);
                    const owned = state.inventory.includes(gear.id);
                    const canAfford =
                      !owned &&
                      !isBlockedByRoadblock &&
                      state.cash >= (gear.priceCash ?? 0);

                    return (
                      <div
                        key={gear.id}
                        className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">
                            {locGear.title}
                          </span>
                          <button
                            onClick={() => {
                              soundscape.playDieSelect();
                              setInspectedItemId(gear.id);
                            }}
                            className="text-[10px] font-mono text-cyan-400 hover:underline uppercase cursor-pointer"
                          >
                            {t('ui.specs', '[Specs]', currentLang)}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {locGear.summary}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono text-emerald-400">
                            {locGear.gameplayEffect}
                          </span>
                          <button
                            disabled={owned || !canAfford}
                            onClick={() => {
                              soundscape.playOutcome('clean');
                              setState((prev) =>
                                purchaseBlackMarketGear(prev, gear.id)
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                              owned
                                ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-400 cursor-default'
                                : canAfford
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold cursor-pointer'
                                : 'bg-zinc-950 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            {owned ? t('ui.equipped', 'EQUIPPED', currentLang) : `${t('ui.buy', 'Buy', currentLang)} R${gear.priceCash}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 3. PERSISTENT ONE-THUMB BOTTOM DICE DOCK & END TURN */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-3 sm:px-8 py-2.5 lg:py-0 lg:h-20 flex flex-wrap items-center justify-between gap-2 shrink-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 mr-0.5 sm:mr-1">
            <div className="hidden sm:flex flex-col text-left mr-1">
              <span className="text-[11px] font-mono uppercase text-zinc-300 font-semibold">
                {t('ui.action_dice', 'Action Dice', currentLang)}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                {unusedDiceCount} {t('ui.available', 'Available', currentLang)} • {usedDiceCount} {t('ui.spent', 'Spent', currentLang)}
              </span>
            </div>
            <button
              type="button"
              title={
                activeDiceMode === 'numbers'
                  ? 'Switch dice display to Dots (Pips)'
                  : 'Switch dice display to Numbers (1–6)'
              }
              onClick={() => {
                soundscape.playDieSelect();
                const nextMode =
                  activeDiceMode === 'numbers' ? 'dots' : 'numbers';
                setFallbackDiceMode(nextMode);
                if (onUpdateSettings) {
                  onUpdateSettings({
                    ...(settings ?? DEFAULT_GAME_SETTINGS),
                    diceDisplayMode: nextMode,
                  });
                }
              }}
              className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/60 text-[10px] font-mono text-zinc-300 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span
                className={
                  activeDiceMode === 'numbers'
                    ? 'text-amber-400 font-semibold'
                    : 'text-zinc-500'
                }
              >
                123
              </span>
              <span className="text-zinc-600">/</span>
              <span
                className={
                  activeDiceMode === 'dots'
                    ? 'text-amber-400 font-semibold'
                    : 'text-zinc-500'
                }
              >
                ⚄
              </span>
            </button>
          </div>
          {state.dicePool.map((die, idx) => {
            const isSelected = die.id === selectedDieId;
            return (
              <button
                key={die.id}
                disabled={die.isUsed || isRollingDice}
                draggable={!die.isUsed && !isRollingDice}
                title={`Die #${idx + 1} (Value: ${die.value}) ${
                  die.isUsed
                    ? '— [SPENT]'
                    : '— Press [' + (idx + 1) + '] to select'
                }`}
                onDragStart={(e) => {
                  soundscape.playDieSelect();
                  setSelectedDieId(die.id);
                  e.dataTransfer.setData('text/plain', die.id);
                }}
                onClick={() => {
                  soundscape.playDieSelect();
                  const nextDieId = isSelected ? null : die.id;
                  setSelectedDieId(nextDieId);
                  // On mobile, selecting a die automatically opens the Node Actions tab so you can tap a slot immediately
                  if (nextDieId && mobileTab === 'map') {
                    setMobileTab('actions');
                  }
                }}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-mono text-base sm:text-lg flex items-center justify-center border-2 transition-all duration-200 ${
                  isRollingDice
                    ? 'animate-spin border-amber-400 bg-amber-950/60 text-amber-300'
                    : die.isUsed
                    ? 'border-zinc-800 bg-zinc-950/80 text-zinc-600 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-white bg-amber-400 text-slate-950 -translate-y-1.5 shadow-[0_0_20px_rgba(251,191,36,0.55)] cursor-pointer'
                    : 'border-amber-400/75 bg-slate-800/95 text-amber-200 hover:bg-slate-700 hover:border-amber-300 shadow-[0_2px_10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-grab'
                }`}
              >
                <span
                  className={`hidden lg:inline-block absolute -top-1.5 -left-1.5 px-1 py-0 rounded text-[9px] font-mono leading-tight border ${
                    isSelected
                      ? 'bg-slate-950 border-amber-300 text-amber-300'
                      : die.isUsed
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-700'
                      : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                  }`}
                >
                  {idx + 1}
                </span>
                {die.isUsed && (
                  <span className="absolute -bottom-1.5 px-1 py-0 rounded text-[8px] font-mono font-bold bg-zinc-950 border border-zinc-700 text-zinc-400 uppercase tracking-tighter">
                    {t('ui.spent_badge', 'SPENT', currentLang)}
                  </span>
                )}
                <DiceFaceContent
                  value={die.value}
                  mode={activeDiceMode}
                  isUsed={die.isUsed}
                  isSelected={isSelected}
                  isRolling={isRollingDice}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <span className="hidden xl:inline text-[10px] font-mono text-zinc-500">
            Hotkeys: [1–5] Dice • [Tab] Node • [D] Pips • [B] Board • [Space] Sleep
          </span>
          {hasFinaleLeverage && (
            <button
              onClick={() => {
                soundscape.playOutcome('clean');
                setSelectedDieId(null);
                const climaxEventId =
                  state.act === 2
                    ? 'evt_act2_climax_tarmac'
                    : 'evt_climax_berth14';
                setState((prev) => ({
                  ...prev,
                  triggeredEventsQueue: [
                    climaxEventId,
                    ...prev.triggeredEventsQueue,
                  ],
                }));
              }}
              className="px-3 sm:px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-colors cursor-pointer"
            >
              {state.act === 2
                ? t('ui.finale_hangar', 'Hangar 7 Finale', currentLang)
                : t('ui.finale_berth14', 'Berth 14 Finale', currentLang)}{' '}
              &rarr;
            </button>
          )}

          <button
            onClick={handleEndCycle}
            disabled={isRollingDice}
            title="End Cycle / Sleep (Shortcut: Space)"
            className={`px-3 sm:px-5 py-2.5 rounded-lg font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              unusedDiceCount > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            <span>{t('ui.end_cycle', 'End Cycle', currentLang)} &rarr;</span>
            <span className="text-[10px] opacity-80 font-normal hidden md:inline">
              ({unusedDiceCount > 0 ? `${unusedDiceCount} ${t('ui.left', 'left', currentLang)}` : t('ui.all_spent', 'All spent', currentLang)})
            </span>
          </button>
        </div>
      </footer>

      {/* 4. TRIGGERED NARRATIVE EVENT MODAL */}
      <EventModal
        state={state}
        lang={currentLang}
        onResolve={(nextState) => setState(nextState)}
      />

      {/* 5. INTERACTIVE EVIDENCE & GEAR DOSSIER MODAL */}
      <EvidenceDossierModal
        itemId={inspectedItemId}
        lang={currentLang}
        onClose={() => setInspectedItemId(null)}
      />

      {/* 5B. INTERACTIVE NPC CONTACT DIALOGUE & INTERROGATION MODAL (PHASE 12) */}
      {isContactDialogueOpen && activeNode && (
        <ContactDialogueModal
          nodeId={activeNode.id}
          nodeTitle={activeNode.title}
          state={state}
          lang={currentLang}
          onUpdateState={(nextState) => setState(nextState)}
          onClose={() => setIsContactDialogueOpen(false)}
        />
      )}

      {/* 5C. RED-STRING CONSPIRACY BOARD MODAL (PHASE 13) */}
      <ConspiracyBoardModal
        isOpen={isBoardOpen}
        state={state}
        lang={currentLang}
        onClose={() => setIsBoardOpen(false)}
        onInspectEvidenceItem={(itemId) => {
          setIsBoardOpen(false);
          setInspectedItemId(itemId);
        }}
      />

      {/* 6. INTERACTIVE 4-STEP TUTORIAL & FIELD GUIDE */}
      <TutorialOverlay
        isOpen={isGuideOpen}
        lang={currentLang}
        onClose={() => {
          setIsGuideOpen(false);
          try {
            window.localStorage.setItem(GUIDE_SEEN_KEY, 'true');
          } catch {
            // Ignore
          }
        }}
      />

      {/* 7. ACT 1 / ACT 2 FINALE EPILOGUE SCREEN */}
      {state.activeEndingId && (
        <EndingScreen
          state={state}
          endingId={state.activeEndingId}
          lang={currentLang}
          onContinueToAct2={(act1Ending) => {
            soundscape.playOutcome('clean');
            const act2State = transitionToAct2(state, act1Ending);
            setState(act2State);
            setSelectedNodeId('n10_high_court');
            setSelectedDieId(null);
            setLastRollFeedback(null);
          }}
          onStartNewGamePlus={() => {
            soundscape.playOutcome('clean');
            const preservedGear = state.inventory.filter(
              (id) =>
                ITEMS_CATALOG[id]?.category === 'gear' ||
                id === 'saps_radio_scanner'
            );
            const ngPlusState: GameState = {
              ...structuredClone(initialGameState),
              cash: initialGameState.cash + 1000,
              stats: structuredClone(state.stats),
              inventory: Array.from(
                new Set([...initialGameState.inventory, ...preservedGear])
              ),
              activeLog: [
                '--- NEW GAME+ TIMELINE // Carried over Black-Market Hardware, Veteran Stats & +R1,000 War-Chest ---',
                ...initialGameState.activeLog,
              ],
            };
            setState(ngPlusState);
            setSelectedNodeId('n1_safehouse');
            setSelectedDieId(null);
            setLastRollFeedback(null);
          }}
          onRestart={() => {
            if (onRestart) {
              onRestart();
            } else {
              setState(initialData);
            }
          }}
        />
      )}

      {/* 8. END CYCLE / NIGHTFALL CONFIRMATION MODAL */}
      <EndCycleModal
        isOpen={isEndCycleModalOpen}
        state={state}
        lang={currentLang}
        onConfirm={executeEndCycle}
        onCancel={() => setIsEndCycleModalOpen(false)}
      />

      {/* 9. MISSION STATUS & FIELD MANUAL MODAL */}
      <MissionStatusModal
        isOpen={isMissionStatusOpen}
        state={state}
        lang={currentLang}
        onClose={() => setIsMissionStatusOpen(false)}
        onInspectItem={(itemId) => {
          setIsMissionStatusOpen(false);
          setInspectedItemId(itemId);
        }}
        onSelectNode={(nodeId) => {
          setIsMissionStatusOpen(false);
          handleSelectNode(nodeId);
          if (mobileTab === 'map') {
            setMobileTab('actions');
          }
        }}
      />

      {/* 10. SCREEN EDGE ADRENALINE TENSION VIGNETTE */}
      <AdrenalineVignette adrenaline={adrenaline} />

      {/* 11. IMMERSIVE FLOATING ACTION OUTCOME DISPATCH */}
      <ActionOutcomeDispatch
        feedback={lastRollFeedback}
        adrenaline={adrenaline}
        lang={currentLang}
        onDismiss={() => setLastRollFeedback(null)}
      />

      {/* 12. CINEMATIC STORY CLIMAX CUTSCENE MODAL */}
      {activeCutsceneId && STORY_CUTSCENES[activeCutsceneId] && (
        <CutsceneModal
          cutscene={STORY_CUTSCENES[activeCutsceneId]}
          lang={currentLang}
          onComplete={() => {
            const finishedCutscene = activeCutsceneId;
            setSeenCutsceneIds((prev) => new Set([...prev, finishedCutscene]));
            setActiveCutsceneId(null);
          }}
        />
      )}

      {/* 13. HIGH SCORES & SPEEDRUN LEADERBOARD MODAL */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onOpenProfile={() => {
          setIsLeaderboardOpen(false);
          setIsProfileOpen(true);
        }}
        userProfile={userProfile}
        lang={currentLang}
      />

      {/* 14. OPERATIVE PROFILE & CLOUD VAULT MODAL */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={(p) => setUserProfile(p)}
        lang={currentLang}
      />

      {/* 15. MOBILE TACTICAL OPERATIONS SHEET (<1024px) */}
      {isMobileOpsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tactical Operations Menu"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 select-none animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileOpsOpen(false);
          }}
        >
          <div className="w-full sm:max-w-md bg-zinc-950 border-t sm:border border-amber-500/40 sm:rounded-2xl shadow-2xl p-4 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-3 font-mono">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm tracking-wider uppercase">
                  ⚡ {t('ui.tactical_ops', 'Tactical Operations', currentLang)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono">
                  {state.storyId === 'story_4_cape'
                    ? 'CAPE-NOCTURNE'
                    : state.storyId === 'story_3_namaqua'
                    ? 'NAMAQUA-DIAMOND'
                    : state.storyId === 'story_2_highveld'
                    ? 'HIGHVELD-COAL'
                    : 'ETHEKWINI'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick Summary Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase">{t('ui.operative', 'Operative', currentLang)}</span>
                <span className="text-zinc-200 font-semibold truncate">
                  {userProfile.isGuest ? 'Guest Operative' : userProfile.displayName}
                </span>
              </div>
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase">{t('ui.time_elapsed', 'Elapsed', currentLang)}</span>
                <span className="text-cyan-400 font-semibold">
                  ⏱️ {formatSpeedrunTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Tactical Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-[60vh] overflow-y-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  soundscape.playDieSelect();
                  setIsMobileOpsOpen(false);
                  setIsMissionStatusOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left text-amber-200 text-xs transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0">📋</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">{t('ui.status', 'MISSION STATUS', currentLang)}</span>
                  <span className="text-[10px] text-zinc-400 truncate">Objectives, clocks & manual</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundscape.playDieSelect();
                  setIsMobileOpsOpen(false);
                  setIsBoardOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-left text-red-200 text-xs transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0">◈</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">{t('ui.board', 'CONSPIRACY BOARD', currentLang)}</span>
                  <span className="text-[10px] text-zinc-400 truncate">Syndicate web & evidence links</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundscape.playDieSelect();
                  setIsMobileOpsOpen(false);
                  setIsLeaderboardOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left text-amber-200 text-xs transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0">🏆</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">{t('ui.scores', 'LEADERBOARDS', currentLang)}</span>
                  <span className="text-[10px] text-zinc-400 truncate">Records & 25-ending runs</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundscape.playDieSelect();
                  setIsMobileOpsOpen(false);
                  setIsProfileOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 text-left text-cyan-300 text-xs transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0">👤</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">OPERATIVE VAULT</span>
                  <span className="text-[10px] text-zinc-400 truncate">Google sync & callsign handle</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundscape.playDieSelect();
                  setIsMobileOpsOpen(false);
                  setIsGuideOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0">📖</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">{t('ui.guide', 'FIELD GUIDE', currentLang)}</span>
                  <span className="text-[10px] text-zinc-400 truncate">Rules & dice mechanics</span>
                </div>
              </button>

              {onManualSave && (
                <button
                  type="button"
                  onClick={() => {
                    soundscape.playOutcome('clean');
                    onManualSave(state);
                    setSaveFlash(true);
                    setTimeout(() => setSaveFlash(false), 1500);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                    saveFlash
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="text-base shrink-0">{saveFlash ? '✓' : '💾'}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold">{saveFlash ? 'CHECKPOINT SAVED' : t('ui.save', 'SAVE CHECKPOINT', currentLang)}</span>
                    <span className="text-[10px] text-zinc-400 truncate">Sync state to local & cloud</span>
                  </div>
                </button>
              )}

              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    soundscape.playDieSelect();
                    setIsMobileOpsOpen(false);
                    onOpenSettings();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left text-zinc-300 text-xs transition-colors cursor-pointer"
                >
                  <span className="text-base shrink-0">⚙️</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold">{t('ui.settings', 'SETTINGS', currentLang)}</span>
                    <span className="text-[10px] text-zinc-400 truncate">Audio, graphics & language</span>
                  </div>
                </button>
              )}

              {onReturnToMenu && (
                <button
                  type="button"
                  onClick={() => {
                    soundscape.playDieSelect();
                    setIsMobileOpsOpen(false);
                    onReturnToMenu();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-950/25 hover:bg-red-900/40 border border-red-800/60 text-left text-red-300 text-xs transition-colors cursor-pointer"
                >
                  <span className="text-base shrink-0">↩</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold">{t('ui.menu', 'EXIT TO MENU', currentLang)}</span>
                    <span className="text-[10px] text-red-400/80 truncate">Return to main screen</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
