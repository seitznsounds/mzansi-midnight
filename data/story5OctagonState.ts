import { GameState, MapNode, Clock } from '../types/game';

export const OCTAGON_NODES: Record<string, MapNode> = {
  o1_drakensberg_bunker: {
    id: 'o1_drakensberg_bunker',
    title: 'Drakensberg Subterranean Redoubt',
    subtitle: 'Decommissioned Cold War military command bunker blasted into granite peaks; United Hawks Taskforce war room',
    factionOwner: 'united_hawks_taskforce',
    tier: 'civic_center',
    x: 50,
    y: 30,
    isUnlocked: true,
    connectedNodeIds: [
      'o2_union_buildings_subbasement',
      'o3_apollo_grid_command',
      'o4_durban_berth_command',
    ],
    actionSlots: [
      {
        id: 'slot_o1_war_room_synthesis',
        title: 'Synthesize 4-Story Keystone Evidentiary Dossier',
        description: 'Cross-reference Durban water tenders, Highveld coal logs, Namaqua arms manifests, and Cape protection dockets.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'treason_indictment_docket', delta: 2 }],
            composureDelta: 15,
            cashDelta: 500,
            unlockNodeIds: [
              'o2_union_buildings_subbasement',
              'o3_apollo_grid_command',
              'o4_durban_berth_command',
            ],
            narrativeLog:
              'The four regional keystones interlock perfectly: every transaction traces directly to the Sovereign Octagon’s Swiss escrow accounts.',
          },
          compromised: {
            clockProgress: [{ clockId: 'treason_indictment_docket', delta: 1 }],
            unlockNodeIds: [
              'o3_apollo_grid_command',
              'o4_durban_berth_command',
            ],
            narrativeLog:
              'You bind the dockets into an emergency indictment, though encrypted financial ledgers still require Apollo SCADA verification.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: 1 }],
            narrativeLog:
              'A corrupted satellite downlink leaks the bunker’s emergency generator coordinates to mercenary listening posts.',
          },
        },
      },
      {
        id: 'slot_o1_buy_gear',
        title: 'Taskforce Command Armory (R1,100 - R1,200)',
        description: 'Equip the vanguard with high-altitude satellite communicators or closed-circuit hazmat rebreathers.',
        stat: 'any',
        isRepeatable: false,
        isCompleted: false,
        costCash: 1200,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_taskforce_satellite_uplink',
            narrativeLog:
              'You configure a military-spec Inmarsat burst-transmitter, securing jamming-immune satellite comms across all provinces.',
          },
          compromised: {
            addInventoryItem: 'gear_black_sky_respirator',
            cashDelta: 100,
            narrativeLog:
              'You purchase a closed-circuit battlefield command rebreather with ceramic ballistic trauma plating.',
          },
          failure: {
            cashDelta: -200,
            narrativeLog:
              'A supply courier was intercepted on the mountain pass; you salvage partial tactical batteries.',
          },
        },
      },
    ],
  },

  o2_union_buildings_subbasement: {
    id: 'o2_union_buildings_subbasement',
    title: 'Union Buildings Executive Crypt',
    subtitle: 'Century-old sandstone foundations beneath Pretoria executive wings, guarded by loyalist Constitutional Marshals',
    factionOwner: 'constitutional_court_guard',
    tier: 'civic_center',
    x: 20,
    y: 26,
    isUnlocked: false,
    connectedNodeIds: [
      'o1_drakensberg_bunker',
      'o3_apollo_grid_command',
      'o7_octagon_summit_chamber',
    ],
    actionSlots: [
      {
        id: 'slot_o2_secure_executive_seal',
        title: 'Secure High Court Constitutional Arrest Warrants',
        description: 'Present the consolidated state capture docket to the Deputy Chief Justice for immediate Section 179 execution.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            addInventoryItem: 'evidence_constitutional_indictment',
            clockProgress: [{ clockId: 'treason_indictment_docket', delta: 2 }],
            unlockNodeIds: ['o7_octagon_summit_chamber'],
            composureDelta: 20,
            narrativeLog:
              'The Deputy Chief Justice stamps the master arrest warrants under armed High Court marshal protection: the eight conspirators are officially outlawed.',
          },
          compromised: {
            addInventoryItem: 'evidence_constitutional_indictment',
            clockProgress: [{ clockId: 'treason_indictment_docket', delta: 1 }],
            unlockNodeIds: ['o7_octagon_summit_chamber'],
            narrativeLog:
              'The warrants are executed, but rogue State Security snipers surround the Union Buildings gardens.',
          },
          failure: {
            composureDelta: -20,
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: 2 }],
            narrativeLog:
              'A mercenary assault squad breaches the western portico; you extract the judiciary into the subterranean service tunnels.',
          },
        },
      },
      {
        id: 'slot_o2_counter_state_censorship',
        title: 'Broadcast Emergency Treason Indictment',
        description: 'Bypass state broadcast censors and transmit the unmasked Octagon roster directly across national public television.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: -2 }],
            composureDelta: 15,
            narrativeLog:
              'Every phone and emergency television in South Africa broadcasts the faces of the eight oligarchs. Thousands take to the streets.',
          },
          compromised: {
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: -1 }],
            narrativeLog:
              'The broadcast cuts through regional radio feeds before military jammers knock out the Pretoria relay tower.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'Signal jammers flood the frequency with static and white noise.',
          },
        },
      },
    ],
  },

  o3_apollo_grid_command: {
    id: 'o3_apollo_grid_command',
    title: 'Apollo SCADA National Grid Control',
    subtitle: 'Heavily fortified transmission control center managing the 400kV high-voltage arterial power grid of South Africa',
    factionOwner: 'national_grid_command',
    tier: 'street_west',
    x: 22,
    y: 74,
    isUnlocked: false,
    connectedNodeIds: [
      'o1_drakensberg_bunker',
      'o2_union_buildings_subbasement',
      'o5_karoo_airspace_corridor',
    ],
    actionSlots: [
      {
        id: 'slot_o3_reboot_scada_breakers',
        title: 'Execute Emergency Black-Start SCADA Bypass',
        description: 'Manually re-synchronize national grid frequencies from the reinforced control pit to halt total collapse.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'national_blackout_countdown', delta: -2 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor'],
            composureDelta: 15,
            narrativeLog:
              'Chief Engineer Motaung locks the hydraulic breakers: pumped-storage hydro generators fire up, stabilizing grid frequency above 48.5 Hz.',
          },
          compromised: {
            clockProgress: [{ clockId: 'national_blackout_countdown', delta: -1 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor'],
            narrativeLog:
              'You stabilize the northern transmission grid, though southern corridors remain locked under Stage 6 shed cycles.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'national_blackout_countdown', delta: 1 }],
            narrativeLog:
              'A sabotage logic-bomb detonates in the terminal firmware, tripping three 400kV regional feeder transformers.',
          },
        },
      },
      {
        id: 'slot_o3_extract_omega_charter',
        title: 'Extract The Sovereign Octagon Omega Charter',
        description: 'Breach the Tier-0 SCADA mainframe to copy the unredacted master agreement for Operation Midnight Sun.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            addInventoryItem: 'evidence_omega_protocol',
            clockProgress: [{ clockId: 'decrypt_master_omega_cipher', delta: 2 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor', 'o7_octagon_summit_chamber'],
            composureDelta: 15,
            narrativeLog:
              'The master document is decrypted: the 8 conspirators have pre-signed the decree to dissolve Parliament and privatize state security.',
          },
          compromised: {
            addInventoryItem: 'evidence_omega_protocol',
            clockProgress: [{ clockId: 'decrypt_master_omega_cipher', delta: 1 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor', 'o7_octagon_summit_chamber'],
            narrativeLog:
              'You secure the encrypted charter, but an automated alert notifies the Octagon summit security detail.',
          },
          failure: {
            composureDelta: -20,
            narrativeLog:
              'Hardware optical locks trigger a localized magnetic wipe, burning your fingers on the casing.',
          },
        },
      },
      {
        id: 'slot_o3_buy_key',
        title: 'Acquire SCADA Master Optical Override Key (R1,000)',
        description: 'Purchase an authorized Tier-0 grid bypass key from loyalist control engineers.',
        stat: 'any',
        isRepeatable: false,
        isCompleted: false,
        costCash: 1000,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_scada_master_key',
            narrativeLog:
              'You secure the national optical SCADA key, enabling instantaneous manual breaker stabilization across all provinces.',
          },
          compromised: {
            addInventoryItem: 'gear_scada_master_key',
            cashDelta: -100,
            narrativeLog:
              'You pay an emergency courier premium to secure the cryptographic hardware key.',
          },
          failure: {
            cashDelta: -150,
            narrativeLog:
              'The engineer was detained by mercenary guards; you escape with a burned diagnostic copy.',
          },
        },
      },
    ],
  },

  o4_durban_berth_command: {
    id: 'o4_durban_berth_command',
    title: 'Table Bay / Durban Maritime Redoubt',
    subtitle: 'Strategic dual-port command post coordinating longshore dockers, taxi convoys, and coastal missile batteries',
    factionOwner: 'people_resistance_front',
    tier: 'waterfront_east',
    x: 50,
    y: 78,
    isUnlocked: false,
    connectedNodeIds: [
      'o1_drakensberg_bunker',
      'o5_karoo_airspace_corridor',
    ],
    actionSlots: [
      {
        id: 'slot_o4_mobilize_harbour_blockade',
        title: 'Mobilize National Transport & Port Blockade',
        description: 'Coordinate taxi associations and dockworkers unions to seal all airport perimeters and maritime exits.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'midnight_sun_coup_countdown', delta: -2 }],
            factionRepDelta: [{ factionId: 'people_resistance_front', delta: 2 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor'],
            composureDelta: 15,
            narrativeLog:
              'Ten thousand minibus taxis and heavy straddle carriers barricade all highway exits and container berths. The conspirators are trapped.',
          },
          compromised: {
            clockProgress: [{ clockId: 'midnight_sun_coup_countdown', delta: -1 }],
            factionRepDelta: [{ factionId: 'people_resistance_front', delta: 1 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor'],
            narrativeLog:
              'Port workers establish razor-wire choke points across Berth 109, stalling mercenary convoys.',
          },
          failure: {
            composureDelta: -15,
            narrativeLog:
              'Private military gunboats fire warning flares, forcing dock pickets to take cover behind shipping containers.',
          },
        },
      },
      {
        id: 'slot_o4_intercept_arms_convoy',
        title: 'Ambush Mercenary Logistics Convoy',
        description: 'Intercept the armored transports ferrying tactical rifles and night-vision equipment from the coast.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            cashDelta: 800,
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: -2 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor'],
            composureDelta: 10,
            narrativeLog:
              'You disable the lead transport with spike strips. Dockers secure four crates of assault rifles and R800 in courier cash.',
          },
          compromised: {
            cashDelta: 400,
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: -1 }],
            unlockNodeIds: ['o5_karoo_airspace_corridor'],
            narrativeLog:
              'You capture one support bakkie while the primary transport escapes through port back gates.',
          },
          failure: {
            composureDelta: -20,
            narrativeLog:
              'Heavy machine-gun fire from an armored escort forces your strike team into warehouse alleys.',
          },
        },
      },
    ],
  },

  o5_karoo_airspace_corridor: {
    id: 'o5_karoo_airspace_corridor',
    title: 'Karoo Electronic Warfare Corridor',
    subtitle: 'Arid desert plateaus housing Square Kilometre Array listening posts, converted into an electronic jamming battlefield',
    factionOwner: 'the_sovereign_octagon',
    tier: 'street_west',
    x: 78,
    y: 52,
    isUnlocked: false,
    connectedNodeIds: [
      'o3_apollo_grid_command',
      'o4_durban_berth_command',
      'o6_stellenbosch_oligarch_vault',
    ],
    actionSlots: [
      {
        id: 'slot_o5_jam_executive_radar',
        title: 'Neutralize Electronic Warfare Jamming Towers',
        description: 'Scale the radio mast array to cut power to the high-frequency radar jammers blinding national airspace.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'airspace_radar_jamming', delta: -2 }],
            unlockNodeIds: ['o6_stellenbosch_oligarch_vault', 'o7_octagon_summit_chamber'],
            composureDelta: 15,
            narrativeLog:
              'You sever the primary radar transmitter feeds: commercial air traffic control radar and Taskforce telemetry snap back online.',
          },
          compromised: {
            clockProgress: [{ clockId: 'airspace_radar_jamming', delta: -1 }],
            unlockNodeIds: ['o6_stellenbosch_oligarch_vault'],
            narrativeLog:
              'You blind the local tactical relay, clearing a narrow radar corridor for Taskforce air assets.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'airspace_radar_jamming', delta: 1 }],
            narrativeLog:
              'RF microwave feedback overloads your scanner antenna, shocking your hands and ears.',
          },
        },
      },
      {
        id: 'slot_o5_intercept_courier_flight',
        title: 'Ground Executive Charter Jet ZS-900',
        description: 'Use radar coordinates to vector interceptors onto the executive Gulfstream ferrying the Octagon’s bullion reserve.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            cashDelta: 1200,
            clockProgress: [{ clockId: 'decrypt_master_omega_cipher', delta: 1 }],
            unlockNodeIds: ['o6_stellenbosch_oligarch_vault', 'o7_octagon_summit_chamber'],
            composureDelta: 15,
            narrativeLog:
              'The executive jet is forced down at an arid desert airstrip. You seize R1,200 operational cash and diplomatic crypto-pouches.',
          },
          compromised: {
            cashDelta: 600,
            unlockNodeIds: ['o6_stellenbosch_oligarch_vault'],
            narrativeLog:
              'The flight diverts to a private diamond runway, dumping half its cargo in the dunes before takeoff.',
          },
          failure: {
            composureDelta: -15,
            narrativeLog:
              'The jet enters cloud cover under radar jamming and slips across the border.',
          },
        },
      },
    ],
  },

  o6_stellenbosch_oligarch_vault: {
    id: 'o6_stellenbosch_oligarch_vault',
    title: 'Winelands Sovereign Vault & Escrow',
    subtitle: 'Fortified subterranean bank beneath century-old estate vineyards, routing billions in Swiss offshore mercenary payrolls',
    factionOwner: 'the_sovereign_octagon',
    tier: 'street_west',
    x: 80,
    y: 80,
    isUnlocked: false,
    connectedNodeIds: [
      'o5_karoo_airspace_corridor',
      'o7_octagon_summit_chamber',
    ],
    actionSlots: [
      {
        id: 'slot_o6_freeze_swiss_escrow',
        title: 'Freeze Mercenary Sovereign Payroll Accounts',
        description: 'Execute international Section 205 freeze orders on the Geneva and Mauritius trust accounts bankrolling private armies.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [
              { clockId: 'octagon_mercenary_sweep', delta: -2 },
              { clockId: 'treason_indictment_docket', delta: 1 },
            ],
            composureDelta: 20,
            narrativeLog:
              'Swiss and South African authorities freeze R420 million in real time: the mercenary commanders refuse to deploy without verified wire transfer.',
          },
          compromised: {
            clockProgress: [{ clockId: 'octagon_mercenary_sweep', delta: -1 }],
            narrativeLog:
              'You freeze primary payroll lines, though shell companies continue emergency cash distributions.',
          },
          failure: {
            composureDelta: -15,
            narrativeLog:
              'Dynasty lawyers tie up your emergency interdict with high court injunctions.',
          },
        },
      },
      {
        id: 'slot_o6_extract_cabal_correspondence',
        title: 'Raid Subterranean Oligarch Vault',
        description: 'Crack the electronic biometric safe to retrieve personal correspondence between the eight founders.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'decrypt_master_omega_cipher', delta: 2 }],
            unlockNodeIds: ['o7_octagon_summit_chamber'],
            composureDelta: 15,
            narrativeLog:
              'The vault yields audio recordings of the Octagon founders laughing as they planned the blackouts. Complete proof of criminal conspiracy.',
          },
          compromised: {
            clockProgress: [{ clockId: 'decrypt_master_omega_cipher', delta: 1 }],
            unlockNodeIds: ['o7_octagon_summit_chamber'],
            narrativeLog:
              'You retrieve certified financial ledgers as vault alarms sound across the estate.',
          },
          failure: {
            composureDelta: -15,
            narrativeLog:
              'Automated vault locks seal the heavy blast doors, forcing you to retreat empty-handed.',
          },
        },
      },
    ],
  },

  o7_octagon_summit_chamber: {
    id: 'o7_octagon_summit_chamber',
    title: 'The Sovereign Octagon Summit Sanctum',
    subtitle: 'Fortified Karoo mountain redoubt where the 8 corporate-state conspirators gather to execute the final transfer of sovereignty',
    factionOwner: 'the_sovereign_octagon',
    tier: 'civic_center',
    x: 80,
    y: 22,
    isUnlocked: false,
    connectedNodeIds: [
      'o1_drakensberg_bunker',
      'o2_union_buildings_subbasement',
      'o6_stellenbosch_oligarch_vault',
    ],
    actionSlots: [
      {
        id: 'slot_o7_breach_command_sanctum',
        title: 'Breach the Fortified Summit Chamber',
        description: 'Lead the combined Taskforce breach team through the blast doors during the 90-second blackout breaker reboot.',
        stat: 'any',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            composureDelta: 30,
            narrativeLog:
              'The breaching charge shatters the titanium blast doors. You step into the amphitheater where the eight founders sit paralyzed in the beam of tactical lights.',
          },
          compromised: {
            composureDelta: 10,
            narrativeLog:
              'You breach the chamber through heavy crossfire; two conspirators attempt to burn evidence in the corner hearth.',
          },
          failure: {
            composureDelta: -30,
            clockProgress: [{ clockId: 'midnight_sun_coup_countdown', delta: 2 }],
            narrativeLog:
              'Mercenary bodyguards pin your team down in the access corridor with high-caliber machine guns.',
          },
        },
      },
      {
        id: 'slot_o7_transmit_omega_evidence',
        title: 'Transmit Unified Master Dossier to High Court & Public',
        description: 'Upload the complete unredacted Omega Protocol from the central terminal directly to all nine provincial high courts.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'treason_indictment_docket', delta: 3 }],
            composureDelta: 25,
            narrativeLog:
              'The national satellite array locks on: the full master docket floods every court, every newsroom, and every police station in South Africa.',
          },
          compromised: {
            clockProgress: [{ clockId: 'treason_indictment_docket', delta: 2 }],
            narrativeLog:
              'The evidence transmits successfully across emergency judicial data links before terminal breakers trip.',
          },
          failure: {
            composureDelta: -20,
            narrativeLog:
              'The terminal crashes under an automated data-wipe virus.',
          },
        },
      },
    ],
  },
};

