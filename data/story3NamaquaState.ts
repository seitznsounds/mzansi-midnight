import { GameState, MapNode } from '../types/game';

export const NAMAQUA_NODES: Record<string, MapNode> = {
  d1_port_nolloth_jetty: {
    id: 'd1_port_nolloth_jetty',
    title: 'Port Nolloth Jetty & Salvage Berth',
    subtitle: 'Battered wooden slipways and rusted diamond-gravel barges facing the freezing Atlantic Benguela current',
    factionOwner: 'artisanal_divers',
    tier: 'street_west',
    x: 20,
    y: 80,
    isUnlocked: true,
    connectedNodeIds: ['d2_alexander_bay_quarry', 'd3_richtersveld_canyon', 'd7_springbok_magistrate'],
    actionSlots: [
      {
        id: 'slot_d1_dive_survey',
        title: 'Analyze Offshore Sonar Bathymetry',
        description:
          'Cross-reference multi-beam acoustic seabed charts with illegal diamond dredge trenches cutting through maritime concession lines.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        requiredItem: 'evidence_sonar_bathymetry_log',
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            composureDelta: 10,
            unlockNodeIds: ['d2_alexander_bay_quarry', 'd3_richtersveld_canyon'],
            narrativeLog:
              'The bathymetric contours reveal a hidden submarine canyon dredged by an unflagged contractor barge. The suction scars lead straight to Alexander Bay.',
          },
          compromised: {
            clockProgress: [
              { clockId: 'admiralty_investigation', delta: 1 },
              { clockId: 'aegis_naval_patrol', delta: 1 },
            ],
            unlockNodeIds: ['d2_alexander_bay_quarry'],
            narrativeLog:
              'You map the illegal gravel corridor, but your acoustic ping is logged by an Aegis coastal patrol hydrophone off Robbebaai.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: 2 }],
            narrativeLog:
              'Corrupted sonar data and salt-encrusted transponders stall your readout. An armed Aegis zodiac cruises past the harbor wall.',
          },
        },
      },
      {
        id: 'slot_d1_gear_shop',
        title: 'Procure Titanium Diver’s Blade',
        description:
          'Purchase a heavy serrated titanium dive knife and kelp cutter from Tannie Bettie’s fish processing store.',
        stat: 'any',
        isRepeatable: true,
        isCompleted: false,
        costCash: 450,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_diver_knife',
            narrativeLog:
              'Tannie Bettie wraps a weighted titanium blade in oiled canvas. "Saltwater eats everything out here, Giepie. Except this steel."',
          },
          compromised: {
            addInventoryItem: 'gear_diver_knife',
            narrativeLog:
              'You buy the blade, but Bettie warns you that Aegis mercenaries were asking about your bakkie this morning.',
          },
          failure: {
            narrativeLog:
              'The shopkeeper refuses your cash until Bettie vouches for you. You leave empty-handed for now.',
          },
        },
      },
      {
        id: 'slot_d1_rest',
        title: 'Rest in Converted Shipping Container',
        description:
          'Stoke the paraffin heater, dry your neoprene wetsuit, and listen to the cold Benguela breakers pounding the breakwater.',
        stat: 'any',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            composureDelta: 20,
            narrativeLog:
              'Strong rooibos tea, dry wool blankets, and the rhythm of the Atlantic swells steady your racing pulse.',
          },
          compromised: {
            composureDelta: 10,
            narrativeLog:
              'The biting coastal wind rattles the corrugated iron roof, but you snatch two hours of fitful sleep.',
          },
          failure: {
            composureDelta: 5,
            narrativeLog:
              'Freezing condensation drips from the iron ceiling. The phantom hiss of a regulator keeps you awake.',
          },
        },
      },
    ],
  },

  d2_alexander_bay_quarry: {
    id: 'd2_alexander_bay_quarry',
    title: 'Alexander Bay Gravel Tailings',
    subtitle: 'High-security diamond perimeter fenced with razor wire along the churning Atlantic surfline',
    factionOwner: 'artisanal_divers',
    tier: 'street_west',
    x: 16,
    y: 52,
    isUnlocked: false,
    connectedNodeIds: ['d1_port_nolloth_jetty', 'd5_orange_river_pont', 'd6_aegis_coastal_compound'],
    actionSlots: [
      {
        id: 'slot_d2_gravel_dive',
        title: 'Seabed Gravel Suction Dive',
        description:
          'Drop thirty meters down through freezing kelp forests with an artisanal gravel suction hose to recover uncertified gravel parcels.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            addInventoryItem: 'evidence_namaqua_diamond_parcel',
            composureDelta: 15,
            unlockNodeIds: ['d5_orange_river_pont', 'd6_aegis_coastal_compound'],
            narrativeLog:
              'In the pitch-black ocean surge, you guide the dredge pipe across a gravel fissure and surface with an oilskin pouch of raw octahedral diamonds.',
          },
          compromised: {
            clockProgress: [
              { clockId: 'admiralty_investigation', delta: 1 },
              { clockId: 'diver_bends_hazard', delta: 2 },
            ],
            addInventoryItem: 'evidence_namaqua_diamond_parcel',
            unlockNodeIds: ['d5_orange_river_pont'],
            narrativeLog:
              'Surge waves batter you against the submerged reef. You surface with the diamond pouch, but nitrogen tingling throbs in your joints.',
          },
          failure: {
            composureDelta: -20,
            clockProgress: [{ clockId: 'diver_bends_hazard', delta: 3 }],
            narrativeLog:
              'The suction hose kicks violently in the underwater undertow, ripping your mask loose. You emergency-ascend coughing salt water.',
          },
        },
      },
      {
        id: 'slot_d2_diver_strike',
        title: 'Rally Artisanal Shore Divers',
        description:
          'Mobilize the local shore divers and suction bakkies to push back against private maritime security incursions.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: -1 }],
            factionRepDelta: [{ factionId: 'artisanal_divers', delta: 1 }],
            composureDelta: 10,
            narrativeLog:
              'The shore divers block the coastal slipway with tractor tires and flare guns, forcing an Aegis surveillance skiff to turn back.',
          },
          compromised: {
            factionRepDelta: [{ factionId: 'artisanal_divers', delta: 1 }],
            narrativeLog:
              'The divers agree to watch the beaches, but demand fuel compensation for their bakkies.',
          },
          failure: {
            composureDelta: -10,
            factionRepDelta: [{ factionId: 'artisanal_divers', delta: -1 }],
            narrativeLog:
              'Fear of mercenary reprisal splinters the meeting. Several divers walk out into the fog.',
          },
        },
      },
    ],
  },

  d3_richtersveld_canyon: {
    id: 'd3_richtersveld_canyon',
    title: 'Richtersveld Moon Rock Canyon',
    subtitle: 'Ancient desert gorges of scorched quartz, petroglyphs, and hidden Kalahari runner fuel caches',
    factionOwner: 'kalahari_runners',
    tier: 'civic_center',
    x: 48,
    y: 68,
    isUnlocked: false,
    connectedNodeIds: ['d1_port_nolloth_jetty', 'd4_debeers_ghost_mine', 'd5_orange_river_pont'],
    actionSlots: [
      {
        id: 'slot_d3_runner_routes',
        title: 'Map Desert Smuggler Corridors',
        description:
          'Consult Swartbooi Witbooi on the dry wash routes used to move high-value stones past military roadblocks.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            unlockNodeIds: ['d4_debeers_ghost_mine', 'd5_orange_river_pont'],
            factionRepDelta: [{ factionId: 'kalahari_runners', delta: 2 }],
            composureDelta: 10,
            narrativeLog:
              'Swartbooi draws the dry kokerboom riverbeds in the red dust. "The military watches the tar road, Giepie. The desert belongs to those who carry their own water."',
          },
          compromised: {
            unlockNodeIds: ['d4_debeers_ghost_mine'],
            clockProgress: [{ clockId: 'desert_heat_exhaustion', delta: 1 }],
            factionRepDelta: [{ factionId: 'kalahari_runners', delta: 1 }],
            narrativeLog:
              'You get the coordinates for the ghost mine, but navigating the scorching sun-baked pass takes a brutal toll on your engine.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'desert_heat_exhaustion', delta: 2 }],
            narrativeLog:
              'Your bakkie’s radiator boils over near an abandoned prospector shack. You lose hours waiting for the block to cool.',
          },
        },
      },
      {
        id: 'slot_d3_buy_sand_tracks',
        title: 'Acquire Dune Recovery Ladders',
        description:
          'Buy heavy aluminum sand tracks and tire deflation gauges from the Kalahari runner depot.',
        stat: 'any',
        isRepeatable: true,
        isCompleted: false,
        costCash: 550,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_sand_tracks',
            narrativeLog:
              'The sand tracks are strapped securely to your bakkie’s roll-cage. Dune traversing will be much safer.',
          },
          compromised: {
            addInventoryItem: 'gear_sand_tracks',
            narrativeLog:
              'You secure the recovery gear, though the runner charges an extra fifty rands for replacement brackets.',
          },
          failure: {
            narrativeLog:
              'The runner refuses to barter while military drones are circling the canyon.',
          },
        },
      },
      {
        id: 'slot_d3_cache_fuel',
        title: 'Stash Emergency Fuel Jerrycans',
        description:
          'Hide 50 liters of high-octane diesel in a shaded rock cleft beneath the granite boulders.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 150,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'desert_heat_exhaustion', delta: -2 }],
            composureDelta: 10,
            narrativeLog:
              'Two military jerrycans of diesel are camouflaged under dry acacia branches. Your retreat line is secure.',
          },
          compromised: {
            clockProgress: [{ clockId: 'desert_heat_exhaustion', delta: -1 }],
            narrativeLog:
              'You bury the fuel cans, though the smell of diesel might attract roaming desert scavengers.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'A cracked siphon pipe spills five liters onto the sand before you can seal the can.',
          },
        },
      },
    ],
  },

  d4_debeers_ghost_mine: {
    id: 'd4_debeers_ghost_mine',
    title: 'De Beers Ghost Mine (Concession 4B)',
    subtitle: 'Abandoned 1930s diamond sorting plant swallowed by drifting red dunes and rusted corrugated steel',
    factionOwner: 'neutral',
    tier: 'civic_center',
    x: 50,
    y: 26,
    isUnlocked: false,
    connectedNodeIds: ['d3_richtersveld_canyon', 'd5_orange_river_pont', 'd6_aegis_coastal_compound'],
    actionSlots: [
      {
        id: 'slot_d4_sorting_vault',
        title: 'Search Subterranean Sorting Vault',
        description:
          'Pick the reinforced brass lock of the old sorting house to inspect illicit diamond sorting tables.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            addInventoryItem: 'evidence_namaqua_diamond_parcel',
            composureDelta: 15,
            unlockNodeIds: ['d6_aegis_coastal_compound'],
            narrativeLog:
              'Under thick layers of desert dust, you discover modern LED loupes, precision digital scales, and an unsealed parcel of rough gems ready for shipping.',
          },
          compromised: {
            clockProgress: [
              { clockId: 'admiralty_investigation', delta: 1 },
              { clockId: 'aegis_naval_patrol', delta: 1 },
            ],
            unlockNodeIds: ['d6_aegis_coastal_compound'],
            narrativeLog:
              'You secure the ledger and stone samples, but a tripped infrared tripwire transmits an intruder alert to Aegis Command.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'desert_heat_exhaustion', delta: 1 }],
            narrativeLog:
              'A rotten floorboard collapses under your boot. You drop three meters into a sand-choked tailings hopper.',
          },
        },
      },
      {
        id: 'slot_d4_concession_audit',
        title: 'Audit Oom Dirk’s Historical Deeds',
        description:
          'Examine the original 1968 sea-concession permits held by old Dirk Coetzee to trace the paper trail.',
        stat: 'wire',
        isRepeatable: false,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            factionRepDelta: [{ factionId: 'namib_syndicate', delta: 1 }],
            narrativeLog:
              'Dirk’s faded deeds reveal that Concession 4B’s offshore rights were illegally signed over to an Aegis front company registered in Windhoek.',
          },
          compromised: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 1 }],
            narrativeLog:
              'Oom Dirk confirms the fraudulent transfer, but demands a cut of whatever compensation the state eventually recovers.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'The papers are so brittle from sixty years of dry desert air that several critical annexures crumble in your hands.',
          },
        },
      },
    ],
  },

  d5_orange_river_pont: {
    id: 'd5_orange_river_pont',
    title: 'Orange River Border Drift & Pont',
    subtitle: 'The reed-fringed muddy border separating South Africa and Namibia under the silent desert stars',
    factionOwner: 'namib_syndicate',
    tier: 'waterfront_east',
    x: 80,
    y: 24,
    isUnlocked: false,
    connectedNodeIds: ['d2_alexander_bay_quarry', 'd3_richtersveld_canyon', 'd4_debeers_ghost_mine', 'd6_aegis_coastal_compound'],
    actionSlots: [
      {
        id: 'slot_d5_intercept_arms_pont',
        title: 'Surveil Mercenary River Crossing',
        description:
          'Track the midnight pontoon boat ferrying unmarked military crate shipments across the river shallows.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            addInventoryItem: 'evidence_aegis_arms_bill',
            unlockNodeIds: ['d6_aegis_coastal_compound', 'd7_springbok_magistrate'],
            narrativeLog:
              'Using thermal optics from the river reedbed, you photograph crates of Galil rifles and radar transmitters stamped with Aegis serial codes.',
          },
          compromised: {
            clockProgress: [
              { clockId: 'admiralty_investigation', delta: 1 },
              { clockId: 'orange_river_arms_drop', delta: 1 },
            ],
            addInventoryItem: 'evidence_aegis_arms_bill',
            unlockNodeIds: ['d6_aegis_coastal_compound'],
            narrativeLog:
              'You snatch the manifest copy from an unattended ammo crate, but an armed Namibian mercenary spots your flashlight glare.',
          },
          failure: {
            composureDelta: -20,
            clockProgress: [{ clockId: 'orange_river_arms_drop', delta: 2 }],
            narrativeLog:
              'An outboard motor roars into life. A spotlight sweeps across the reeds, forcing you to dive headfirst into the muddy riverbank.',
          },
        },
      },
      {
        id: 'slot_d5_buy_compass',
        title: 'Procure Iridium Satellite Compass',
        description:
          'Buy a ruggedized differential GPS and satellite compass from trans-border Namibian smugglers.',
        stat: 'any',
        isRepeatable: true,
        isCompleted: false,
        costCash: 750,
        outcomes: {
          clean: {
            addInventoryItem: 'gear_satellite_compass',
            narrativeLog:
              'The smuggler powers up the Iridium handset. "Lock onto 60 satellites, mate. The Malmokken fog can’t touch you now."',
          },
          compromised: {
            addInventoryItem: 'gear_satellite_compass',
            narrativeLog:
              'The unit works, but you have to pay with crisp two-hundred rand notes to settle the smuggler’s border fee.',
          },
          failure: {
            narrativeLog:
              'The border post spotlights suddenly power on. The smugglers scatter into the saltbush before you can make the trade.',
          },
        },
      },
      {
        id: 'slot_d5_cross_border_wire',
        title: 'Tap Trans-Namib Radio Relay',
        description:
          'Splice into the microwave radio mast connecting Alexander Bay to the diamond trading desks in Windhoek.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            cashDelta: 500,
            factionRepDelta: [{ factionId: 'namib_syndicate', delta: 1 }],
            narrativeLog:
              'You intercept wire transfer confirmation codes for an impending diamond shipment and siphon a broker kickback.',
          },
          compromised: {
            cashDelta: 250,
            narrativeLog:
              'You extract wire routing codes, but the line experiences heavy static from atmospheric ionization.',
          },
          failure: {
            composureDelta: -10,
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: 1 }],
            narrativeLog:
              'The radio tap trips a high-frequency carrier alarm. The relay station automatically shifts to encrypted frequency.',
          },
        },
      },
    ],
  },

  d6_aegis_coastal_compound: {
    id: 'd6_aegis_coastal_compound',
    title: 'Aegis-Atlantis Marine Base',
    subtitle: 'Fortified coastal bunker complex, rotating radar domes, and gunboat mooring berths along the Benguela surf',
    factionOwner: 'aegis_marine',
    tier: 'waterfront_east',
    x: 20,
    y: 22,
    isUnlocked: false,
    connectedNodeIds: ['d2_alexander_bay_quarry', 'd4_debeers_ghost_mine', 'd5_orange_river_pont', 'd7_springbok_magistrate'],
    actionSlots: [
      {
        id: 'slot_d6_infiltrate_radar',
        title: 'Infiltrate Tactical Radar Center',
        description:
          'Slip through the compound perimeter during a fog surge and extract the coastal surveillance logs and arms consignments.',
        stat: 'wire',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            addInventoryItem: 'evidence_aegis_arms_bill',
            unlockNodeIds: ['d7_springbok_magistrate'],
            composureDelta: 15,
            narrativeLog:
              'Inside the refrigerated server room, you download Colonel Petrov’s master logistics logs: four cargo containers of weapons are loaded for Table Bay Harbour.',
          },
          compromised: {
            clockProgress: [
              { clockId: 'admiralty_investigation', delta: 1 },
              { clockId: 'aegis_naval_patrol', delta: 2 },
            ],
            unlockNodeIds: ['d7_springbok_magistrate'],
            narrativeLog:
              'You copy the radar telemetry, but guards notice the breached server rack. Klaxons echo through the compound.',
          },
          failure: {
            composureDelta: -25,
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: 2 }],
            narrativeLog:
              'Trained guard dogs corner you near the fuel depot. You leap into the icy surf to escape rifle fire.',
          },
        },
      },
      {
        id: 'slot_d6_sabotage_gunboats',
        title: 'Sabotage Interceptor Gunboats',
        description:
          'Pour sugar and abrasive sand into the twin turbochargers of Aegis-Atlantis high-speed assault vessels.',
        stat: 'street',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: -2 }],
            factionRepDelta: [{ factionId: 'aegis_marine', delta: -2 }],
            composureDelta: 10,
            narrativeLog:
              'Both 900-horsepower Caterpillar diesels seize on startup with a grinding shriek of shattered valves. The patrol flotilla is crippled.',
          },
          compromised: {
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: -1 }],
            narrativeLog:
              'You disable the lead patrol craft, but mercenary guards double the perimeter watch.',
          },
          failure: {
            composureDelta: -15,
            clockProgress: [{ clockId: 'aegis_naval_patrol', delta: 1 }],
            narrativeLog:
              'A roving guard catches your silhouette near the dock cranes. You abandon your gear and flee under the jetty.',
          },
        },
      },
    ],
  },

  d7_springbok_magistrate: {
    id: 'd7_springbok_magistrate',
    title: 'Springbok District Court & Impound Yard',
    subtitle: 'Granite colonial courthouse and Sea Fisheries impound yard inland among the ancient copper hills',
    factionOwner: 'namaqua_command',
    tier: 'civic_center',
    x: 80,
    y: 76,
    isUnlocked: false,
    connectedNodeIds: ['d1_port_nolloth_jetty', 'd6_aegis_coastal_compound'],
    actionSlots: [
      {
        id: 'slot_d7_file_admiralty_injunction',
        title: 'File High Court Admiralty Seizure',
        description:
          'Submit the dredged diamond evidence and mercenary cargo logs to Captain Cloete to obtain an emergency maritime arrest warrant.',
        stat: 'dockets',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        requiredItem: 'evidence_aegis_arms_bill',
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 2 }],
            factionRepDelta: [{ factionId: 'namaqua_command', delta: 2 }],
            composureDelta: 20,
            narrativeLog:
              'Captain Cloete signs the emergency High Court Admiralty writ. State patrol vessels and naval divers are authorized to seize the arms transport.',
          },
          compromised: {
            clockProgress: [{ clockId: 'admiralty_investigation', delta: 1 }],
            factionRepDelta: [{ factionId: 'namaqua_command', delta: 1 }],
            narrativeLog:
              'The warrant is issued, but corrupt clerks in the magistrate’s office leak the filing to Aegis defense counsel.',
          },
          failure: {
            composureDelta: -15,
            factionRepDelta: [{ factionId: 'namaqua_command', delta: -1 }],
            narrativeLog:
              'A bureaucratic jurisdictional dispute between provincial police and maritime authorities delays the hearing.',
          },
        },
      },
      {
        id: 'slot_d7_raid_impound_yard',
        title: 'Requisition Impounded Marine Dive Rig',
        description:
          'Use Captain Cloete’s authority to retrieve impounded commercial diving rebreathers and compressor spares.',
        stat: 'influence',
        isRepeatable: true,
        isCompleted: false,
        costCash: 0,
        outcomes: {
          clean: {
            clockProgress: [{ clockId: 'diver_bends_hazard', delta: -2 }],
            cashDelta: 300,
            composureDelta: 15,
            narrativeLog:
              'You secure a state-of-the-art oxygen deco kit and helium mix tanks from the fisheries lockup.',
          },
          compromised: {
            clockProgress: [{ clockId: 'diver_bends_hazard', delta: -1 }],
            narrativeLog:
              'You obtain the decompression tables and medical oxygen, though signing the logbook leaves a formal trail.',
          },
          failure: {
            composureDelta: -10,
            narrativeLog:
              'The impound sergeant is on leave and the replacement officer refuses access without Pretoria stamps.',
          },
        },
      },
    ],
  },
};

