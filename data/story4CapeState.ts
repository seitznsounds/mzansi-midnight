import { GameState, MapNode, Clock } from '../types/game';

export const CAPE_NODES: Record<string, MapNode> = {
  c1_long_street_strip: {
    id: 'c1_long_street_strip',
    title: 'Long Street Neon Strip',
    subtitle: 'Thumping bass, neon-lit Victorian verandas, and private bouncer extortion syndicates',
    factionOwner: 'long_street_racket',
    tier: 'street_west',
    x: 20,
    y: 32,
    isUnlocked: true,
    connectedNodeIds: [
      'c2_manenberg_tenements',
      'c3_camps_bay_promenade',
      'c4_table_bay_container_berth',
    ],
    actionSlots: [
      {
        id: 'slot_c1_surveil_nightclubs',
        title: 'Surveil Nightclub Protection Rings',
        description: 'Plant wireless sniffer bugs behind the VIP bar booths to intercept bouncer payoff logs.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'nightclub_extortion_clock', delta: 2 }],
            composureDelta: 5,
            cashDelta: 350,
            unlockNodeIds: ['c2_manenberg_tenements', 'c3_camps_bay_promenade', 'c4_table_bay_container_berth'],
            narrativeLog:
              'You intercept an encrypted voice note: every club along the strip pays R40k a week directly to Foreshore Holdings.',
          },
          compromised: {
            clockProgress: [
              { clockId: 'nightclub_extortion_clock', delta: 1 },
              { clockId: 'gang_turf_war_clock', delta: 1 },
            ],
            unlockNodeIds: ['c2_manenberg_tenements', 'c4_table_bay_container_berth'],
            narrativeLog:
              'You clone a bouncer supervisor’s call logs, but an enforcer with a radio earpiece spots you loitering in the alley.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: 1 }],
            narrativeLog:
              'A pair of private security heavies slam you against a brick wall, confiscating your scanner antenna.',
          },
        },
      },
      {
        id: 'slot_c1_interrogate_bouncer',
        title: 'Confront Head Bouncer Zack',
        description: 'Use police intimidation or street leverage to demand who supplies the unmarked firearm holsters.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'nightclub_extortion_clock', delta: 1 }],
            factionRepDelta: [{ factionId: 'long_street_racket', delta: 1 }],
            unlockNodeIds: ['c2_manenberg_tenements'],
            composureDelta: 10,
            narrativeLog:
              'Zack spits out a chewed toothpick. "We don’t buy from gangs, Leila. Our rifles come off the Table Bay container ships with police escort."',
          },
          compromised: {
            composureDelta: -5,
            clockProgress: [{ clockId: 'gang_turf_war_clock', delta: 1 }],
            unlockNodeIds: ['c2_manenberg_tenements'],
            narrativeLog:
              'Zack gives up a warehouse code, but warns that 28s street soldiers are staking out the corner.',
          },
          failure: {
            composureDelta: -10,
            factionRepDelta: [{ factionId: 'long_street_racket', delta: -1 }],
            narrativeLog:
              'Bouncers form a wall of black jackets, shoving you out onto the rain-slicked pavement.',
          },
        },
      },
      {
        id: 'slot_c1_buy_gear',
        title: 'Darknet Street Armory (R750 - R850)',
        description: 'Acquire high-grade tactical protection or signals hardware from underground contacts.',
        stat: 'any',
        isRepeatable: false,
        isCompleted: false,
        costCash: 850,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_reinforced_agu_vest',
            narrativeLog:
              'You purchase a custom ceramic-plated AGU body vest capable of absorbing assault-rifle kinetic impact.',
          },
          compromised: {
            addInventoryItem: 'gear_encrypted_burner_mesh',
            narrativeLog:
              'Cash was short for the armor, so you purchase an encrypted peer-to-peer darknet mesh transmitter instead.',
          },
          failure: {
            cashDelta: -150,
            narrativeLog:
              'The arms courier got spooked by an unmarked police van; you pay an emergency handling fee without securing hardware.',
          },
        },
      },
    ],
  },

  c2_manenberg_tenements: {
    id: 'c2_manenberg_tenements',
    title: 'Manenberg Tenement Blocks',
    subtitle: 'Washing lines strung between bullet-scarred flats, gang tags, and church soup-kitchens',
    factionOwner: 'cape_gang_federation',
    tier: 'street_west',
    x: 48,
    y: 52,
    isUnlocked: true,
    connectedNodeIds: [
      'c1_long_street_strip',
      'c6_agu_safehouse_ruin',
      'c7_provincial_police_hq',
    ],
    actionSlots: [
      {
        id: 'slot_c2_street_surveillance',
        title: 'Map Gang Weapon Distribution Lines',
        description: 'Track the modified delivery scooters delivering fresh crated ammunition to local gang commanders.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'gang_turf_war_clock', delta: -1 }],
            unlockNodeIds: ['c6_agu_safehouse_ruin'],
            composureDelta: 10,
            narrativeLog:
              'You trace a scooter to a basement locker: all the ammunition boxes bear SAPS Pretoria central logistics serial stamps.',
          },
          compromised: {
            clockProgress: [{ clockId: 'gang_turf_war_clock', delta: 1 }],
            unlockNodeIds: ['c6_agu_safehouse_ruin'],
            narrativeLog:
              'You identify the cache, but a lookout whistle blows and teenagers scatter down the washing-line courts.',
          },
          failure: {
            composureDelta: -20,
            clockProgress: [{ clockId: 'gang_turf_war_clock', delta: 2 }],
            narrativeLog:
              'Stray crossfire breaks out across the courtyard. You duck behind a concrete stairwell as glass rains down.',
          },
        },
      },
      {
        id: 'slot_c2_consult_pastor_ronnie',
        title: 'Meet Pastor Ronnie Jacobs',
        description: 'Present forensic ballistics evidence to the ex-28s general who now brokers neighborhood truces.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 1 }],
            factionRepDelta: [{ factionId: 'cape_gang_federation', delta: 1 }],
            composureDelta: 10,
            narrativeLog:
              'Pastor Ronnie looks at the striation photos: "These guns weren’t bought on the street, Leila. General Swart handed them directly to King Solomons."',
          },
          compromised: {
            factionRepDelta: [{ factionId: 'cape_gang_federation', delta: 1 }],
            narrativeLog:
              'Ronnie confirms the police-gang pipeline, but warns that young hitmen are answering to private security stipends now.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'Grief and anger boil over in the vestry. Ronnie refuses to speak while police surveillance drones circle overhead.',
          },
        },
      },
    ],
  },

  c3_camps_bay_promenade: {
    id: 'c3_camps_bay_promenade',
    title: 'Camps Bay Atlantic Strip',
    subtitle: 'Palm trees, granite boulders, luxury villas, and private security drone towers',
    factionOwner: 'winelands_club',
    tier: 'waterfront_east',
    x: 20,
    y: 74,
    isUnlocked: false,
    connectedNodeIds: ['c1_long_street_strip', 'c5_stellenbosch_wine_estate'],
    actionSlots: [
      {
        id: 'slot_c3_intercept_villa_comms',
        title: 'Wiretap Oligarch Villa Telemetry',
        description: 'Position an RF receiver on the rocks beneath Victoria Road to tap the Capital Club villa routers.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 2 }],
            unlockNodeIds: ['c5_stellenbosch_wine_estate'],
            composureDelta: 5,
            addInventoryItem: 'evidence_winelands_trust_ledger',
            narrativeLog:
              'You intercept wire transfers routing through Geneva: R420 million earmarked for "Private Coastal Protection Forces."',
          },
          compromised: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 1 }],
            unlockNodeIds: ['c5_stellenbosch_wine_estate'],
            narrativeLog:
              'You capture transaction headers linking wine estates to container berths, but security sweeps force you back into the kelp line.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: 1 }],
            narrativeLog:
              'A private patrol helicopter sweeps a searchlight across the rocks; you ditch your parabolic mic in the surf.',
          },
        },
      },
      {
        id: 'slot_c3_confront_baroness',
        title: 'Audit Offshore Trust Disclosures',
        description: 'Corner Baroness Claudine at her oceanfront terrace with the Namaqua diamond delivery receipts.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            cashDelta: 750,
            factionRepDelta: [{ factionId: 'winelands_club', delta: 1 }],
            composureDelta: 10,
            narrativeLog:
              'Claudine sips chilled MCC without blinking. "We don’t deal in petty extortion, darling. We fund order. And when the power grid fails, order will belong to us."',
          },
          compromised: {
            cashDelta: 300,
            narrativeLog:
              'Claudine hands over an envelope to silence your inquiries, warning that General Swart has already signed your detention order.',
          },
          failure: {
            composureDelta: -10,
            factionRepDelta: [{ factionId: 'winelands_club', delta: -1 }],
            narrativeLog:
              'Armed private bodyguards escort you off the terrace into the howling Atlantic wind.',
          },
        },
      },
    ],
  },

  c4_table_bay_container_berth: {
    id: 'c4_table_bay_container_berth',
    title: 'Table Bay Berth 109 & Container Apron',
    subtitle: 'Massive gantry cranes, container stacks, and private naval armaments awaiting midnight discharge',
    factionOwner: 'dockers_union',
    tier: 'waterfront_east',
    x: 50,
    y: 20,
    isUnlocked: false,
    connectedNodeIds: [
      'c1_long_street_strip',
      'c5_stellenbosch_wine_estate',
      'c7_provincial_police_hq',
    ],
    actionSlots: [
      {
        id: 'slot_c4_audit_customs_manifest',
        title: 'Audit Stevedore Pier Manifests',
        description: 'Breach the terminal operations office to verify container customs evasion logs.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            addInventoryItem: 'evidence_pier109_arms_bill',
            clockProgress: [{ clockId: 'sovereign_arms_shipment', delta: -1 }],
            unlockNodeIds: ['c7_provincial_police_hq'],
            composureDelta: 10,
            narrativeLog:
              'You secure the raw shipping manifest: Container #MSCU-449102 contains 450 military assault rifles, shipped under false agricultural labels.',
          },
          compromised: {
            clockProgress: [{ clockId: 'sovereign_arms_shipment', delta: 1 }],
            unlockNodeIds: ['c7_provincial_police_hq'],
            narrativeLog:
              'You photograph the armaments invoice, but dock security sound alarms, locking down the gantry lanes.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'cape_doctor_gale_clock', delta: 1 }],
            narrativeLog:
              'The Cape Doctor gale howls through the crane cables, tearing documents from your grip as security guards approach.',
          },
        },
      },
      {
        id: 'slot_c4_rally_stevedores',
        title: 'Organize Stevedore Blockade',
        description: 'Convince union chief Cassiem Petersen to freeze crane operations on Berth 109.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'sovereign_arms_shipment', delta: -2 }],
            factionRepDelta: [{ factionId: 'dockers_union', delta: 2 }],
            composureDelta: 10,
            narrativeLog:
              'Cassiem blows the union whistle. Gantry cranes grind to a dead halt across Berth 109. The arms vessel is trapped at the quay.',
          },
          compromised: {
            clockProgress: [{ clockId: 'sovereign_arms_shipment', delta: -1 }],
            factionRepDelta: [{ factionId: 'dockers_union', delta: 1 }],
            narrativeLog:
              'Stevedores stage a go-slow strike, delaying container offloading by several crucial hours.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'Port police threaten union leaders with anti-terrorism legislation; the cranes keep running.',
          },
        },
      },
      {
        id: 'slot_c4_buy_prybar',
        title: 'Acquire Berth Prybar (R600)',
        description: 'Purchase a hardened tungsten container prybar from union repair shops.',
        stat: 'any',
        isRepeatable: false,
        isCompleted: false,
        costCash: 600,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_stevedore_prybar',
            narrativeLog:
              'You buy a hardened industrial prybar, capable of breaking steel customs seals on export containers.',
          },
          compromised: {
            addInventoryItem: 'gear_stevedore_prybar',
            cashDelta: -100,
            narrativeLog:
              'You buy the tool with an added union solidarity surcharge.',
          },
          failure: {
            cashDelta: -100,
            narrativeLog:
              'The shop steward was tipped off and closed early.',
          },
        },
      },
    ],
  },

  c5_stellenbosch_wine_estate: {
    id: 'c5_stellenbosch_wine_estate',
    title: 'Stellenbosch Manor & Cellars',
    subtitle: 'Cape Dutch gables, century-old oak avenues, and subterranean vaults safeguarding sovereign treaties',
    factionOwner: 'winelands_club',
    tier: 'civic_center',
    x: 80,
    y: 26,
    isUnlocked: false,
    connectedNodeIds: [
      'c3_camps_bay_promenade',
      'c4_table_bay_container_berth',
      'c7_provincial_police_hq',
    ],
    actionSlots: [
      {
        id: 'slot_c5_search_cellar_safe',
        title: 'Breach the 18th-Century Vault Safe',
        description: 'Crack the electronic biometric safe hidden behind vintage French oak casks.',
        stat: 'wire',
        isRepeatable: false,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            addInventoryItem: 'evidence_red_cipher_fragment',
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 2 }],
            composureDelta: 15,
            narrativeLog:
              'The biometric safe yields: you retrieve the cryptographic ledger of the Capital Club unmasking General Swart and the Sovereign Octagon.',
          },
          compromised: {
            addInventoryItem: 'evidence_red_cipher_fragment',
            clockProgress: [
              { clockId: 'red_cipher_decryption', delta: 1 },
              { clockId: 'general_swart_manhunt', delta: 1 },
            ],
            narrativeLog:
              'You download the cipher fragment, but silent tripwires alert estate security guards.',
          },
          failure: {
            composureDelta: -20,
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: 2 }],
            narrativeLog:
              'An electric failsafe arcs across the lockbox, wiping the hard drive and shocking your hands.',
          },
        },
      },
      {
        id: 'slot_c5_interrogate_trustees',
        title: 'Subpoena Dynasty Trustees',
        description: 'Expose the connection between winelands tax exemptions and the Namaqua arms convoy.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 1 }],
            factionRepDelta: [{ factionId: 'winelands_club', delta: -1 }],
            composureDelta: 10,
            narrativeLog:
              'The estate lawyers fold under your relentless documentation. They admit the private security force is mobilizing for a planned nationwide grid blackout.',
          },
          compromised: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 1 }],
            narrativeLog:
              'They hand over corporate charts, but threaten to bury your private investigator license in high court litigation.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'The trustees stonewall behind interdicts and private armed guards.',
          },
        },
      },
    ],
  },

  c6_agu_safehouse_ruin: {
    id: 'c6_agu_safehouse_ruin',
    title: 'Charred Anti-Gang Unit Bunker',
    subtitle: 'Burned forensic lockers, scorch marks, and renegade officers operating off the police grid',
    factionOwner: 'agu_renegades',
    tier: 'civic_center',
    x: 50,
    y: 80,
    isUnlocked: false,
    connectedNodeIds: ['c2_manenberg_tenements', 'c7_provincial_police_hq'],
    actionSlots: [
      {
        id: 'slot_c6_analyze_partner_ballistics',
        title: 'Run Striation Ballistics Comparison',
        description: 'Compare the recovered 9mm murder projectile against Major-General Swart’s registered service weapon.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 2 }],
            unlockNodeIds: ['c7_provincial_police_hq'],
            composureDelta: 15,
            narrativeLog:
              'The comparator microscope locks into focus: 16 identical rifling grooves. General Swart personally pulled the trigger on your partner.',
          },
          compromised: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 1 }],
            unlockNodeIds: ['c7_provincial_police_hq'],
            narrativeLog:
              'The striation match is conclusive, but the safehouse generator begins smoking from electrical fault.',
          },
          failure: {
            composureDelta: -15,
            narrativeLog:
              'Old trauma paralyzes your hands as you handle your partner’s bloodstained evidence envelope.',
          },
        },
      },
      {
        id: 'slot_c6_rearm_renegades',
        title: 'Coordinate Renegade Strike Force',
        description: 'Arm Sergeant Warren Abrahams and surviving honest detectives for the final confrontation.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: -2 }],
            factionRepDelta: [{ factionId: 'agu_renegades', delta: 2 }],
            composureDelta: 10,
            narrativeLog:
              'Warren racks an R5 rifle: "If the Commissioner wants a war, Leila, he’s going to get it outside court."',
          },
          compromised: {
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: -1 }],
            factionRepDelta: [{ factionId: 'agu_renegades', delta: 1 }],
            narrativeLog:
              'The renegade team secures ammunition and radio relays, though numbers remain desperately thin.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'Doubts and paranoia fracture the team; two officers decide to hand in their badges and flee the province.',
          },
        },
      },
    ],
  },

  c7_provincial_police_hq: {
    id: 'c7_provincial_police_hq',
    title: 'Foreshore Police Headquarters',
    subtitle: 'Brutalist glass and concrete monolith overlooking Table Bay Harbour, home to General Swart’s inner sanctum',
    factionOwner: 'neutral',
    tier: 'civic_center',
    x: 78,
    y: 72,
    isUnlocked: false,
    connectedNodeIds: [
      'c2_manenberg_tenements',
      'c4_table_bay_container_berth',
      'c5_stellenbosch_wine_estate',
      'c6_agu_safehouse_ruin',
    ],
    actionSlots: [
      {
        id: 'slot_c7_breach_commissioner_office',
        title: 'Infiltrate General Swart’s Office',
        description: 'Use the load-shedding security blackout to access the top-floor executive safe.',
        stat: 'wire',
        isRepeatable: false,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 3 }],
            composureDelta: 20,
            narrativeLog:
              'You crack Swart’s terminal and extract The Grand Sovereign Protocol: complete unredacted blueprints of Operation Midnight Sun.',
          },
          compromised: {
            clockProgress: [{ clockId: 'red_cipher_decryption', delta: 2 }],
            composureDelta: -10,
            narrativeLog:
              'You secure the encrypted master files just as tactical response sirens begin wailing on the ground floor.',
          },
          failure: {
            composureDelta: -25,
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: 2 }],
            narrativeLog:
              'Swart’s personal guards ambush you in the executive corridor. You shoot your way into the emergency stairwell.',
          },
        },
      },
      {
        id: 'slot_c7_leak_prosecutors',
        title: 'Transmit Evidence to SIU & High Court',
        description: 'Send encrypted forensic packets to honest national prosecutors and news editors.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: -2 }],
            composureDelta: 15,
            narrativeLog:
              'National broadcasters lead with breaking reports: the Western Cape Provincial Commissioner is unmasked as an underworld arms kingpin.',
          },
          compromised: {
            clockProgress: [{ clockId: 'general_swart_manhunt', delta: -1 }],
            narrativeLog:
              'The docket is leaked to investigative journalists, placing Swart under immediate national scrutiny.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'Police state censors block the digital transmission before it leaves the local exchange.',
          },
        },
      },
    ],
  },
};

