import { GameState } from '../types/game';

export const initialGameState: GameState = {
  storyId: 'story_1_ethekwini',
  day: 1,
  cash: 650, // Starting with R650
  composure: 85, // Starts at 85% (5 action dice)
  loadSheddingStage: 4,
  stats: {
    dockets: 2,   // Former Hawks investigator strength
    influence: 1,
    street: 0,
    wire: -1,     // Tech weak spot
  },
  factionRep: {
    abasanta: 0,
    city_hall: 0,
    saps_trt: -1, // Suspended by Brigadier Mokoena
    street_syndicate: 0,
    hawks: 1,
    megawatt_cartel: 0,
    sandton_arbitrage: 0,
    reef_zamazamas: 0,
    siu_clean_hands: 0,
    red_guard_populists: 0,
    aegis_marine: 0,
    artisanal_divers: 0,
    kalahari_runners: 0,
    namaqua_command: 0,
    namib_syndicate: 0,
    long_street_racket: 0,
    cape_gang_federation: 0,
    winelands_club: 0,
    agu_renegades: 0,
    dockers_union: 0,
    // Story 5: The Sovereign Octagon
    united_hawks_taskforce: 0,
    the_sovereign_octagon: 0,
    constitutional_court_guard: 0,
    national_grid_command: 0,
    people_resistance_front: 0,
  },
  inventory: ['docket_409_raw', 'auditor_encrypted_phone'],
  dicePool: [
    { id: 'd1', value: 6, isUsed: false },
    { id: 'd2', value: 4, isUsed: false },
    { id: 'd3', value: 3, isUsed: false },
    { id: 'd4', value: 2, isUsed: false },
    { id: 'd5', value: 5, isUsed: false },
  ],
  clocks: {
    mokoena_sweep: {
      id: 'mokoena_sweep',
      title: "Brigadier Mokoena's Sweep",
      description: 'TRT patrols are combing the CBD for Constable Nandi.',
      type: 'threat',
      current: 1,
      max: 6,
      advancesDaily: true,
      onCompleteEventId: 'evt_trt_safehouse_raid',
    },
    nandi_condition: {
      id: 'nandi_condition',
      title: "Nandi's Gunshot Wound",
      description: 'She needs off-the-books trauma surgery before infection sets in.',
      type: 'threat',
      current: 1,
      max: 4,
      advancesDaily: true,
      onCompleteEventId: 'evt_nandi_critical',
    },
    precinct_heat: {
      id: 'precinct_heat',
      title: 'Precinct Heat',
      description: 'SAPS informants and CCTV hits tracking your movements.',
      type: 'threat',
      current: 0,
      max: 6,
      advancesDaily: false,
      onCompleteEventId: 'evt_shanela_roadblock',
    },
    audit_docket_409: {
      id: 'audit_docket_409',
      title: 'Audit Docket #409',
      description: 'Trace the R400m water-tanker invoices to their shell company.',
      type: 'action',
      current: 0,
      max: 4,
      advancesDaily: false,
      onCompleteEventId: 'evt_docket_decoded',
    },
    crack_auditor_phone: {
      id: 'crack_auditor_phone',
      title: "Crack Auditor's Handset",
      description: 'Bypass biometric encryption at Golden Dragon Cyber-Pawn.',
      type: 'action',
      current: 0,
      max: 4,
      advancesDaily: false,
      onCompleteEventId: 'evt_phone_decrypted',
    },
    berth_14_countdown: {
      id: 'berth_14_countdown',
      title: 'Berth 14 Precursor Convoy',
      description: 'Days until Zuko’s shipment rolls out of Pier 2 (Act 1 Climax).',
      type: 'world',
      current: 0,
      max: 4,
      advancesDaily: true,
      onCompleteEventId: 'evt_climax_berth14',
    },
  },
  nodes: {
    // ----------------------------------------------------
    // NODE 1: MERCURY ARCADE FLAT (PLAYER SAFEHOUSE)
    // ----------------------------------------------------
    n1_safehouse: {
      id: 'n1_safehouse',
      title: 'Mercury Arcade Flat',
      subtitle: 'Player Safehouse • CBD Central',
      factionOwner: 'neutral',
      tier: 'civic_center',
      x: 50,
      y: 55,
      isUnlocked: true,
      connectedNodeIds: ['n2_taxi_rank', 'n3_central_precinct', 'n5_cyber_pawn'],
      actionSlots: [
        {
          id: 'act_audit_docket',
          title: 'Cross-Reference Docket #409',
          description: 'Match bloodstained tanker invoices against the municipal registry.',
          stat: 'dockets',
          isRepeatable: true,
          isCompleted: false,
          requiredItem: 'docket_409_raw',
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'audit_docket_409', delta: 2 }],
              unlockNodeIds: ['n4_city_hall', 'n6_pier2_port'],
              narrativeLog: 'You trace the payments straight to Zululand Aqua-Logistics and Pier 2.',
            },
            compromised: {
              clockProgress: [{ clockId: 'audit_docket_409', delta: 1 }],
              composureDelta: -5,
              narrativeLog: 'Hours of eye strain under a flickering inverter bulb yield one shell director name.',
            },
            failure: {
              composureDelta: -10,
              narrativeLog: 'The ledger codes are a maze of dead ends. Your head is pounding.',
            },
          },
        },
        {
          id: 'act_rest_safehouse',
          title: 'Rest & Patch Up Nandi',
          description: 'Recover Composure. Buy medical gauze to stall Nandi’s wound clock.',
          stat: 'any',
          isRepeatable: true,
          isCompleted: false,
          costCash: 300,
          outcomes: {
            clean: {
              composureDelta: 25,
              clockProgress: [{ clockId: 'nandi_condition', delta: -1 }],
              narrativeLog: 'You clean her bandages and rest. Nandi’s fever breaks slightly.',
            },
            compromised: {
              composureDelta: 15,
              narrativeLog: 'Rest is interrupted by police sirens echoing down Queen Street.',
            },
            failure: {
              composureDelta: 5,
              narrativeLog: 'Restless sleep full of nightmares about Mokoena’s TRT squads.',
            },
          },
        },
        {
          id: 'act_call_maharaj',
          title: 'Call Dr. Maharaj (Off-the-Books Surgeon)',
          description: 'Bring in a private trauma surgeon to extract the bullet and stabilize Nandi.',
          stat: 'influence',
          isRepeatable: false,
          isCompleted: false,
          costCash: 1500,
          outcomes: {
            clean: {
              composureDelta: 15,
              clockProgress: [{ clockId: 'nandi_condition', delta: -4 }],
              narrativeLog: 'Dr. Maharaj extracts the bullet fragment cleanly. Nandi is out of danger.',
            },
            compromised: {
              composureDelta: 5,
              clockProgress: [{ clockId: 'nandi_condition', delta: -3 }],
              narrativeLog: 'The surgery is rough under flashlight beams, but Nandi’s vitals stabilize.',
            },
            failure: {
              composureDelta: -10,
              clockProgress: [{ clockId: 'nandi_condition', delta: -1 }],
              narrativeLog: 'Dr. Maharaj gets spooked by a patrol van outside and only leaves antibiotics.',
            },
          },
        },
      ],
    },

    // ----------------------------------------------------
    // NODE 2: QUEEN STREET TAXI RANK
    // ----------------------------------------------------
    n2_taxi_rank: {
      id: 'n2_taxi_rank',
      title: 'Queen Street Taxi Rank',
      subtitle: 'Bra Bheki • Street Syndicate Turf',
      factionOwner: 'street_syndicate',
      tier: 'street_west',
      x: 20,
      y: 55,
      isUnlocked: true,
      connectedNodeIds: ['n1_safehouse', 'n4_city_hall', 'n6_pier2_port'],
      actionSlots: [
        {
          id: 'act_rank_muscle',
          title: 'Enforce Route Tariffs',
          description: 'Shake down pirate operators along the Umgeni corridor for Bra Bheki.',
          stat: 'street',
          isRepeatable: true,
          isCompleted: false,
          outcomes: {
            clean: {
              cashDelta: 1200,
              factionRepDelta: [{ factionId: 'street_syndicate', delta: 1 }],
              narrativeLog: 'Pirate drivers pay up without drawing weapons. Bra Bheki nods in respect.',
            },
            compromised: {
              cashDelta: 800,
              composureDelta: -10,
              narrativeLog: 'A wrench catches your shoulder in the scuffle, but you walk away with cash.',
            },
            failure: {
              cashDelta: 300,
              composureDelta: -20,
              clockProgress: [{ clockId: 'precinct_heat', delta: 1 }],
              narrativeLog: 'Shots fired near the rank entrance. Metro police sirens wail in the distance.',
            },
          },
        },
        {
          id: 'act_taxi_intel',
          title: 'Tap the Driver Network',
          description: 'Pay rank marshals to track unmarked TRT bakkies and roadblocks.',
          stat: 'influence',
          isRepeatable: true,
          isCompleted: false,
          costCash: 400,
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -2 }],
              factionRepDelta: [{ factionId: 'street_syndicate', delta: 1 }],
              narrativeLog: 'Taxi drivers blanket the radio channels with Mokoena’s exact patrol routes.',
            },
            compromised: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -1 }],
              narrativeLog: 'Scattered intel from drivers who only saw half the convoy.',
            },
            failure: {
              composureDelta: -5,
              narrativeLog: 'You pay for intel that turns out to be useless tavern gossip.',
            },
          },
        },
      ],
    },

    // ----------------------------------------------------
    // NODE 3: CENTRAL PRECINCT (13TH FLOOR)
    // ----------------------------------------------------
    n3_central_precinct: {
      id: 'n3_central_precinct',
      title: 'Central Precinct (13th Fl)',
      subtitle: 'Brigadier Mokoena • Corrupt SAPS',
      factionOwner: 'saps_trt',
      tier: 'civic_center',
      x: 50,
      y: 20,
      isUnlocked: true,
      connectedNodeIds: ['n4_city_hall', 'n1_safehouse', 'n7_archive_basement'],
      actionSlots: [
        {
          id: 'act_bribe_clerk',
          title: 'Bribe the Evidence Clerk',
          description: 'Slip a corrupt warrant officer cash to pull ballistic reports from the N2 heist.',
          stat: 'influence',
          isRepeatable: true,
          isCompleted: false,
          costCash: 600,
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'precinct_heat', delta: -2 }],
              factionRepDelta: [{ factionId: 'saps_trt', delta: 1 }],
              narrativeLog: 'The clerk slides ballistic matching files across the precinct canteen table.',
            },
            compromised: {
              clockProgress: [{ clockId: 'precinct_heat', delta: -1 }],
              narrativeLog: 'You get partial incident logs before internal affairs walks past.',
            },
            failure: {
              clockProgress: [{ clockId: 'precinct_heat', delta: 2 }],
              composureDelta: -10,
              narrativeLog: 'The clerk takes your cash and reports you to Mokoena’s duty sergeant.',
            },
          },
        },
        {
          id: 'act_bluff_mokoena',
          title: 'Walk Into Mokoena’s Office',
          description: 'Bluff your former commander face-to-face about why Nandi is on the BOLO list.',
          stat: 'influence',
          isRepeatable: false,
          isCompleted: false,
          outcomes: {
            clean: {
              cashDelta: 3000,
              factionRepDelta: [
                { factionId: 'saps_trt', delta: 1 },
                { factionId: 'hawks', delta: -1 },
              ],
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -2 }],
              narrativeLog: 'Mokoena buys your cover story and advances you R3,000 retainer to bring him Docket #409.',
            },
            compromised: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -1 }],
              composureDelta: -15,
              narrativeLog: 'Mokoena stares you down across his mahogany desk. You buy yourself 24 hours.',
            },
            failure: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: 2 }],
              composureDelta: -20,
              narrativeLog: 'Mokoena smells a rat immediately. TRT officers escort you out at gunpoint.',
            },
          },
        },
      ],
    },

    // ----------------------------------------------------
    // NODE 4: CITY HALL ANNEX (LOCKED INITIALLY)
    // ----------------------------------------------------
    n4_city_hall: {
      id: 'n4_city_hall',
      title: 'City Hall Annex & Tenders',
      subtitle: 'Ma-Sibi Coalition • Tender Mafia',
      factionOwner: 'city_hall',
      tier: 'street_west',
      x: 22,
      y: 20,
      isUnlocked: false, // Unlocked via Docket audit
      connectedNodeIds: ['n2_taxi_rank', 'n3_central_precinct'],
      actionSlots: [
        {
          id: 'act_audit_tenders',
          title: 'Infiltrate Municipal Registry',
          description: 'Pose as a compliance officer to trace Zululand Aqua-Logistics shell accounts.',
          stat: 'dockets',
          isRepeatable: false,
          isCompleted: false,
          disabledDuringStage6: true, // Servers offline during blackouts
          outcomes: {
            clean: {
              factionRepDelta: [{ factionId: 'city_hall', delta: -1 }],
              cashDelta: 5000,
              narrativeLog: 'You extract signed copies of Ma-Sibi’s emergency tanker embezzlement scheme.',
            },
            compromised: {
              cashDelta: 2500,
              composureDelta: -10,
              narrativeLog: 'Security almost catches you in the registry archive, but you escape with key receipts.',
            },
            failure: {
              clockProgress: [{ clockId: 'precinct_heat', delta: 2 }],
              composureDelta: -15,
              narrativeLog: 'Alarms trigger on the 4th floor. You flee empty-handed.',
            },
          },
        },
        {
          id: 'act_masibi_deal',
          title: "Pitch a Deal to Ma-Sibi's Chief of Staff",
          description:
            'Offer to bury the auditor’s ledger before the municipal coalition vote in exchange for City Hall protection and Grid Manipulation.',
          stat: 'influence',
          isRepeatable: false,
          isCompleted: false,
          requiredItem: 'decoded_tanker_ledger',
          outcomes: {
            clean: {
              cashDelta: 5000,
              factionRepDelta: [
                { factionId: 'city_hall', delta: 2 },
                { factionId: 'hawks', delta: -1 },
              ],
              narrativeLog:
                'Ma-Sibi’s Chief of Staff wires R5,000 hush money and gives you a direct line to the municipal grid control room.',
            },
            compromised: {
              cashDelta: 2500,
              factionRepDelta: [{ factionId: 'city_hall', delta: 1 }],
              composureDelta: -5,
              narrativeLog:
                'The Chief of Staff agrees to a tentative truce, unlocking municipal grid access.',
            },
            failure: {
              clockProgress: [{ clockId: 'precinct_heat', delta: 2 }],
              composureDelta: -10,
              narrativeLog:
                'Mayoral VIP bodyguards throw you out of the 4th-floor suite and alert Central Precinct.',
            },
          },
        },
      ],
    },

    // ----------------------------------------------------
    // NODE 5: GOLDEN DRAGON CYBER-PAWN
    // ----------------------------------------------------
    n5_cyber_pawn: {
      id: 'n5_cyber_pawn',
      title: 'Golden Dragon Cyber-Pawn',
      subtitle: 'Sparks • Signals & Hardware Fixer',
      factionOwner: 'neutral',
      tier: 'waterfront_east',
      x: 80,
      y: 55,
      isUnlocked: true,
      connectedNodeIds: ['n1_safehouse', 'n7_archive_basement', 'n6_pier2_port'],
      actionSlots: [
        {
          id: 'act_crack_phone',
          title: "Crack Auditor's Handset",
          description: 'Bypass biometric encryption on the dead auditor’s phone.',
          stat: 'wire',
          isRepeatable: true,
          isCompleted: false,
          requiredItem: 'auditor_encrypted_phone',
          disabledDuringStage6: true,
          stage6BonusModifier: 0,
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'crack_auditor_phone', delta: 2 }],
              unlockNodeIds: ['n6_pier2_port', 'n7_archive_basement'],
              narrativeLog: 'Sparks cracks a layer of encryption. Voice notes from Pier 2 begin downloading.',
            },
            compromised: {
              clockProgress: [{ clockId: 'crack_auditor_phone', delta: 1 }],
              composureDelta: -5,
              narrativeLog: 'Security triggers a remote wipe warning, but Sparks holds the firewall.',
            },
            failure: {
              clockProgress: [{ clockId: 'precinct_heat', delta: 1 }],
              composureDelta: -10,
              narrativeLog: 'A security ping alerts Abasanta cyber-cleaners before Sparks pulls the cable.',
            },
          },
        },
        {
          id: 'act_clone_transponder',
          title: 'Clone SAPS Radio Frequencies',
          description: 'Build an intercept scanner to monitor TRT dispatch and bypass SAPS roadblocks.',
          stat: 'wire',
          isRepeatable: false,
          isCompleted: false,
          costCash: 500,
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -2 }],
              addInventoryItem: 'saps_radio_scanner',
              narrativeLog: 'You pocket the cloned SAPS scanner—you can now hear and bypass every roadblock in real time.',
            },
            compromised: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -1 }],
              addInventoryItem: 'saps_radio_scanner',
              narrativeLog: 'Static-heavy radio scanner works well enough to slip past police cordons.',
            },
            failure: {
              composureDelta: -10,
              narrativeLog: 'You fry the soldering board and lose R500 in spare parts.',
            },
          },
        },
      ],
    },

    // ----------------------------------------------------
    // NODE 6: PIER 2 COLD STORAGE (LOCKED INITIALLY)
    // ----------------------------------------------------
    n6_pier2_port: {
      id: 'n6_pier2_port',
      title: 'Pier 2 Cold Storage Terminal',
      subtitle: 'Zuko Ndlovu • Abasanta Cartel',
      factionOwner: 'abasanta',
      tier: 'waterfront_east',
      x: 55,
      y: 85,
      isUnlocked: false, // Unlocked via Docket audit or phone decryption
      connectedNodeIds: ['n2_taxi_rank', 'n5_cyber_pawn'],
      actionSlots: [
        {
          id: 'act_recon_berth14',
          title: 'Recon Berth 14 Container Drop',
          description: 'Photograph chemical precursor drums being loaded into municipal tankers.',
          stat: 'street',
          isRepeatable: true,
          isCompleted: false,
          stage6BonusModifier: 2, // Dark bonus during Stage 6 blackouts!
          outcomes: {
            clean: {
              factionRepDelta: [{ factionId: 'abasanta', delta: -1 }],
              cashDelta: 3000,
              narrativeLog: 'Crisp photos of Mokoena shaking hands with Zuko’s dock supervisor.',
            },
            compromised: {
              cashDelta: 1500,
              composureDelta: -15,
              narrativeLog: 'Maritime guards spot your flashlight beam; you flee into the container stacks.',
            },
            failure: {
              clockProgress: [{ clockId: 'mokoena_sweep', delta: 2 }],
              composureDelta: -25,
              narrativeLog: 'Cartel enforcers corner you behind a forklift; you barely escape the gate.',
            },
          },
        },
        {
          id: 'act_trigger_berth14_finale',
          title: '[FINALE] Confront the Berth 14 Convoy',
          description:
            'Move in on the midnight tanker drop to execute the Vigilante ambush or negotiate the Kingpin compact at The Glass House.',
          stat: 'street',
          isRepeatable: true,
          isCompleted: false,
          stage6BonusModifier: 2,
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'berth_14_countdown', delta: 4 }],
              narrativeLog: 'You take position above Berth 14 as the municipal water tankers pull alongside Zuko’s crane.',
            },
            compromised: {
              clockProgress: [{ clockId: 'berth_14_countdown', delta: 4 }],
              composureDelta: -10,
              narrativeLog: 'You slip past the perimeter fence under pouring rain as the convoy engines roar to life.',
            },
            failure: {
              clockProgress: [{ clockId: 'berth_14_countdown', delta: 2 }],
              composureDelta: -15,
              narrativeLog: 'Port security dogs force you back; the shipment window is nearly here.',
            },
          },
        },
      ],
    },

    // ----------------------------------------------------
    // NODE 7: THE OLD ARCHIVE BASEMENT (LOCKED INITIALLY)
    // ----------------------------------------------------
    n7_archive_basement: {
      id: 'n7_archive_basement',
      title: 'The Old Archive Basement',
      subtitle: 'Col. van der Merwe • Hawks Holdouts',
      factionOwner: 'hawks',
      tier: 'waterfront_east',
      x: 78,
      y: 20,
      isUnlocked: false, // Unlocked via Phone decryption
      connectedNodeIds: ['n3_central_precinct', 'n5_cyber_pawn'],
      actionSlots: [
        {
          id: 'act_handover_dockets',
          title: 'Brief Colonel van der Merwe',
          description: 'Hand over certified copies of Docket #409 to the clean Hawks investigators.',
          stat: 'dockets',
          isRepeatable: false,
          isCompleted: false,
          requiredItem: 'decoded_tanker_ledger',
          outcomes: {
            clean: {
              factionRepDelta: [{ factionId: 'hawks', delta: 2 }],
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -3 }],
              narrativeLog: 'Van der Merwe locks the file in a physical safe. The Hawks are opening an official dossier.',
            },
            compromised: {
              factionRepDelta: [{ factionId: 'hawks', delta: 1 }],
              clockProgress: [{ clockId: 'mokoena_sweep', delta: -1 }],
              narrativeLog: 'Van der Merwe warns you that Mokoena has moles inside the Hawks archives.',
            },
            failure: {
              composureDelta: -10,
              narrativeLog: 'Van der Merwe is out on a raid; you leave the documents with a nervous desk sergeant.',
            },
          },
        },
        {
          id: 'act_trigger_whistleblower_finale',
          title: '[FINALE] Launch the National Broadcast & Witness Extraction',
          description:
            'Seal the archive blast doors and transmit the Berth 14 evidence to The Daily Veld to trigger the Act 1 Climax.',
          stat: 'dockets',
          isRepeatable: true,
          isCompleted: false,
          outcomes: {
            clean: {
              clockProgress: [{ clockId: 'berth_14_countdown', delta: 4 }],
              factionRepDelta: [{ factionId: 'hawks', delta: 1 }],
              narrativeLog: 'Van der Merwe’s encrypted uplink connects to The Daily Veld newsroom as midnight strikes at Berth 14.',
            },
            compromised: {
              clockProgress: [{ clockId: 'berth_14_countdown', delta: 4 }],
              composureDelta: -10,
              narrativeLog: 'The uplink holds despite TRT signal jammers outside the magistrate court.',
            },
            failure: {
              clockProgress: [{ clockId: 'berth_14_countdown', delta: 2 }],
              composureDelta: -10,
              narrativeLog: 'Static scrambles the transmission—the midnight deadline at Berth 14 is closing fast.',
            },
          },
        },
      ],
    },
  },
  activeLog: [
    'Day 1, 02:00 AM — Stage 4 Load Shedding. Constable Nandi collapses on your floor with Docket #409.',
  ],
  triggeredEventsQueue: [],
  activeEndingId: null,
  currentNodeId: 'n1_safehouse',
  generatorActiveToday: false,
  usedPerksToday: [],
  claimedDialogueRewards: [],
};