export const initialNamaquaGameState: GameState = {
  storyId: 'story_3_namaqua',
  act: 1,
  day: 1,
  cash: 750,
  composure: 85,
  loadSheddingStage: 2,
  stats: {
    street: 2,
    dockets: 1,
    wire: 0,
    influence: -1,
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
    aegis_marine: -1,
    artisanal_divers: 2,
    kalahari_runners: 1,
    namaqua_command: 0,
    namib_syndicate: 0,
    // Story 4 factions
    long_street_racket: 0,
    cape_gang_federation: 0,
    winelands_club: 0,
    agu_renegades: 0,
    dockers_union: 0,
    // Story 5 factions
    united_hawks_taskforce: 0,
    the_sovereign_octagon: 0,
    constitutional_court_guard: 0,
    national_grid_command: 0,
    people_resistance_front: 0,
  },
  inventory: ['evidence_sonar_bathymetry_log', 'gear_diver_knife'],
  dicePool: [
    { id: 'd1', value: 6, isUsed: false },
    { id: 'd2', value: 5, isUsed: false },
    { id: 'd3', value: 4, isUsed: false },
    { id: 'd4', value: 3, isUsed: false },
    { id: 'd5', value: 2, isUsed: false },
  ],
  clocks: {
    malmokken_fog: {
      id: 'malmokken_fog',
      title: 'Atlantic Malmokken Fog',
      description: 'Dense coastal sea-mist rolling off the cold Benguela current provides cover but blinds navigation.',
      type: 'world',
      current: 2,
      max: 6,
      advancesDaily: true,
      onCompleteEventId: 'evt_namaqua_malmokken_storm',
    },
    aegis_naval_patrol: {
      id: 'aegis_naval_patrol',
      title: 'Aegis Naval Gunboat Patrols',
      description: 'Armored interceptor gunboats sweep the surfline with thermal radar looking for illicit divers.',
      type: 'threat',
      current: 1,
      max: 6,
      advancesDaily: true,
      onCompleteEventId: 'evt_namaqua_naval_intercept',
    },
    desert_heat_exhaustion: {
      id: 'desert_heat_exhaustion',
      title: 'Richtersveld Radiator & Heat Hazard',
      description: 'Blistering 46°C canyon heat and radiator overheating in the deep desert dunes.',
      type: 'threat',
      current: 0,
      max: 4,
      advancesDaily: false,
      onCompleteEventId: 'evt_namaqua_heat_exhaustion',
    },
    admiralty_investigation: {
      id: 'admiralty_investigation',
      title: 'Table Bay Admiralty Investigation',
      description: 'Tracing the offshore diamond-for-arms cargo destined for Cape Town Table Bay.',
      type: 'action',
      current: 0,
      max: 6,
      advancesDaily: false,
      onCompleteEventId: 'evt_namaqua_climax_admiralty',
    },
    diver_bends_hazard: {
      id: 'diver_bends_hazard',
      title: 'Diver Decompression & Bends Hazard',
      description: 'Nitrogen buildup from deep gravel suction dives along the treacherous Atlantic shelf.',
      type: 'threat',
      current: 0,
      max: 6,
      advancesDaily: false,
      onCompleteEventId: 'evt_namaqua_diver_embolism',
    },
    orange_river_arms_drop: {
      id: 'orange_river_arms_drop',
      title: 'Orange River Arms Drop Countdown',
      description: 'Aegis cargo flights from Walvis Bay preparing midnight parachute drops at the border pont.',
      type: 'threat',
      current: 1,
      max: 4,
      advancesDaily: true,
      onCompleteEventId: 'evt_namaqua_climax_arms_drop',
    },
  },
  nodes: NAMAQUA_NODES,
  activeLog: [
    '02:30 SAST // The cold Atlantic Malmokken fog rolls heavy over the Port Nolloth breakwater.',
    'Captain Gideon "Giepie" Brand inspects his dive gauges. The Project Midas ledger from Johannesburg confirms the diamond laundering pipeline.',
    'Seabed dredge concessions are being used to arm mercenaries bound for Cape Town.',
  ],
  triggeredEventsQueue: [],
  activeEndingId: null,
  currentNodeId: 'd1_port_nolloth_jetty',
  generatorActiveToday: false,
  usedPerksToday: [],
  claimedDialogueRewards: [],
};