export const CAPE_CLOCKS: Record<string, Clock> = {
  gang_turf_war_clock: {
    id: 'gang_turf_war_clock',
    title: 'Cape Flats Turf War & Crossfire',
    description: 'Gang tension between the 28s and splinter factions threatens to trigger full-scale urban combat.',
    type: 'threat',
    current: 1,
    max: 6,
    advancesDaily: true,
    onCompleteEventId: 'evt_gang_war_escalation',
  },
  cape_doctor_gale_clock: {
    id: 'cape_doctor_gale_clock',
    title: 'The Cape Doctor Gales & Mist',
    description: 'Violent south-easterly gales and thick coastal sea-mist disrupt power lines and blind surveillance.',
    type: 'threat',
    current: 1,
    max: 6,
    advancesDaily: false,
    onCompleteEventId: 'evt_gale_force_blackout',
  },
  general_swart_manhunt: {
    id: 'general_swart_manhunt',
    title: 'General Swart’s AGU Purge',
    description: 'Unmarked police taskforce vans comb Cape Town streets to permanently eliminate Leila Hendricks.',
    type: 'threat',
    current: 1,
    max: 6,
    advancesDaily: true,
    onCompleteEventId: 'evt_swart_death_squad',
  },
  red_cipher_decryption: {
    id: 'red_cipher_decryption',
    title: 'Decrypt The Red Cipher',
    description: 'Synthesize the cryptographic key unmasking The Sovereign Octagon and their master plan.',
    type: 'action',
    current: 1,
    max: 6,
    advancesDaily: false,
    onCompleteEventId: 'evt_red_cipher_unlocked',
  },
  nightclub_extortion_clock: {
    id: 'nightclub_extortion_clock',
    title: 'Long Street Protection Racket',
    description: 'Dismantle the private bouncer extortion network financing shadow state operations.',
    type: 'action',
    current: 1,
    max: 4,
    advancesDaily: false,
    onCompleteEventId: 'evt_extortion_ring_smashed',
  },
  sovereign_arms_shipment: {
    id: 'sovereign_arms_shipment',
    title: 'Pier 109 Sovereign Arms Cargo',
    description: 'Countdown to the midnight offloading of 450 military assault rifles to arm a private army.',
    type: 'world',
    current: 1,
    max: 4,
    advancesDaily: true,
    onCompleteEventId: 'evt_climax_pier109',
  },
};

