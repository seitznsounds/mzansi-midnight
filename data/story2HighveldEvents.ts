import { NarrativeEvent } from '../types/events';

export const HIGHVELD_EVENT_DECK: Record<string, NarrativeEvent> = {
  // 1. THREAT CLOCK FULL: Megawatt Grid Sabotage (8/8)
  evt_highveld_blackout_crisis: {
    id: 'evt_highveld_blackout_crisis',
    title: 'The Highveld Blackout',
    category: 'threat_crisis',
    locationLabel: 'Johannesburg City Bowl • Substation Cascade',
    speakerName: 'National System Operator',
    speakerRole: 'Emergency Dispatch Audio',
    bodyText: [
      'A blinding blue flash illuminates the northern horizon as the 275kV transmission lines trip at Apollo substation. Across Johannesburg, Pretoria, and the East Rand, the lights extinguish in violent succession.',
      'Emergency diesel generators roar to life atop Sandton’s financial towers. The Department of Mineral Resources declares a National Stage 6 Emergency, authorizing an immediate R2.4 billion open-cycle diesel procurement decree.',
    ],
    choices: [
      {
        id: 'choice_blackout_scada',
        label: 'Reroute Power via Industrial SCADA Key',
        description: 'Manually bypass the damaged breakers using your cloned SCADA optical dongle.',
        requiredItem: 'gear_substation_scada_key',
        effect: {
          resetClockId: 'megawatt_sabotage',
          composureDelta: 10,
          narrativeLog:
            'You bypass the sabotaged relays, restoring emergency power to the municipal water pumps and SIU tribunal server.',
        },
      },
      {
        id: 'choice_blackout_redguard',
        label: 'Mobilize Red Guard Workers to Secure the Lines',
        description: 'Have Vusi’s pickets escort municipal linemen through hostile territory.',
        requiredStat: { stat: 'street', min: 2 },
        effect: {
          resetClockId: 'megawatt_sabotage',
          composureDelta: -10,
          factionRepDelta: [{ factionId: 'red_guard_populists', delta: 2 }],
          narrativeLog:
            'The Red Guard forms human barricades around key sub-stations, preventing cartel mercenaries from destroying more transformers.',
        },
      },
      {
        id: 'choice_blackout_endure',
        label: 'Endure the Darkness & Scramble Across Rooftops',
        description: 'Navigate the pitch-black streets under severe highveld winter smog.',
        effect: {
          composureDelta: -25,
          resetClockId: 'megawatt_sabotage',
          narrativeLog:
            'The city fractures into lawless chaos. You barely reach your Braamfontein loft as looters burn tyres on De Korte Street.',
        },
      },
    ],
  },

  // 2. THREAT CLOCK FULL: Crown Mines Rockfall Hazard (6/6)
  evt_highveld_shaft_collapse: {
    id: 'evt_highveld_shaft_collapse',
    title: 'Rockburst at Level 14',
    category: 'threat_crisis',
    locationLabel: 'Crown Mines Shaft 4 • Underground Stopes',
    speakerName: 'Mkhulu Sibanyoni',
    speakerRole: 'Zama-Zama Mining Elder',
    bodyText: [
      'A deafening boom reverberates through two kilometres of solid quartzite. The timber props groan, splinter, and give way as millions of tons of ancient rock shift violently overhead.',
      'Thick clouds of toxic quartzite dust and pungent methane gas blast through the haulage tunnel. Mkhulu’s miners shout in the dark as the escape cage cable vibrates wildly.',
    ],
    choices: [
      {
        id: 'choice_mine_rebreather',
        label: 'Seal Dräger Oxygen Rebreather & Clear the Shaft',
        description: 'Lead the trapped miners through the old Robinson Deep drainage winze.',
        requiredItem: 'gear_highveld_rebreather',
        effect: {
          resetClockId: 'rockfall_hazard',
          composureDelta: 15,
          factionRepDelta: [{ factionId: 'reef_zamazamas', delta: 2 }],
          narrativeLog:
            'Your Dräger rebreather holds. You guide six miners through the flooded winze to safety, cementing unshakeable loyalty.',
        },
      },
      {
        id: 'choice_mine_dynamite',
        label: 'Blast Through the Quartzite Blockage',
        description: 'Use abandoned cartel blasting charges to clear a crawlway to the surface.',
        requiredStat: { stat: 'street', min: 2 },
        effect: {
          resetClockId: 'rockfall_hazard',
          composureDelta: -15,
          cashDelta: 600,
          narrativeLog:
            'You blast through the fallen rock. In the debris, you salvage an iron strongbox containing R600 in raw gold pellets.',
        },
      },
      {
        id: 'choice_mine_surrender_reef',
        label: 'Crawl Through the Toxic Slag Chute',
        description: 'Abandon your heavy gear and claw your way through the narrow air vents.',
        effect: {
          resetClockId: 'rockfall_hazard',
          composureDelta: -35,
          narrativeLog:
            'You emerge onto the surface slag heaps bruised, bleeding, and coughing up black dust. The Level 14 stopes are sealed forever.',
        },
      },
    ],
  },

  // 3. THREAT CLOCK FULL: General Sithole’s NIA Surveillance (6/6)
  evt_highveld_nia_raid: {
    id: 'evt_highveld_nia_raid',
    title: 'The M1 Tactical Intercept',
    category: 'threat_crisis',
    locationLabel: 'Braamfontein Perimeter • Tactical Intercept',
    speakerName: 'Captain Baloyi',
    speakerRole: 'NIA Special Tactical Operations',
    bodyText: [
      'Three black Toyota Land Cruisers with tinted windows box your vehicle against the concrete barrier of the Braamfontein flyover. Men in balaclavas and tactical body armor emerge with suppressed carbines.',
      '"Kagiso Molefe! Hands on the steering wheel! General Sithole sends his regards. You’re coming to Pretoria for national security interrogation."',
    ],
    choices: [
      {
        id: 'choice_nia_ram',
        label: 'Ram the Flanking Cruiser & Escape Down the Off-Ramp',
        description: 'Use the heavy bumper of your bakkie to break through the intercept line.',
        requiredStat: { stat: 'street', min: 2 },
        effect: {
          resetClockId: 'nia_surveillance',
          composureDelta: -15,
          narrativeLog:
            'Tires screaming, you smash through the Land Cruiser’s rear quarter panel, spinning down into the Newtown subway tunnels.',
        },
      },
      {
        id: 'choice_nia_subpoena_badge',
        label: 'Display High Court Special Tribunal Warrant',
        description: 'Flash Advocate Khumalo’s stamped judicial subpoena and threaten treason charges.',
        requiredItem: 'evidence_nia_sabotage_order',
        effect: {
          resetClockId: 'nia_surveillance',
          composureDelta: 10,
          narrativeLog:
            'The tactical operators freeze when they see Sithole’s signature on the court order. Captain Baloyi lowers his weapon and signals withdrawal.',
        },
      },
      {
        id: 'choice_nia_bribe',
        label: 'Hand Over R1,500 Cash & Forged Passport',
        description: 'Pay off the tactical squad leader to report an empty vehicle.',
        requiredCash: 1500,
        effect: {
          resetClockId: 'nia_surveillance',
          cashDelta: -1500,
          narrativeLog:
            'Baloyi pockets the banknotes, spits on your windscreen, and radios base that the suspect slipped into Hillbrow.',
        },
      },
      {
        id: 'choice_nia_beaten',
        label: 'Submit to Shakedown & Lose Composure',
        description: 'They drag you into the road, confiscate your phones, and leave you in the dirt.',
        effect: {
          resetClockId: 'nia_surveillance',
          composureDelta: -30,
          narrativeLog:
            'You are beaten with rifle butts and left bleeding on the tarmac. Your backup phones are destroyed.',
        },
      },
    ],
  },

  // 4. ACTION CLOCK FULL: SIU Tribunal Indictment Docket (6/6)
  evt_highveld_tribunal_ready: {
    id: 'evt_highveld_tribunal_ready',
    title: 'The Special Tribunal Convened',
    category: 'story_climax',
    locationLabel: 'Pretoria High Court • Courtroom 4A',
    speakerName: 'Judge President Motsepe',
    speakerRole: 'Presiding Judge, Special Investigating Tribunal',
    bodyText: [
      'The courtroom is packed with armed judicial marshals, journalists, and nervous lawyers in tailored suits. On the defense bench, Helena Van Niekerk sits motionless, her legal team whispering frantically.',
      'Advocate Nomsa Khumalo rises to the podium, opening the leather binder containing your compiled forensic docket. "My Lord, the evidence proves intentional sabotage of the national power grid, orchestrated by the Megawatt Cartel and funded through Sandton offshore accounts."',
      'The moment of truth has arrived. How do you deliver the final blow?',
    ],
    choices: [
      {
        id: 'choice_tribunal_legal',
        label: 'Present Complete Evidence: Demand Section 205 Arrests (Clean Hands Victory)',
        description: 'Have the marshals arrest General Sithole and Helena Van Niekerk inside the courtroom.',
        requiredStat: { stat: 'dockets', min: 2 },
        effect: {
          narrativeLog:
            'The court orders immediate arrest! Judicial marshals snap handcuffs on the cartel leadership.',
          triggerEndingId: 'ending_highveld_siu_vindication',
        },
      },
      {
        id: 'choice_tribunal_public',
        label: 'Broadcast Evidence Live to the Press Gallery (General Strike Victory)',
        description: 'Release the Midas Cold-Storage files directly to television and union networks.',
        requiredStat: { stat: 'wire', min: 2 },
        effect: {
          narrativeLog:
            'The files hit public airwaves simultaneously. Massive cheers erupt outside the High Court.',
          triggerEndingId: 'ending_highveld_red_blackout',
        },
      },
    ],
  },

  // 5. ACTION CLOCK FULL: Project Midas Cold-Storage Decryption (4/4)
  evt_highveld_midas_decrypted: {
    id: 'evt_highveld_midas_decrypted',
    title: 'The Midas Ledger Decrypted',
    category: 'story_climax',
    locationLabel: 'SIU Forensic Sub-Basement • Air-Gapped Terminal',
    speakerName: 'Kagiso "Bra K" Molefe',
    speakerRole: 'SIU Forensic Auditor',
    bodyText: [
      'The cryptographic status bar hits 100%. The final AES-256 partition falls away, revealing the unredacted ledgers of Project Midas.',
      'Every cent of the R4.8 billion emergency diesel contracts has been converted into rough, unregistered conflict diamonds through Port Nolloth concessions along the Skeleton Coast.',
      'The Sovereign Pearl Trust in Durban was merely the fuel pipeline. The real payload is waiting in the diamond gravel of the Northern Cape.',
    ],
    choices: [
      {
        id: 'choice_midas_save_keystone',
        label: 'Extract Keystone Dossier: Project Midas Highveld Ledger',
        description: 'Save the decrypted files to your encrypted USB key. Unlocks Story 3: Namaqua-Diamond.',
        effect: {
          addInventoryItem: 'dossier_project_midas',
          composureDelta: 25,
          narrativeLog:
            'KEYSTONE DOSSIER EXTRACTED: Project Midas Highveld Coal Ledger. Story 3: Namaqua-Diamond is now unlocked in the campaign selector!',
        },
      },
    ],
  },

  // 6. WORLD CLOCK FULL: Kendon Blackout Countdown (6/6)
  evt_highveld_climax_kendon: {
    id: 'evt_highveld_climax_kendon',
    title: 'Showdown at Kendon Coal Depot',
    category: 'story_climax',
    locationLabel: 'Mpumalanga Border • Kendon Coal Depot',
    speakerName: 'General Sibusiso Sithole',
    speakerRole: 'NIA Special Operations Commander',
    bodyText: [
      'The Kendon Coal Depot is shrouded in thick industrial smog and heavy rain. A dozen heavy diesel tankers idle under floodlights, ready to roll toward the gas turbine stations.',
      'General Sithole stands on the weighbridge gantry flanked by private mercenaries. Helena Van Niekerk’s black Maybach sits nearby with engine running.',
      '"You’ve made your point, Molefe," Sithole’s voice booms through the wet air. "The grid falls tonight. The decree will be signed by midnight. You can join us, you can walk away, or you can join your sister under the tarmac."',
    ],
    choices: [
      {
        id: 'choice_kendon_siu_arrest',
        label: 'Lead the Hawks & SIU Marshals in a Full Tactical Raid (Clean Hands Ending)',
        description: 'Execute the Section 205 warrants, seize the tanker convoy, and take Sithole alive.',
        requiredStat: { stat: 'dockets', min: 2 },
        effect: {
          narrativeLog:
            'Blue lights flood the depot! The Hawks tactical team breaches the gates and surrounds the cartel.',
          triggerEndingId: 'ending_highveld_siu_vindication',
        },
      },
      {
        id: 'choice_kendon_red_strike',
        label: 'Signal Vusi’s Red Guard to Block the Convoy Gates (General Strike Ending)',
        description: 'Unleash four thousand union truck drivers to seize the depot and seize the diesel.',
        requiredStat: { stat: 'street', min: 2 },
        effect: {
          narrativeLog:
            'Union air horns blare as hundreds of trucks blockade the depot exits, trapping the cartel.',
          triggerEndingId: 'ending_highveld_red_blackout',
        },
      },
      {
        id: 'choice_kendon_sandton_deal',
        label: 'Accept Helena’s Offer: Take the Offshore Diamonds (Shadow Partner Ending)',
        description: 'Board the Maybach, accept the Swiss accounts, and leave the Highveld behind.',
        requiredStat: { stat: 'influence', min: 2 },
        effect: {
          cashDelta: 50000,
          narrativeLog:
            'You slip your gun into your coat and step into Helena’s Maybach. The past is erased in gold.',
          triggerEndingId: 'ending_highveld_arbitrage_partner',
        },
      },
      {
        id: 'choice_kendon_overrun',
        label: 'Overrun by Cartel Mercenaries (Reef Tomb Ending)',
        description: 'Stand your ground without sufficient tactical leverage as the mercenaries close in.',
        effect: {
          narrativeLog:
            'Mercenary crossfire traps your team at the weighbridge. The emergency decrees are signed as the grid collapses.',
          triggerEndingId: 'ending_highveld_shaft_collapse',
        },
      },
    ],
  },
};