export const OCTAGON_CLOCKS: Record<string, Clock> = {
  national_blackout_countdown: {
    id: 'national_blackout_countdown',
    title: 'National Stage 8 Grid Collapse',
    description: 'Countdown to total nationwide power grid collapse (0/8) and blackout of all critical infrastructure.',
    type: 'world',
    current: 1,
    max: 8,
    advancesDaily: true,
    onCompleteEventId: 'evt_black_sky_collapse',
  },
  octagon_mercenary_sweep: {
    id: 'octagon_mercenary_sweep',
    title: 'The Octagon’s Private Army Sweeps',
    description: 'Armored paramilitary gunships and tactical mercenaries comb command redoubts to wipe out the Taskforce.',
    type: 'threat',
    current: 1,
    max: 6,
    advancesDaily: true,
    onCompleteEventId: 'evt_mercenary_air_assault',
  },
  airspace_radar_jamming: {
    id: 'airspace_radar_jamming',
    title: 'Karoo Electronic Warfare Jamming',
    description: 'High-frequency jamming towers blinding air traffic control, satellite uplinks, and tactical radios.',
    type: 'threat',
    current: 1,
    max: 6,
    advancesDaily: false,
    onCompleteEventId: 'evt_radar_blackout_hazard',
  },
  treason_indictment_docket: {
    id: 'treason_indictment_docket',
    title: 'Constitutional Treason Docket',
    description: 'Compiling the emergency indictment to empower the Constitutional Court and arrest the eight founders.',
    type: 'action',
    current: 1,
    max: 6,
    advancesDaily: false,
    onCompleteEventId: 'evt_treason_docket_complete',
  },
  decrypt_master_omega_cipher: {
    id: 'decrypt_master_omega_cipher',
    title: 'Decrypt The Omega Charter',
    description: 'Synthesizing the master cryptographic string unmasking the secret constitution of the shadow oligarchy.',
    type: 'action',
    current: 1,
    max: 6,
    advancesDaily: false,
    onCompleteEventId: 'evt_omega_cipher_decrypted',
  },
  midnight_sun_coup_countdown: {
    id: 'midnight_sun_coup_countdown',
    title: 'Operation Midnight Sun Coup',
    description: 'Countdown to the formal declaration of the Sovereign Council and dissolution of the democratic state.',
    type: 'world',
    current: 1,
    max: 6,
    advancesDaily: true,
    onCompleteEventId: 'evt_coup_declaration_crisis',
  },
};