export const initialCapeGameState: GameState = {
  storyId: 'story_4_cape',
  act: 1,
  day: 1,
  cash: 850,
  composure: 85,
  loadSheddingStage: 2,
  stats: {
    street: 1,
    dockets: 2,
    wire: 1,
    influence: 0,
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
    long_street_racket: -1,
    cape_gang_federation: 0,
    winelands_club: 0,
    agu_renegades: 2,
    dockers_union: 1,
    // Story 5 factions
    united_hawks_taskforce: 0,
    the_sovereign_octagon: 0,
    constitutional_court_guard: 0,
    national_grid_command: 0,
    people_resistance_front: 0,
  },
  inventory: [
    'evidence_agu_ballistics_dossier',
    'gear_reinforced_agu_vest',
  ],
  dicePool: [
    { id: 'd1', value: 6, isUsed: false },
    { id: 'd2', value: 5, isUsed: false },
    { id: 'd3', value: 4, isUsed: false },
    { id: 'd4', value: 3, isUsed: false },
    { id: 'd5', value: 2, isUsed: false },
  ],
  clocks: CAPE_CLOCKS,
  nodes: CAPE_NODES,
  activeLog: [
    '02:15 SAST // Rain lashes the Victorian wrought-iron verandas of Long Street.',
    'Six months since your partner was murdered in an alley behind Hanover Park. The official docket called it a gang drive-by.',
    'Tonight, the ballistics report proves the hollow-point 9mm rounds were fired from Provincial Commissioner Swart’s personal weapon.',
  ],
  triggeredEventsQueue: [],
  activeEndingId: null,
  currentNodeId: 'c1_long_street_strip',
  generatorActiveToday: false,
  usedPerksToday: [],
  claimedDialogueRewards: [],
};