export const initialOctagonGameState: GameState = {
  storyId: 'story_5_octagon',
  act: 1,
  day: 1,
  cash: 1500,
  composure: 90,
  loadSheddingStage: 6,
  stats: {
    street: 1,
    dockets: 2,
    wire: 1,
    influence: 1,
  },
  factionRep: {
    // Story 1 factions
    abasanta: 0,
    city_hall: 0,
    saps_trt: 0,
    street_syndicate: 0,
    hawks: 0,
    // Story 2 factions
    megawatt_cartel: 0,
    sandton_arbitrage: 0,
    reef_zamazamas: 0,
    siu_clean_hands: 0,
    red_guard_populists: 0,
    // Story 3 factions
    aegis_marine: 0,
    artisanal_divers: 0,
    kalahari_runners: 0,
    namaqua_command: 0,
    namib_syndicate: 0,
    // Story 4 factions
    long_street_racket: 0,
    cape_gang_federation: 0,
    winelands_club: 0,
    agu_renegades: 0,
    dockers_union: 0,
    // Story 5 factions
    united_hawks_taskforce: 2,
    the_sovereign_octagon: -2,
    constitutional_court_guard: 1,
    national_grid_command: 1,
    people_resistance_front: 1,
  },
  inventory: [
    'dossier_sovereign_pearl',
    'dossier_project_midas',
    'dossier_admiralty_manifest',
    'dossier_red_protocol',
  ],
  dicePool: [
    { id: 'd1', value: 6, isUsed: false },
    { id: 'd2', value: 5, isUsed: false },
    { id: 'd3', value: 4, isUsed: false },
    { id: 'd4', value: 3, isUsed: false },
    { id: 'd5', value: 2, isUsed: false },
  ],
  clocks: OCTAGON_CLOCKS,
  nodes: OCTAGON_NODES,
  activeLog: [
    '00:00 SAST // TOTAL GRID FREQUENCY COLLAPSE. National Stage 8 blackout active across all 9 provinces.',
    'The four regional keystones are secured in the Drakensberg war room. The United Hawks Taskforce is operational.',
    'The eight corporate-state conspirators of The Sovereign Octagon have convened in their fortified Karoo mountain summit.',
  ],
  triggeredEventsQueue: [],
  activeEndingId: null,
  currentNodeId: 'o1_drakensberg_bunker',
  generatorActiveToday: true,
  usedPerksToday: [],
  claimedDialogueRewards: [],
};
