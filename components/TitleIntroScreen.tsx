'use client';

import React, { useState, useEffect } from 'react';
import { soundscape } from '../engine/soundscape';
import { SaveSlotId, SaveSlotRecord } from '../types/settings';
import { EndingId } from '../types/game';
import { ALL_CAMPAIGN_ENDINGS } from '../data/endings';
import {
  loadUnlockedEndings,
  MANUAL_SAVE_SLOT_IDS,
  SAVE_SLOT_LABELS,
} from '../engine/storage';
import { CAMPAIGN_STORIES, KEYSTONE_DOSSIERS } from '../data/campaignStories';
import {
  loadCampaignProgression,
  getStoryStatus,
  setActiveStory,
} from '../engine/campaignStorage';
import {
  StoryId,
  StoryMetadata,
  KeystoneDossier,
  CampaignProgression,
} from '../types/campaign';

import { SupportedLanguage } from '../types/settings';
import {
  t,
  getLocalizedEnding,
  getLocalizedStory,
  getLocalizedKeystone,
} from '../engine/i18n';
import { LeaderboardModal } from './LeaderboardModal';
import { UserProfileModal } from './UserProfileModal';
import { GooglePlayTesterModal } from './GooglePlayTesterModal';
import { getSavedUserProfile, subscribeToUserProfile, setupAuthListener } from '../engine/cloudSync';
import { UserProfile } from '../types/leaderboard';

type IntroMenuTab = 'main' | 'campaign' | 'new' | 'load' | 'archive' | 'briefing';

const ALL_ENDING_IDS: EndingId[] = [
  'ending_vigilante',
  'ending_whistleblower',
  'ending_kingpin',
  'ending_captured',
  'ending_act2_reckoning',
  'ending_act2_revolution',
  'ending_act2_syndicate_state',
  'ending_act2_vanished',
  'ending_highveld_siu_vindication',
  'ending_highveld_red_blackout',
  'ending_highveld_arbitrage_partner',
  'ending_highveld_shaft_collapse',
  'ending_namaqua_naval_raid',
  'ending_namaqua_divers_rebellion',
  'ending_namaqua_diamond_flight',
  'ending_namaqua_desert_dune_grave',
  'ending_cape_sovereign_seizure',
  'ending_cape_gang_truce',
  'ending_cape_winelands_audit',
  'ending_cape_shadow_execution',
  'ending_octagon_constitutional_reckoning',
  'ending_octagon_peoples_revolution',
  'ending_octagon_shadow_director',
  'ending_octagon_balkanized_republic',
  'ending_octagon_vanished_watchers',
];

const ENDING_UNLOCK_HINTS: Record<EndingId, string> = {
  ending_vigilante:
    'Act 1 Climax (Berth 14): Strike the precursor convoy with Bra Bheki’s street syndicate or trigger the Vigilante Finale at Pier 2.',
  ending_whistleblower:
    'Act 1 Climax (Berth 14): Broadcast the decrypted audio & ledger to The Daily Veld with Colonel van der Merwe at the Old Archive Basement.',
  ending_kingpin:
    'Act 1 Climax (Berth 14): Sell the original Docket #409 to Zuko Ndlovu and Councillor Ma-Sibi for a 20% syndicate retainer.',
  ending_captured:
    'Act 1 Threat Crisis: Allow Brigadier Mokoena’s Sweep or Nandi’s Gunshot Wound to overwhelm your safehouse without an escape plan.',
  ending_act2_reckoning:
    'Act 2 Finale (Hangar 7): Execute the Supreme Court Tarmac Arrest with both Act 2 supreme exhibits and DPCI Hawks backing.',
  ending_act2_revolution:
    'Act 2 Finale (Hangar 7): Storm Hangar 7 and the Midlands Super-Lab alongside Bra Bheki’s Northern Water Strike coalition.',
  ending_act2_syndicate_state:
    'Act 2 Finale (Hangar 7): Board Gulfstream ZS-900 with Zuko and Ma-Sibi as the new Shadow Fixer of Sovereign Pearl Holdings.',
  ending_act2_vanished:
    'Act 2 Threat Crisis: Fall to the Izinkabi Hit Squad or State Security Contempt Warrant before Flight ZS-900 departs.',
  ending_highveld_siu_vindication:
    'Story 2 Climax: Present the Black-Sky Directive and coal slurry to Advocate Khumalo at the SIU Special Tribunal.',
  ending_highveld_red_blackout:
    'Story 2 Climax: Sound the red horns and shut down the N4/N12 coal corridors with Vusi Sithole’s Red Guard marshals.',
  ending_highveld_arbitrage_partner:
    'Story 2 Climax: Accept Helena Van Niekerk’s offshore equity settlement in Sandton and divert the diesel money westward.',
  ending_highveld_shaft_collapse:
    'Story 2 Threat Crisis: Allow the Crown Mines rockfall hazard or Megawatt grid sabotage to collapse the underground stopes.',
  ending_namaqua_naval_raid:
    'Story 3 Climax (Alexander Bay): Present the Aegis arms bill to Captain Cloete to lead the High Court naval raid.',
  ending_namaqua_divers_rebellion:
    'Story 3 Climax (Alexander Bay): Rally the shore divers and suction bakkies to blockade Petrov’s marine compound.',
  ending_namaqua_diamond_flight:
    'Story 3 Climax (Orange River): Recover the 1,200 carat diamond parcel and escape across the drift into Namibia.',
  ending_namaqua_desert_dune_grave:
    'Story 3 Threat Crisis: Fall to radiator overheating or mercenary gunfire in the Richtersveld moon rock dunes.',
  ending_cape_sovereign_seizure:
    'Story 4 Climax (Berth 109): Breach the armaments container with the hardened prybar and recover The Grand Sovereign Protocol.',
  ending_cape_gang_truce:
    'Story 4 Climax (Berth 109): Rally Pastor Ronnie’s Cape Flats community coalition to blockade General Swart’s convoy.',
  ending_cape_winelands_audit:
    'Story 4 Climax (Berth 109): Serve forensic freeze orders on the Winelands Capital Club to cut off mercenary funding.',
  ending_cape_shadow_execution:
    'Story 4 Threat Crisis: Fall in a lone stand on Signal Hill, triggering your digital dead-man transmission.',
  ending_octagon_constitutional_reckoning:
    'Story 5 Grand Climax (Karoo Summit): Serve High Court constitutional warrants to arrest the eight conspirators for high treason.',
  ending_octagon_peoples_revolution:
    'Story 5 Grand Climax (Karoo Summit): Rally the nationwide mass civil resistance to breach the mountain compound and seize corporate wealth.',
  ending_octagon_shadow_director:
    'Story 5 Grand Climax (Karoo Summit): Accept Lord Sterling’s offer and take the throne as the new Shadow Director of South Africa.',
  ending_octagon_balkanized_republic:
    'Story 5 Threat Crisis: Allow the Stage 8 Blackout countdown or mercenary sweeps to fragment the Republic into warlord fiefdoms.',
  ending_octagon_vanished_watchers:
    'Story 5 Enigmatic Choice: Burn the master archive drives into ash and vanish into the Karoo night as silent guardians.',
};

function getEndingBadge(id: EndingId, lang: SupportedLanguage): string {
  if (id.startsWith('ending_octagon_')) return t('story.badge.story5', 'STORY 5 // SOVEREIGN OCTAGON', lang);
  if (id.startsWith('ending_cape_')) return t('story.badge.story4', 'STORY 4 // CAPE NOCTURNE', lang);
  if (id.startsWith('ending_namaqua_')) return t('story.badge.story3', 'STORY 3 // NAMAQUA', lang);
  if (id.startsWith('ending_highveld_')) return t('story.badge.story2', 'STORY 2 // HIGHVELD', lang);
  if (id.startsWith('ending_act2_')) return t('story.badge.act2', 'STORY 1 // ACT 2 FINALE', lang);
  return t('story.badge.act1', 'STORY 1 // ACT 1', lang);
}

function renderFormattedRule(text: string): React.ReactNode {
  const parts = text.split(/(\[(?:clean|comp|blow|inv|threat|stealth)\][\s\S]*?\[\/(?:clean|comp|blow|inv|threat|stealth)\])/g);
  return parts.map((part, idx) => {
    if (part.startsWith('[clean]')) {
      return <span key={idx} className="text-emerald-400 font-semibold">{part.slice(7, -8)}</span>;
    }
    if (part.startsWith('[comp]')) {
      return <span key={idx} className="text-amber-400 font-semibold">{part.slice(6, -7)}</span>;
    }
    if (part.startsWith('[blow]')) {
      return <span key={idx} className="text-red-400 font-semibold">{part.slice(6, -7)}</span>;
    }
    if (part.startsWith('[inv]')) {
      return <span key={idx} className="text-amber-300 font-semibold">{part.slice(5, -6)}</span>;
    }
    if (part.startsWith('[threat]')) {
      return <span key={idx} className="text-red-400 font-semibold">{part.slice(8, -9)}</span>;
    }
    if (part.startsWith('[stealth]')) {
      return <span key={idx} className="text-emerald-400 font-semibold">{part.slice(9, -10)}</span>;
    }
    return part;
  });
}

const NODE_DISPLAY_NAMES: Record<string, string> = {
  n1_safehouse: 'Safehouse (Room 404)',
  n2_taxi_rank: 'Queen Street Taxi Rank',
  n3_central_precinct: 'Durban Central Precinct',
  n4_city_hall: 'City Hall Tender Office',
  n5_cyber_pawn: 'Point Road Cyber-Pawn',
  n6_pier2_port: 'Pier 2 Container Terminal',
  n7_archive_basement: 'Municipal Archive Basement',
  n8_ridge_penthouses: 'The Ridge Penthouses (Act 2)',
  n9_township_depot: 'Northern Township Depot (Act 2)',
  n10_high_court: 'High Court Chambers (Act 2)',
  n11_citrus_estate: 'Hydroponic Citrus Estate (Act 2)',
  n12_cargo_apron: 'King Shaka Cargo Apron (Act 2)',
  d1_port_nolloth_jetty: 'Port Nolloth Jetty (Story 3)',
  d2_alexander_bay_quarry: 'Alexander Bay Tailings (Story 3)',
  d3_richtersveld_canyon: 'Richtersveld Canyon (Story 3)',
  d4_debeers_ghost_mine: 'De Beers Ghost Mine (Story 3)',
  d5_orange_river_pont: 'Orange River Pont (Story 3)',
  d6_aegis_coastal_compound: 'Aegis Marine Base (Story 3)',
  d7_springbok_magistrate: 'Springbok Magistrate (Story 3)',
  c1_long_street_strip: 'Long Street Strip (Story 4)',
  c2_manenberg_tenements: 'Manenberg Tenements (Story 4)',
  c3_camps_bay_promenade: 'Camps Bay Promenade (Story 4)',
  c4_table_bay_container_berth: 'Table Bay Berth 109 (Story 4)',
  c5_stellenbosch_wine_estate: 'Stellenbosch Manor (Story 4)',
  c6_agu_safehouse_ruin: 'AGU Safehouse Bunker (Story 4)',
  c7_provincial_police_hq: 'Foreshore Police HQ (Story 4)',
  o1_drakensberg_bunker: 'Drakensberg Bunker (Story 5)',
  o2_union_buildings_subbasement: 'Union Buildings Crypt (Story 5)',
  o3_apollo_grid_command: 'Apollo Grid Command (Story 5)',
  o4_durban_berth_command: 'Durban Berth Command (Story 5)',
  o5_karoo_airspace_corridor: 'Karoo Airspace Corridor (Story 5)',
  o6_stellenbosch_oligarch_vault: 'Stellenbosch Vault (Story 5)',
  o7_octagon_summit_chamber: 'Octagon Summit Chamber (Story 5)',
};

function formatSavedTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return 'Recent';
  }
}

const COLOR_THEMES: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    pulse: string;
    badge: string;
    glow: string;
    button: string;
  }
> = {
  amber: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
    pulse: 'bg-amber-400',
    badge: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.2)]',
    button: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  },
  cyan: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-400',
    pulse: 'bg-cyan-400',
    badge: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
  },
  orange: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-950/20',
    text: 'text-orange-400',
    pulse: 'bg-orange-400',
    badge: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    button: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
  },
  purple: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-950/20',
    text: 'text-purple-400',
    pulse: 'bg-purple-400',
    badge: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    button: 'bg-purple-500 hover:bg-purple-400 text-slate-950',
  },
  rose: {
    border: 'border-rose-500/50',
    bg: 'bg-rose-950/20',
    text: 'text-rose-400',
    pulse: 'bg-rose-400',
    badge: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    button: 'bg-rose-500 hover:bg-rose-400 text-white',
  },
};

const STORY_BLACKOUT_INFO: Record<
  StoryId,
  {
    stage: string;
    time: string;
    pitchKey: string;
    pitchFallback: string;
  }
> = {
  story_1_ethekwini: {
    stage: 'STAGE 4 BLACKOUT',
    time: '01:15 SAST',
    pitchKey: 'intro.pitch',
    pitchFallback:
      'Six months ago, Brigadier Titus Mokoena framed you and buried your Hawks badge. Tonight, during a Stage 4 coastal blackout, your former rookie partner stumbles into your Mercury Arcade flat bleeding from a gunshot wound—carrying a bloodstained ledger that ties City Hall’s R400m water-tanker tenders directly to the Abasanta drug cartel.',
  },
  story_2_highveld: {
    stage: 'STAGE 6 ROTATING BLACKOUT',
    time: '03:30 SAST',
    pitchKey: 'intro.pitch_story2',
    pitchFallback:
      'Strategic destruction of Eskom power generation to force emergency open-cycle gas turbine diesel tenders, bankrolled by private security oligarchs and corrupt cabinet insiders. Disgraced SIU investigator Kagiso "Bra K" Molefe must penetrate Johannesburg\'s deepest mine shafts and Sandton penthouses before the grid collapses.',
  },
  story_3_namaqua: {
    stage: 'COASTAL RADAR BLACKOUT',
    time: '04:45 SAST',
    pitchKey: 'intro.pitch_story3',
    pitchFallback:
      'Unregistered seabed diamond-dredging concessions, cross-border arms drops, and private naval mercenaries laundering energy cash into international conflict stones across the fog-shrouded Atlantic coastline of Port Nolloth and the Richtersveld.',
  },
  story_4_cape: {
    stage: 'TABLE BAY SUBSTATION CUT',
    time: '02:00 SAST',
    pitchKey: 'intro.pitch_story4',
    pitchFallback:
      'A shadow alliance of provincial police generals, unified Cape Flats gang cartels, and historic Winelands oligarchs arming a private security army to control the night economy and export docks. Former Anti-Gang Unit detective Leila Hendricks investigates from Camps Bay to the Stellenbosch cellars.',
  },
  story_5_octagon: {
    stage: 'STAGE 8 BLACK-SKY GRID COLLAPSE',
    time: '00:00 SAST',
    pitchKey: 'intro.pitch_story5',
    pitchFallback:
      'Total Stage 8 Black-Sky Grid Collapse across all nine provinces. The United Hawks Taskforce unifies the four regional forensic keystones to storm the Sovereign Octagon summit in the Drakensberg before democracy is permanently dissolved.',
  },
};

export const TitleIntroScreen: React.FC<{
  saveSlots: Partial<Record<SaveSlotId, SaveSlotRecord>>;
  lang?: SupportedLanguage;
  onStartNewGame: (
    slotId: SaveSlotId,
    mode:
      | 'prologue'
      | 'act1_map'
      | 'act2_map'
      | 'highveld_prologue'
      | 'highveld_map'
      | 'namaqua_prologue'
      | 'namaqua_map'
      | 'cape_prologue'
      | 'cape_map'
      | 'octagon_prologue'
      | 'octagon_map',
    storyId?: StoryId
  ) => void;
  onLoadSaveSlot: (record: SaveSlotRecord) => void;
  onDeleteSaveSlot: (slotId: SaveSlotId) => void;
  onOpenSettings: () => void;
}> = ({
  saveSlots,
  lang = 'en',
  onStartNewGame,
  onLoadSaveSlot,
  onDeleteSaveSlot,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<IntroMenuTab>('main');
  const [isMobileSynopsisExpanded, setIsMobileSynopsisExpanded] = useState<boolean>(false);
  const tabContentRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);
  const [selectedNewSlot, setSelectedNewSlot] = useState<SaveSlotId>('slot_1');
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<SaveSlotId | null>(
    null
  );
  const [inspectedEndingId, setInspectedEndingId] = useState<EndingId | null>(
    null
  );
  const [inspectedStory, setInspectedStory] = useState<StoryMetadata | null>(
    null
  );
  const [inspectedKeystone, setInspectedKeystone] =
    useState<KeystoneDossier | null>(null);

  const [progression, setProgression] = useState<CampaignProgression>(() =>
    loadCampaignProgression()
  );
  const [activeStoryId, setActiveStoryId] = useState<StoryId>(() => {
    const p = loadCampaignProgression();
    return p.activeStoryId || 'story_1_ethekwini';
  });
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlayTesterOpen, setIsPlayTesterOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    getSavedUserProfile()
  );

  // Initialize and listen to real-time auth changes & OAuth redirects
  useEffect(() => {
    setupAuthListener();
    const unsubscribe = subscribeToUserProfile((updatedProfile) => {
      setUserProfile(updatedProfile);
    });
    return () => unsubscribe();
  }, []);

  // Automatically scroll active section into mobile viewport when user changes choices
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const timer = setTimeout(() => {
        tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleSelectStory = (storyId: StoryId) => {
    setActiveStory(storyId);
    const updated = loadCampaignProgression();
    setProgression(updated);
    setActiveStoryId(storyId);
  };

  const unlockedStoryCount = progression.unlockedStories.length;
  const collectedKeystoneCount = progression.collectedKeystones.length;

  const unlockedEndings = loadUnlockedEndings();
  const unlockedEndingCount = Object.keys(unlockedEndings).length;

  const activeStory = getLocalizedStory(
    CAMPAIGN_STORIES.find((s) => s.id === activeStoryId) || CAMPAIGN_STORIES[0],
    lang
  );
  const storyTheme = COLOR_THEMES[activeStory.accentColor] || COLOR_THEMES.amber;
  const blackoutInfo =
    STORY_BLACKOUT_INFO[activeStory.id] || STORY_BLACKOUT_INFO.story_1_ethekwini;
  const activePitch = t(blackoutInfo.pitchKey, blackoutInfo.pitchFallback, lang);

  // Find the most recently updated save slot for quick "Continue"
  const populatedSlots = (
    Object.values(saveSlots).filter(Boolean) as SaveSlotRecord[]
  ).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
  const mostRecentSave = populatedSlots[0] || null;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-zinc-100 flex items-center justify-center p-3 sm:p-6 select-none font-sans relative overflow-y-auto">
      {/* Widescreen Key Art Background & Radial Vignette */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          key={`bg-${activeStory.id}`}
          src={activeStory.imageArt}
          alt={activeStory.title}
          className="w-full h-full object-cover opacity-35 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />
      </div>

      <div className="relative z-10 w-full max-w-4xl my-auto rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* TOP CLASSIFICATION BANNER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-900/95 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${storyTheme.pulse} animate-pulse`}
            />
            <span
              className={`${storyTheme.text} tracking-widest uppercase font-semibold`}
            >
              {activeStory.caseDocket}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live High Score Board button */}
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsLeaderboardOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 font-bold"
              title={t('scores.tooltip', 'Open High Scores, Speedruns & Completionist Board', lang)}
            >
              <span>🏆</span>
              <span className="hidden sm:inline">{t('scores.btn', 'Scores & Speedruns', lang)}</span>
              <span className="sm:hidden">{t('scores.btn_short', 'Scores', lang)}</span>
            </button>

            {/* Google Play Store / Android Closed Testing */}
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsPlayTesterOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 font-bold"
              title={t('playstore.tooltip', 'Download for Android on Google Play (Visita Testers Track)', lang)}
            >
              <span>▶</span>
              <span className="hidden sm:inline">Play Store</span>
              <span className="sm:hidden">Android</span>
            </button>

            {/* Google Profile & Cloud Save */}
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsProfileOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/50 text-cyan-300 uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
              title={t('profile.tooltip', 'Operative Profile, Google Login & Cloud Backup', lang)}
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.displayName}
                  className="w-4 h-4 rounded-full border border-cyan-400/60 object-cover"
                />
              ) : (
                <span>👤</span>
              )}
              <span className="hidden sm:inline">
                {userProfile.isGuest ? t('auth.sign_in', 'Sign in', lang) : userProfile.displayName}
              </span>
              {!userProfile.isGuest && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"
                  title="Google Verified"
                />
              )}
            </button>

            <span className="text-zinc-400 hidden md:inline uppercase">
              {activeStory.region}
            </span>
            <button
              onClick={() => {
                soundscape.playDieSelect();
                onOpenSettings();
              }}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 uppercase tracking-wider cursor-pointer transition-colors"
            >
              ⚙ <span className="hidden sm:inline">{t('ui.settings', 'Settings', lang)}</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          {/* HERO TITLE & KEY ART BANNER - DESKTOP VIEW */}
          <div className="hidden md:flex flex-row gap-6 items-center">
            <div
              className={`relative w-64 h-44 rounded-xl overflow-hidden border ${storyTheme.border} shrink-0 shadow-lg ${storyTheme.glow}`}
            >
              <img
                key={activeStory.id}
                src={activeStory.imageArt}
                alt={activeStory.title}
                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div
                className={`absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono ${storyTheme.text}`}
              >
                <span className="font-semibold">{blackoutInfo.stage}</span>
                <span>{blackoutInfo.time}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`inline-block px-2.5 py-0.5 rounded ${storyTheme.badge} border text-[11px] font-mono uppercase tracking-wider font-semibold`}
                >
                  STORY 0{activeStory.number} // {activeStory.subtitle}
                </div>
                <div className="text-[10px] font-mono uppercase text-zinc-400">
                  {activeStory.region}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight flex flex-wrap items-baseline gap-2">
                <span>{t('ui.app_title', 'Mzansi Midnight', lang)}:</span>
                <span className={storyTheme.text}>{activeStory.title}</span>
              </h1>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {activePitch}
              </p>
            </div>
          </div>

          {/* HERO TITLE & KEY ART BANNER - MOBILE ADAPTIVE VIEW */}
          <div className="md:hidden">
            {activeTab === 'main' ? (
              // Mobile Overview Hero: Compact, touch-friendly, keeps menu visible above the fold
              <div className="space-y-3">
                <div
                  className={`relative w-full h-28 sm:h-36 rounded-xl overflow-hidden border ${storyTheme.border} shadow-md ${storyTheme.glow}`}
                >
                  <img
                    key={activeStory.id}
                    src={activeStory.imageArt}
                    alt={activeStory.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />
                  <div
                    className={`absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono ${storyTheme.text}`}
                  >
                    <span className="font-semibold">{blackoutInfo.stage}</span>
                    <span>{blackoutInfo.time}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div
                      className={`inline-block px-2 py-0.5 rounded ${storyTheme.badge} border text-[10px] font-mono uppercase tracking-wider font-semibold`}
                    >
                      STORY 0{activeStory.number} // {activeStory.subtitle}
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex flex-wrap items-baseline gap-1.5">
                    <span>{t('ui.app_title', 'Mzansi Midnight', lang)}:</span>
                    <span className={storyTheme.text}>{activeStory.title}</span>
                  </h1>

                  <p className={`text-xs text-zinc-300 leading-relaxed ${isMobileSynopsisExpanded ? '' : 'line-clamp-2'}`}>
                    {activePitch}
                  </p>
                  <button
                    onClick={() => setIsMobileSynopsisExpanded(!isMobileSynopsisExpanded)}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {isMobileSynopsisExpanded
                      ? t('intro.less_synopsis', '▲ Collapse Briefing', lang)
                      : t('intro.more_synopsis', '▼ Read Full Story Briefing', lang)}
                  </button>
                </div>
              </div>
            ) : (
              // Mobile Compact Dossier Header: Collapsed when in a sub-view (New Game, Load, 5 Stories)
              // so the active view's controls immediately fill the screen!
              <div className="space-y-2">
                <div
                  className={`p-2.5 rounded-xl border ${storyTheme.border} ${storyTheme.bg} flex items-center justify-between gap-3 shadow-md`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={activeStory.imageArt}
                      alt={activeStory.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                        <span className={`font-semibold ${storyTheme.text}`}>
                          0{activeStory.number}
                        </span>
                        <span>•</span>
                        <span className="truncate">{blackoutInfo.stage}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {activeStory.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                    <button
                      onClick={() =>
                        setIsMobileSynopsisExpanded(!isMobileSynopsisExpanded)
                      }
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                      title={t('intro.toggle_dossier', 'Toggle Dossier', lang)}
                    >
                      {isMobileSynopsisExpanded
                        ? t('intro.hide_info', '▲ Hide', lang)
                        : t('intro.show_info', 'ℹ Info', lang)}
                    </button>
                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        setActiveTab('main');
                      }}
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-amber-300 hover:text-amber-200 cursor-pointer"
                      title={t('intro.back_to_menu', 'Back to Overview', lang)}
                    >
                      ✕ {t('intro.close', 'Close', lang)}
                    </button>
                  </div>
                </div>

                {isMobileSynopsisExpanded && (
                  <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-2 text-xs text-zinc-300 leading-relaxed animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                      <span>{activeStory.region}</span>
                      <span className={storyTheme.text}>{blackoutInfo.time}</span>
                    </div>
                    <p>{activePitch}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MAIN MENU COMMAND BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 pt-1 border-b border-zinc-800 pb-4 sm:pb-5">
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setActiveTab(activeTab === 'campaign' ? 'main' : 'campaign');
              }}
              className={`p-2.5 sm:px-3.5 sm:py-3 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer text-left flex flex-col justify-between ${
                activeTab === 'campaign'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] opacity-75">
                  {t('intro.menu_campaign', '00 // CAMPAIGN', lang)}
                </span>
                {activeTab === 'campaign' && (
                  <span className="text-[9px] font-bold px-1 rounded bg-black/30 text-slate-950">
                    ● ACTIVE
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs sm:text-sm font-semibold text-amber-300">
                {t('intro.the_quintet', 'The 5 Stories', lang)} ({unlockedStoryCount}/5)
              </span>
            </button>

            <button
              onClick={() => {
                soundscape.playDieSelect();
                setActiveTab(activeTab === 'new' ? 'main' : 'new');
              }}
              className={`p-2.5 sm:px-3.5 sm:py-3 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer text-left flex flex-col justify-between ${
                activeTab === 'new'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] opacity-75">{t('intro.menu_start', '01 // START', lang)}</span>
                {activeTab === 'new' && (
                  <span className="text-[9px] font-bold px-1 rounded bg-black/30 text-slate-950">
                    ● ACTIVE
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs sm:text-sm">{t('intro.new_game', 'New Game', lang)}</span>
            </button>

            <button
              onClick={() => {
                soundscape.playDieSelect();
                setActiveTab(activeTab === 'load' ? 'main' : 'load');
              }}
              className={`p-2.5 sm:px-3.5 sm:py-3 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer text-left flex flex-col justify-between ${
                activeTab === 'load'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 ring-emerald-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] opacity-75">
                  {t('intro.menu_dossiers', '02 // DOSSIERS', lang)}
                </span>
                {activeTab === 'load' && (
                  <span className="text-[9px] font-bold px-1 rounded bg-black/30 text-slate-950">
                    ● ACTIVE
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs sm:text-sm">
                {t('intro.load_game', 'Load Game', lang)} ({populatedSlots.length}/4)
              </span>
            </button>

            <button
              onClick={() => {
                soundscape.playDieSelect();
                setActiveTab(activeTab === 'archive' ? 'main' : 'archive');
              }}
              className={`p-2.5 sm:px-3.5 sm:py-3 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer text-left flex flex-col justify-between ${
                activeTab === 'archive'
                  ? 'bg-purple-500 text-slate-950 border-purple-400 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 ring-purple-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] opacity-75">
                  {t('intro.menu_archive', '03 // ARCHIVE', lang)}
                </span>
                {activeTab === 'archive' && (
                  <span className="text-[9px] font-bold px-1 rounded bg-black/30 text-slate-950">
                    ● ACTIVE
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs sm:text-sm">
                {t('intro.case_endings', 'Case Endings', lang)} ({unlockedEndingCount}/{ALL_ENDING_IDS.length})
              </span>
            </button>

            <button
              onClick={() => {
                soundscape.playDieSelect();
                onOpenSettings();
              }}
              className="p-2.5 sm:px-3.5 sm:py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-left flex flex-col justify-between"
            >
              <span className="text-[10px] text-zinc-400">{t('intro.menu_system', '04 // SYSTEM', lang)}</span>
              <span className="mt-1 text-xs sm:text-sm">{t('intro.settings_lang', 'Settings / Lang', lang)}</span>
            </button>

            <button
              onClick={() => {
                soundscape.playDieSelect();
                setActiveTab(activeTab === 'briefing' ? 'main' : 'briefing');
              }}
              className={`col-span-2 sm:col-span-1 p-2.5 sm:px-3.5 sm:py-3 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer text-left flex flex-col justify-between ${
                activeTab === 'briefing'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold ring-1 ring-cyan-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] opacity-75">{t('intro.menu_primer', '05 // HELP & MANUAL', lang)}</span>
                {activeTab === 'briefing' && (
                  <span className="text-[9px] font-bold px-1 rounded bg-black/30 text-slate-950">
                    ● ACTIVE
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs sm:text-sm">{t('intro.field_briefing', 'Help & Manual', lang)}</span>
            </button>
          </div>

          {/* Scroll Anchor & Mobile Active Section Indicator */}
          <div ref={tabContentRef} className="scroll-mt-4" />

          {activeTab !== 'main' && (
            <div className="flex md:hidden items-center justify-between p-2.5 rounded-xl bg-zinc-900/95 border border-zinc-700/80 font-mono text-xs shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-zinc-400 uppercase text-[10px] shrink-0">VIEW:</span>
                <span className="text-white font-bold uppercase tracking-wider truncate">
                  {activeTab === 'campaign' && t('intro.the_quintet', 'The 5 Stories', lang)}
                  {activeTab === 'new' && t('intro.new_game', 'New Game', lang)}
                  {activeTab === 'load' && t('intro.load_game', 'Load Game', lang)}
                  {activeTab === 'archive' && t('intro.case_endings', 'Case Endings', lang)}
                  {activeTab === 'briefing' && t('intro.field_briefing', 'Help & Manual', lang)}
                </span>
              </div>
              <button
                onClick={() => {
                  soundscape.playDieSelect();
                  setActiveTab('main');
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>←</span>
                <span>{t('intro.back', 'Back to Menu', lang)}</span>
              </button>
            </div>
          )}


          {/* VIEW 1: DEFAULT MAIN OVERVIEW */}
          {activeTab === 'main' && (
            <div className="space-y-4">
              {/* THE 5-STORY CAMPAIGN TEASER BANNER */}
              <div
                onClick={() => {
                  soundscape.playDieSelect();
                  setActiveTab('campaign');
                }}
                className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-purple-950/30 border border-amber-500/40 hover:border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-mono font-bold text-amber-300 text-sm shrink-0">
                    5S
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                      {t('campaign.teaser_tag', 'THE OVERARCHING NOIR ANTHOLOGY', lang)}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {t('campaign.teaser_title', 'The Mzansi Midnight Quintet — 5 Connecting Campaigns', lang)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs text-amber-300">
                  <span>
                    {t('campaign.stories_unlocked_stat', '{count}/5 Unlocked', lang).replace(
                      '{count}',
                      String(unlockedStoryCount)
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    {t('campaign.keystones_stat', '{count}/4 Keystones', lang).replace(
                      '{count}',
                      String(collectedKeystoneCount)
                    )}
                  </span>
                  <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* ANDROID STANDALONE APP BANNER */}
              <div
                onClick={() => {
                  soundscape.playDieSelect();
                  setIsPlayTesterOpen(true);
                }}
                className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-cyan-950/30 border border-emerald-500/40 hover:border-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-mono font-bold text-emerald-300 text-base shrink-0">
                    ▶
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                      {t('playstore.teaser_tag', 'NATIVE STANDALONE ANDROID RELEASE', lang)}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {t('playstore.teaser_title', 'Download on Google Play Store — Closed Testing (Visita Testers)', lang)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs text-emerald-300">
                  <span className="hidden xs:inline">{t('playstore.teaser_action', 'Join Testers & Download', lang)}</span>
                  <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {mostRecentSave ? (
                <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/25 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                      <span>{t('intro.active_investigation_detected', 'ACTIVE INVESTIGATION DETECTED', lang)}</span>
                      <span>•</span>
                      <span>{mostRecentSave.label}</span>
                    </div>
                    <div className="text-sm sm:text-base font-medium text-white">
                      {t('ui.cycle', 'Cycle', lang)} {mostRecentSave.gameState.day} —{' '}
                      {NODE_DISPLAY_NAMES[
                        mostRecentSave.gameState.currentNodeId
                      ] || 'District Map'}
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex flex-wrap gap-3">
                      <span className="text-emerald-300">
                        R{mostRecentSave.gameState.cash.toLocaleString()}
                      </span>
                      <span className="text-cyan-300">
                        {mostRecentSave.gameState.composure}% {t('intro.composure', 'Composure', lang)}
                      </span>
                      <span>
                        Stage {mostRecentSave.gameState.loadSheddingStage} {t('intro.grid', 'Grid', lang)}
                      </span>
                      <span>
                        {t('intro.saved', 'Saved', lang)} {formatSavedTimestamp(mostRecentSave.savedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onLoadSaveSlot(mostRecentSave);
                      }}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                    >
                      {t('intro.resume_investigation', 'Resume Investigation →', lang)}
                    </button>
                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        setActiveTab('load');
                      }}
                      className="px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {t('intro.all_slots', 'All Slots ({count})', lang).replace(
                        '{count}',
                        String(populatedSlots.length)
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                      {t('intro.no_active_dossier', 'NO ACTIVE DOSSIER ON FILE', lang)}
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      {t(
                        'intro.no_active_dossier_desc',
                        'Open a new investigation file to choose your investigator background and begin Cycle 1 in eThekwini-Gold.',
                        lang
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      soundscape.playOutcome('clean');
                      setActiveTab('new');
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.25)] transition-all cursor-pointer shrink-0"
                  >
                    {t('intro.open_new_case_file', 'Open New Case File →', lang)}
                  </button>
                </div>
              )}

              {/* Quick 3-Pillar Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-amber-400">
                    {t('intro.rules.rule1_title', '01. Daily Action Dice', lang)}
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {renderFormattedRule(
                      t(
                        'intro.rules.rule1_desc',
                        'Roll 3–5 dice each cycle based on Composure. Preview exact [clean]6+ Clean[/clean], [comp]4–5 Compromised[/comp], or [blow]1–3 Blowback[/blow] odds before committing.',
                        lang
                      )
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-red-400">
                    {t('intro.rules.rule2_title', '02. Ticking Clocks', lang)}
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {renderFormattedRule(
                      t(
                        'intro.rules.rule2_desc',
                        'Complete [inv]Investigation Clocks[/inv] to unlock the Berth 14 Finale before daily [threat]Threat Clocks[/threat] trigger a TRT sweep.',
                        lang
                      )
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-cyan-400">
                    {t('intro.rules.rule3_title', '03. Load Shedding & Turf', lang)}
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {renderFormattedRule(
                      t(
                        'intro.rules.rule3_desc',
                        'Stage 6 blackouts cut digital terminals (unless you burn R300 diesel) but grant [stealth]+2 stealth[/stealth] on harbour infiltrations.',
                        lang
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 0: THE 5-STORY CAMPAIGN SELECTOR */}
          {activeTab === 'campaign' && (
            <div className="space-y-6">
              {/* CAMPAIGN BANNER */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-purple-950/40 border border-amber-500/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>{t('campaign.banner_tag', 'THE MZANSI MIDNIGHT QUINTET // 5 CONNECTED CAMPAIGNS', lang)}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                      {t('campaign.banner_title', 'The Sovereign State Capture Conspiracy', lang)}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('main')}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                    >
                      {t('intro.back', '[Back to Main]', lang)}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {t(
                    'campaign.banner_desc',
                    'Five interconnected regional noir investigations spanning the Durban docks, the Johannesburg power grid, the Richtersveld diamond coast, the Table Mountain underworld, and the Drakensberg grand finale. Completing each chapter recovers a Classified Keystone Dossier that unlocks the subsequent provincial crucible.',
                    lang
                  )}
                </p>

                {/* PROGRESS TRACKER CHIPS */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-amber-500/50 text-amber-300 flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 uppercase">{t('campaign.stories_unlocked', 'Chapters Unlocked:', lang)}</span>
                    <span className="font-bold">{unlockedStoryCount} / 5</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-purple-500/50 text-purple-300 flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 uppercase">{t('campaign.keystones_secured', 'Keystones Secured:', lang)}</span>
                    <span className="font-bold">{collectedKeystoneCount} / 4</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                    progression.grandConspiracyBoardUnlocked
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-500'
                  }`}>
                    <span className="text-[10px] uppercase">{t('campaign.national_web', 'National Web:', lang)}</span>
                    <span className="font-bold">
                      {progression.grandConspiracyBoardUnlocked
                        ? t('campaign.web_unlocked', 'UNLOCKED', lang)
                        : t('campaign.web_locked', 'LOCKED (Beat 4 Chapters)', lang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 STORY CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAMPAIGN_STORIES.map((rawStory) => {
                  const story = getLocalizedStory(rawStory, lang);
                  const status = getStoryStatus(story.id, progression);
                  const isCompleted = status === 'completed';
                  const isUnlocked = status === 'unlocked' || isCompleted;
                  const hasKeystone = progression.collectedKeystones.includes(
                    story.keystoneDossierId
                  );
                  const isCurrentActive = story.id === activeStoryId;

                  const theme =
                    COLOR_THEMES[story.accentColor] || COLOR_THEMES.amber;

                  return (
                    <div
                      key={story.id}
                      onClick={() => {
                        if (isUnlocked) {
                          soundscape.playDieSelect();
                          handleSelectStory(story.id);
                        }
                      }}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                        isCurrentActive
                          ? `${theme.border} ${theme.bg} ring-2 ring-amber-400/80 shadow-2xl scale-[1.01] cursor-pointer`
                          : isUnlocked
                          ? `${theme.border} ${theme.bg} shadow-lg backdrop-blur-sm cursor-pointer hover:border-zinc-500 hover:scale-[1.005]`
                          : 'border-zinc-800 bg-zinc-950/60 opacity-65 cursor-not-allowed'
                      }`}
                    >
                      {/* CARD IMAGE & HEADER */}
                      <div>
                        <div className="relative h-32 w-full overflow-hidden border-b border-zinc-800/80 bg-zinc-950">
                          <img
                            src={story.imageArt}
                            alt={story.title}
                            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                              !isUnlocked ? 'grayscale contrast-125 brightness-50' : ''
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                          {/* TOP FLOATING BADGES */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-black/80 text-white border border-zinc-700">
                              {t('campaign.story_num', 'STORY 0{num}', lang).replace('{num}', String(story.number))}
                            </span>
                            {isCurrentActive && (
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-400 text-slate-950 shadow">
                                ● {t('campaign.active', 'ACTIVE', lang)}
                              </span>
                            )}
                            {isCompleted && !isCurrentActive && (
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/90 text-slate-950">
                                ✓ {t('campaign.completed', 'COMPLETED', lang)}
                              </span>
                            )}
                            {!isUnlocked && (
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-zinc-800/90 text-zinc-400 border border-zinc-700">
                                🔒 {t('campaign.locked', 'CLASSIFIED', lang)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CARD BODY CONTENT */}
                        <div className="p-4 space-y-2.5">
                          <div>
                            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              {story.region}
                            </div>
                            <h3 className={`text-base font-bold ${isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
                              {story.title}
                            </h3>
                            <div className={`text-xs font-medium ${theme.text}`}>
                              {story.subtitle}
                            </div>
                          </div>

                          <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                            {story.synopsis}
                          </p>

                          {/* HERO & DOCKET */}
                          <div className="pt-1.5 border-t border-zinc-800/60 font-mono text-[10px] space-y-1">
                            <div className="text-zinc-400 flex items-center justify-between">
                              <span>{t('campaign.protagonist', 'PROTAGONIST:', lang)}</span>
                              <span className="text-zinc-200 font-semibold">{story.protagonistName}</span>
                            </div>
                            <div className="text-zinc-400 flex items-center justify-between">
                              <span>{t('campaign.docket', 'DOCKET:', lang)}</span>
                              <span className="text-amber-400/90 truncate ml-2">{story.caseDocket}</span>
                            </div>
                          </div>

                          {/* KEYSTONE PREVIEW */}
                          <div className={`p-2 rounded-lg border font-mono text-[10px] ${
                            hasKeystone
                              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-1">
                                <span>★</span> {t('campaign.keystone_label', 'Keystone:', lang)}
                              </span>
                              {hasKeystone ? (
                                <span className="text-emerald-400 font-bold uppercase tracking-wider">
                                  ✓ {t('campaign.secured', 'SECURED', lang)}
                                </span>
                              ) : (
                                <span className="text-zinc-500 uppercase">
                                  {isUnlocked ? t('campaign.in_pursuit', 'IN PURSUIT', lang) : t('campaign.unrecovered', 'LOCKED', lang)}
                                </span>
                              )}
                            </div>
                            <div className="truncate text-zinc-300 mt-0.5">
                              {story.keystoneTitle}
                            </div>
                          </div>

                          {!isUnlocked && (
                            <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-start gap-1.5">
                              <span className="text-amber-400 shrink-0">🔒</span>
                              <span>{story.unlockConditionText}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CARD FOOTER BUTTONS */}
                      <div className="p-4 pt-0 flex items-center gap-2">
                        {story.isPlayable && isUnlocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundscape.playOutcome('clean');
                              handleSelectStory(story.id);
                              setActiveTab('new');
                            }}
                            className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer text-center ${
                              isCurrentActive
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            }`}
                          >
                            {isCompleted
                              ? t('campaign.replay_story', 'Replay Story →', lang)
                              : t('campaign.launch_operation', 'Launch Operation →', lang)}
                          </button>
                        ) : isUnlocked ? (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 text-zinc-400 font-mono text-[11px] font-medium uppercase tracking-wider border border-zinc-700 cursor-not-allowed text-center"
                          >
                            {t('campaign.story_pack_in_dev', 'In Development (Story Pack)', lang)}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 text-zinc-600 font-mono text-[11px] uppercase tracking-wider border border-zinc-800 cursor-not-allowed text-center"
                          >
                            🔒 {t('campaign.classified_locked', 'Classified / Locked', lang)}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundscape.playDieSelect();
                            setInspectedStory(story);
                          }}
                          className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs cursor-pointer transition-colors"
                          title={t('campaign.inspect_dossier', 'Inspect Story Dossier', lang)}
                        >
                          🔍
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* KEYSTONE DOSSIERS RIBBON */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      {t('campaign.keystones_ribbon_tag', 'CLASSIFIED EVIDENCE PASS-THROUGHS', lang)}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {t('campaign.keystones_ribbon_title', 'Cross-Story Keystone Dossiers', lang)}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">
                    {collectedKeystoneCount} / 4 {t('campaign.recovered', 'Recovered', lang)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.values(KEYSTONE_DOSSIERS).map((rawKeystone) => {
                    const keystone = getLocalizedKeystone(rawKeystone, lang);
                    const isSecured = progression.collectedKeystones.includes(keystone.id);
                    return (
                      <button
                        key={keystone.id}
                        onClick={() => {
                          if (isSecured) {
                            soundscape.playDieSelect();
                            setInspectedKeystone(keystone);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSecured
                            ? 'bg-amber-950/20 border-amber-500/60 hover:border-amber-400 cursor-pointer shadow-sm'
                            : 'bg-zinc-950/70 border-zinc-800 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={isSecured ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                              {isSecured
                                ? t('campaign.secured_badge', '★ SECURED', lang)
                                : t('campaign.unrecovered_badge', '🔒 UNRECOVERED', lang)}
                            </span>
                            <span className="text-zinc-500">
                              {t('campaign.story_num', 'STORY 0{num}', lang).replace(
                                '{num}',
                                keystone.storyId.slice(6, 7)
                              )}
                            </span>
                          </div>
                          <div className={`text-xs font-semibold mt-1 ${isSecured ? 'text-white' : 'text-zinc-400'}`}>
                            {keystone.title}
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-zinc-400">
                          {isSecured ? (
                            <span className="text-emerald-400">
                              +1 {keystone.inheritedHeroStat.toUpperCase()} Carryover Bonus
                            </span>
                          ) : (
                            <span className="text-zinc-600">Requires beating Story 0{keystone.storyId.slice(6, 7)}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* VIEW 2: NEW GAME LAUNCHER & SLOT SELECTOR */}
          {activeTab === 'new' && (
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-amber-500/40 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                    {t('intro.new_setup_title', 'NEW INVESTIGATION SETUP', lang)}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    {t('intro.new_setup_subtitle', 'Select Target Case File Slot & Entry Mode', lang)}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('main')}
                  className="text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  {t('intro.back', '[Back]', lang)}
                </button>
              </div>

              {/* Target Save Slot Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-zinc-400">
                  {t('intro.choose_slot', '1. Choose Case File Storage Slot:', lang)}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MANUAL_SAVE_SLOT_IDS.map((slotId) => {
                    const existing = saveSlots[slotId];
                    const isSelected = selectedNewSlot === slotId;
                    return (
                      <button
                        key={slotId}
                        onClick={() => {
                          soundscape.playDieSelect();
                          setSelectedNewSlot(slotId);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-amber-300">
                            {SAVE_SLOT_LABELS[slotId]}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-bold">
                              {t('intro.slot_selected', 'SELECTED', lang)}
                            </span>
                          )}
                        </div>
                        {existing ? (
                          <div className="mt-2 text-[11px] font-mono text-zinc-400 space-y-0.5">
                            <div className="text-amber-200/90">
                              Overwrites: Cycle {existing.gameState.day} (R
                              {existing.gameState.cash})
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {t('intro.saved', 'Saved', lang)} {formatSavedTimestamp(existing.savedAt)}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] font-mono text-emerald-400/90">
                            {t('intro.empty_slot', '[Empty Slot — Ready]', lang)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Story Selector Bar */}
              <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-zinc-400">
                    {t('campaign.active_story_label', 'SELECT STORY / CHAPTER:', lang)}
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${storyTheme.text}`}>
                    {t('campaign.story_num', 'STORY 0{num}', lang).replace(
                      '{num}',
                      String(activeStory.number)
                    )}{' '}
                    // {activeStory.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  {CAMPAIGN_STORIES.map((s) => {
                    const status = getStoryStatus(s.id, progression);
                    const isUnlocked = status === 'unlocked' || status === 'completed';
                    const isSelected = s.id === activeStoryId;
                    const pillTheme = COLOR_THEMES[s.accentColor] || COLOR_THEMES.amber;
                    const localizedStory = getLocalizedStory(s, lang);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          soundscape.playDieSelect();
                          handleSelectStory(s.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? `${pillTheme.badge} ${pillTheme.border} font-bold shadow-md ring-1 cursor-pointer`
                            : isUnlocked
                            ? 'bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 cursor-pointer'
                            : 'bg-zinc-950/40 border border-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <span>{isUnlocked ? `0${s.number}` : '🔒'}</span>
                        <span>{localizedStory.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Entry Mode Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-zinc-400">
                    {t('intro.choose_mode', '2. Choose Investigation Launch Mode:', lang)}
                  </label>
                  <span className={`text-[10px] font-mono font-semibold ${storyTheme.text}`}>
                    {t('campaign.active_story_tag', 'ACTIVE: STORY 0{num} // {title}', lang)
                      .replace('{num}', String(activeStory.number))
                      .replace('{title}', activeStory.title.toUpperCase())}
                  </span>
                </div>

                {activeStoryId === 'story_5_octagon' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onStartNewGame(selectedNewSlot, 'octagon_prologue', 'story_5_octagon');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.25)] transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story5_prologue', 'Story 5: Interactive Prologue (Taskforce Lead) →', lang)}
                    </button>

                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        onStartNewGame(selectedNewSlot, 'octagon_map', 'story_5_octagon');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-rose-500/60 text-rose-200 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story5_map', 'Story 5: Quick-Start to National Map', lang)}
                    </button>
                  </div>
                ) : activeStoryId === 'story_4_cape' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onStartNewGame(selectedNewSlot, 'cape_prologue', 'story_4_cape');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story4_prologue', 'Story 4: Interactive Prologue (Leila Hendricks) →', lang)}
                    </button>

                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        onStartNewGame(selectedNewSlot, 'cape_map', 'story_4_cape');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-purple-500/60 text-purple-200 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story4_map', 'Story 4: Quick-Start to Cape Town Map', lang)}
                    </button>
                  </div>
                ) : activeStoryId === 'story_3_namaqua' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onStartNewGame(selectedNewSlot, 'namaqua_prologue', 'story_3_namaqua');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(249,115,22,0.25)] transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story3_prologue', 'Story 3: Interactive Prologue (Giepie Brand) →', lang)}
                    </button>

                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        onStartNewGame(selectedNewSlot, 'namaqua_map', 'story_3_namaqua');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-orange-500/60 text-orange-200 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story3_map', 'Story 3: Quick-Start to Namaqua Map', lang)}
                    </button>
                  </div>
                ) : activeStoryId === 'story_2_highveld' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onStartNewGame(selectedNewSlot, 'highveld_prologue', 'story_2_highveld');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story2_prologue', 'Story 2: Interactive Prologue (Bra K) →', lang)}
                    </button>

                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        onStartNewGame(selectedNewSlot, 'highveld_map', 'story_2_highveld');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-cyan-500/60 text-cyan-200 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_story2_map', 'Story 2: Quick-Start to Gauteng Map', lang)}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onStartNewGame(selectedNewSlot, 'prologue', 'story_1_ethekwini');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.25)] transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_act1_prologue', 'Act 1: Interactive Prologue →', lang)}
                    </button>

                    <button
                      onClick={() => {
                        soundscape.playDieSelect();
                        onStartNewGame(selectedNewSlot, 'act1_map', 'story_1_ethekwini');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_act1_map', 'Act 1: Quick-Start to Map', lang)}
                    </button>

                    <button
                      onClick={() => {
                        soundscape.playOutcome('clean');
                        onStartNewGame(selectedNewSlot, 'act2_map', 'story_1_ethekwini');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {t('intro.mode_act2_commission', 'Act 2: The Commission →', lang)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: LOAD GAME / MULTI-SLOT DOSSIER INSPECTOR */}
          {activeTab === 'load' && (
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                    {t('intro.load_header', 'SAVED CASE FILES // LOCAL STORAGE ARCHIVE', lang)}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    {t('intro.load_subtitle', 'Select a Saved Dossier to Resume', lang)}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('main')}
                  className="text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  {t('intro.back', '[Back]', lang)}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(
                  ['autosave', 'slot_1', 'slot_2', 'slot_3'] as SaveSlotId[]
                ).map((slotId) => {
                  const record = saveSlots[slotId];
                  const isConfirming = confirmDeleteSlot === slotId;

                  if (!record) {
                    return (
                      <div
                        key={slotId}
                        className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between min-h-[132px]"
                      >
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                          <span>{SAVE_SLOT_LABELS[slotId]}</span>
                          <span>{t('intro.slot_empty', 'EMPTY', lang)}</span>
                        </div>
                        <div className="text-xs text-zinc-500 my-2">
                          {t('intro.slot_no_data', 'No investigation data recorded in this slot.', lang)}
                        </div>
                        {slotId !== 'autosave' && (
                          <button
                            onClick={() => {
                              soundscape.playDieSelect();
                              setSelectedNewSlot(slotId);
                              setActiveTab('new');
                            }}
                            className="self-start text-[11px] font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
                          >
                            {t('intro.slot_start_new', '+ Start New File in Slot →', lang)}
                          </button>
                        )}
                      </div>
                    );
                  }

                  const gs = record.gameState;
                  return (
                    <div
                      key={slotId}
                      className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-700 hover:border-emerald-500/60 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-emerald-400 font-semibold">
                            {record.label}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {formatSavedTimestamp(record.savedAt)}
                          </span>
                        </div>

                        <div className="text-sm font-medium text-white">
                          Cycle {gs.day} —{' '}
                          {record.inPrologue
                            ? 'Prologue (Room 404)'
                            : NODE_DISPLAY_NAMES[gs.currentNodeId] ||
                              'District Map'}
                        </div>

                        <div className="flex flex-wrap gap-2.5 text-[11px] font-mono text-zinc-300 pt-1">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300">
                            R{gs.cash.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/50 text-cyan-300">
                            {gs.composure}% {t('intro.comp_abbr', 'Comp', lang)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                            {gs.inventory.length} {t('intro.evidence_gear', 'Evidence/Gear', lang)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/50 border border-amber-700/50 text-amber-300">
                            Stage {gs.loadSheddingStage}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                        <button
                          onClick={() => {
                            soundscape.playOutcome('clean');
                            onLoadSaveSlot(record);
                          }}
                          className="flex-1 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          {t('intro.load_dossier_btn', 'Load Dossier →', lang)}
                        </button>

                        {!isConfirming ? (
                          <button
                            onClick={() => {
                              soundscape.playDieSelect();
                              setConfirmDeleteSlot(slotId);
                            }}
                            className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/60 text-zinc-400 hover:text-red-300 font-mono text-[11px] cursor-pointer"
                          >
                            {t('intro.delete', 'Delete', lang)}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                soundscape.playOutcome('failure');
                                onDeleteSaveSlot(slotId);
                                setConfirmDeleteSlot(null);
                              }}
                              className="px-2.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] font-semibold cursor-pointer"
                            >
                              {t('intro.confirm', 'Confirm', lang)}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSlot(null)}
                              className="px-2 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-[11px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3B: CASE ARCHIVE & ENDINGS GALLERY (PHASE 13) */}
          {activeTab === 'archive' && (
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-purple-500/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-purple-400">
                    {t(
                      'intro.archive_header_fmt',
                      'CLASSIFIED EPILOGUE ARCHIVE // {count} OF {total} TIMELINES UNLOCKED ({pct}%)',
                      lang
                    )
                      .replace('{count}', String(unlockedEndingCount))
                      .replace('{total}', String(ALL_ENDING_IDS.length))
                      .replace(
                        '{pct}',
                        String(
                          Math.round(
                            (unlockedEndingCount / ALL_ENDING_IDS.length) * 100
                          )
                        )
                      )}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    {t(
                      'intro.archive_subtitle',
                      'Completed Case File Outcomes (Stories 1–5)',
                      lang
                    )}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('main')}
                  className="text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  [Back]
                </button>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-400 transition-all duration-500"
                  style={{
                    width: `${(unlockedEndingCount / ALL_ENDING_IDS.length) * 100}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_ENDING_IDS.map((endId, idx) => {
                  const endingDef = ALL_CAMPAIGN_ENDINGS[endId];
                  const record = unlockedEndings[endId];

                  return (
                    <div
                      key={endId}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                        record
                          ? 'bg-zinc-950/90 border-purple-500/50 hover:border-purple-400'
                          : 'bg-zinc-950/40 border-zinc-800/70 opacity-75'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                          <span
                            className={
                              record ? 'text-purple-300' : 'text-zinc-500'
                            }
                          >
                            {String(idx + 1).padStart(2, '0')} // {getEndingBadge(endId, lang)}{' '}
                          </span>
                          {record ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/50 text-emerald-300">
                              ✓ {t('ui.unlocked', 'UNLOCKED', lang)}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                              {t('ui.classified', 'REDACTED', lang)}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-white">
                          {record
                            ? t(
                                `ending.${endId}.title`,
                                endingDef?.title || endId,
                                lang
                              )
                            : t(
                                'intro.classified_outcome',
                                'Classified Case Outcome',
                                lang
                              )}
                        </h3>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {record
                            ? t(
                                `ending.${endId}.quote`,
                                endingDef?.summaryQuote || '',
                                lang
                              )
                            : t(
                                `ending_hint.${endId}`,
                                ENDING_UNLOCK_HINTS[endId],
                                lang
                              )}
                        </p>
                      </div>

                      {record && (
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 font-mono text-[10px]">
                          <div className="text-zinc-400">
                            {t('ui.cycle', 'Cycle', lang)} {record.cyclesSurvived} • R
                            {record.closingCash.toLocaleString()} •{' '}
                            {formatSavedTimestamp(record.unlockedAt)}
                          </div>
                          <button
                            onClick={() => {
                              soundscape.playDieSelect();
                              setInspectedEndingId(endId);
                            }}
                            className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/50 text-purple-200 uppercase tracking-wider cursor-pointer shrink-0"
                          >
                            {t('ui.read_epilogue', 'Read Epilogue →', lang)}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: COMPREHENSIVE HELP, MECHANICS & FAQ MANUAL */}
          {activeTab === 'briefing' && (
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/85 border border-cyan-500/40 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                    OPERATIONAL MANUAL &amp; PLAYER FAQ // ETHEKWINI-GOLD
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Complete Guide: Objectives, Power-Ups, Survival &amp; Endings
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('main')}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                >
                  [Back to Menu]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PILLAR 1: OBJECTIVES & IN-GAME HINTS */}
                <div className="p-4 rounded-xl bg-zinc-950/85 border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-amber-400">
                    01 // Objective &amp; How to Move Forward
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    What is the Goal &amp; How Do I Know What to Do?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                    <li>
                      • <strong className="text-amber-300">Act 1 Goal:</strong>{' '}
                      Expose <strong>Docket #409</strong> (a R400m municipal
                      water-tanker tender secretly hauling meth precursors from
                      Pier 2) before SAPS TRT raids your flat or witness
                      Constable Nandi dies.
                    </li>
                    <li>
                      • <strong className="text-purple-300">Act 2 Goal:</strong>{' '}
                      Unmask the <strong>Sovereign Pearl Trust</strong> and{' '}
                      <strong>Midlands Super-Lab</strong> to intercept the
                      syndicate’s Gulfstream jet (<em>Flight ZS-900</em>) at
                      King Shaka Hangar 7.
                    </li>
                    <li>
                      • <strong className="text-cyan-300">Live Guidance:</strong>{' '}
                      The <strong>Objective Tracker</strong> above the map shows
                      your 3-step progress and a{' '}
                      <span className="text-amber-300 font-mono">
                        [Show Slot →]
                      </span>{' '}
                      button that jumps straight to your best next move. Target
                      slots pulse with a{' '}
                      <span className="text-amber-300 font-mono">
                        ★ Recommended
                      </span>{' '}
                      badge, and the top{' '}
                      <span className="text-red-300 font-mono">◈ BOARD</span>{' '}
                      button maps all red-string clues.
                    </li>
                  </ul>
                </div>

                {/* PILLAR 2: PROGRESSION & DICE MATH */}
                <div className="p-4 rounded-xl bg-zinc-950/85 border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-cyan-400">
                    02 // Game Progression &amp; Dice Math
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    How Do Cycles, Rolls &amp; Clocks Advance?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                    <li>
                      • <strong className="text-cyan-300">Daily Dice:</strong>{' '}
                      You roll 3–5 <span className="font-mono">d6</span> dice
                      each day based on <strong>Composure</strong> (80%+ = 5
                      dice, 40–79% = 4 dice, &lt;40% = 3 dice).
                    </li>
                    <li>
                      • <strong className="text-emerald-300">Roll Math:</strong>{' '}
                      <span className="font-mono">
                        Final Roll = Die + Stat + Stage 6 Bonus - Hostile Turf
                      </span>
                      . Selecting a die previews exact outcomes:{' '}
                      <span className="text-emerald-400">6+ Clean (+2)</span>,{' '}
                      <span className="text-amber-400">4–5 Compromised (+1)</span>
                      , or <span className="text-red-400">1–3 Blowback</span>.
                    </li>
                    <li>
                      • <strong className="text-amber-300">Unlocking Nodes:</strong>{' '}
                      Filling 4-segment Investigation Clocks at your Safehouse or
                      Cyber-Pawn decodes key exhibits and unlocks Fog-of-War
                      locations. Click{' '}
                      <span className="font-mono text-amber-300">
                        End Cycle →
                      </span>{' '}
                      when out of dice to sleep and rotate Load Shedding.
                    </li>
                  </ul>
                </div>

                {/* PILLAR 3: CURRENCY & POWER-UPS */}
                <div className="p-4 rounded-xl bg-zinc-950/85 border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-emerald-400">
                    03 // Currency (Rands) &amp; Power-Ups
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    How Do Money, Gear &amp; Perks Work?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                    <li>
                      • <strong className="text-emerald-300">Earning &amp; Spending Rands:</strong>{' '}
                      Earn <span className="font-mono">R300–R5,000</span> via
                      street hustle slots or <span className="font-mono">0-Die</span>{' '}
                      NPC interrogations (<span className="font-mono">Speak with Contact</span>).
                      Spend Rands on trauma surgery, roadblock bribes, or{' '}
                      <strong>Stage 6 Generator Diesel (R300)</strong>.
                    </li>
                    <li>
                      • <strong className="text-cyan-300">Black-Market Gear (Permanent):</strong>{' '}
                      Buy hardware at Cyber-Pawn, Taxi Rank, or The Ridge (
                      <span className="font-mono">R900–R1,300</span>, 0 Dice) for
                      permanent <strong className="text-white">+1 Stat</strong>{' '}
                      and Composure upgrades that carry into Act 2 &amp; NG+.
                    </li>
                    <li>
                      • <strong className="text-amber-300">1/Day Faction Perks:</strong>{' '}
                      Earn <span className="font-mono">Rep &ge; +1/+2</span> to
                      unlock daily tactical calls: flip Load Shedding on demand,
                      scrub <span className="font-mono">-2 Heat</span>, or
                      upgrade your lowest die to a <span className="font-mono">6</span>.
                    </li>
                  </ul>
                </div>

                {/* PILLAR 4: CHARACTER DEATH & GAME OVER */}
                <div className="p-4 rounded-xl bg-zinc-950/85 border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-red-400">
                    04 // Elimination, Death &amp; Game Over
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    Can Characters Die or Trigger a Game Over?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                    <li>
                      • <strong className="text-red-300">Constable Nandi’s Wound (0/4):</strong>{' '}
                      Ticks <span className="font-mono">+1</span> every midnight.
                      If it hits <span className="font-mono">4/4</span> and you
                      cannot pay Dr. Maharaj (<span className="font-mono">R1,500</span>),
                      she is seized by SAPS hospital guards.
                    </li>
                    <li>
                      • <strong className="text-red-300">Player Elimination (Game Over):</strong>{' '}
                      If <em>Mokoena’s Sweep (0/6)</em> or the Act 2{' '}
                      <em>Izinkabi Hit Squad (0/6)</em> fills—or the finale clock
                      expires before you decode any evidence—you suffer a fatal
                      Game Over (<strong>Missing in the Blackout</strong> or{' '}
                      <strong>Submerged at Berth 14</strong>).
                    </li>
                    <li>
                      • <strong className="text-amber-300">0% Composure Breakdown:</strong>{' '}
                      Dropping to 0% Composure triggers a <em>Blackout Paranoia</em>{' '}
                      crisis costing a die or cash to recover.
                    </li>
                  </ul>
                </div>

                {/* PILLAR 5: HOW TO WIN & TWO-ACT CAMPAIGN */}
                <div className="p-4 rounded-xl bg-zinc-950/85 border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-purple-400">
                    05 // How to Win &amp; Act 1 &rarr; Act 2
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    How Does the Story Climax &amp; Continue?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                    <li>
                      • <strong className="text-amber-300">Winning Act 1 (3 Paths):</strong>{' '}
                      Once you hold the <em>Decoded Tanker Ledger</em> or{' '}
                      <em>Berth 14 Manifest</em>, launch the{' '}
                      <strong>Berth 14 Finale</strong> to win via the{' '}
                      <strong>Vigilante</strong> (burn the convoy),{' '}
                      <strong>Whistleblower</strong> (national broadcast), or{' '}
                      <strong>Kingpin</strong> (20% cartel cut) ending.
                    </li>
                    <li>
                      • <strong className="text-emerald-300">Continuing to Act 2:</strong>{' '}
                      Any surviving Act 1 ending unlocks{' '}
                      <strong>Continue to Act 2: The Commission →</strong>,
                      carrying over your Stats, Cash, Faction Rep, Gear, and a
                      Legacy Dossier bonus into 5 new Upper-Ridge &amp; Midlands
                      nodes leading to the <strong>Hangar 7 Grand Finale</strong>.
                    </li>
                  </ul>
                </div>

                {/* PILLAR 6: REPLAYABILITY, NEW GAME+ & RANKINGS */}
                <div className="p-4 rounded-xl bg-zinc-950/85 border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-amber-300">
                    06 // Replayability, New Game+ &amp; Rankings
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    What Happens After Act 2? Are There Rankings?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                    <li>
                      • <strong className="text-purple-300">New Game+ Loop:</strong>{' '}
                      Beating Act 2 unlocks{' '}
                      <strong>New Game+ (Keep Gear &amp; +R1,000)</strong>,
                      letting you replay with your full hardware arsenal and
                      veteran stats to unlock all{' '}
                      <strong>
                        {ALL_ENDING_IDS.length}/{ALL_ENDING_IDS.length}{' '}
                        {t('intro.case_endings', 'Case Endings', lang)}
                      </strong>{' '}
                      in the Archive tab.
                    </li>
                    <li>
                      • <strong className="text-amber-300">eThekwini Fixer Leaderboard &amp; Badges:</strong>{' '}
                      Every completed run calculates your{' '}
                      <strong>Fixer Operational Score</strong> (
                      <span className="font-mono">S-Rank</span> to{' '}
                      <span className="font-mono">C-Rank</span>), ranks you
                      against the <strong>Global Operative Percentile</strong>{' '}
                      and syndicate benchmarks (Van der Merwe, Zuko, Sparks), and
                      awards <strong>6 Tactical Commendation Badges</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD FOOTER: VERSION, COPYRIGHT & PRIVACY POLICY */}
        <div className="px-4 sm:px-6 py-3 bg-zinc-900/90 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 text-[10px] sm:text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">v0.1.0</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">Mzansi Midnight</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-500 hidden sm:inline">A South African Noir RPG</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundscape.playDieSelect();
                setIsPlayTesterOpen(true);
              }}
              className="text-emerald-400/90 hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Google Play Store (Android)</span>
              <span className="text-[10px]">↗</span>
            </button>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400/90 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Privacy Policy &amp; POPIA Notice</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* ARCHIVED EPILOGUE READER MODAL */}
      {inspectedEndingId && ALL_CAMPAIGN_ENDINGS[inspectedEndingId] && (() => {
        const rawEnding = ALL_CAMPAIGN_ENDINGS[inspectedEndingId];
        const ending = getLocalizedEnding(rawEnding, lang);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-purple-500/60 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
              <div className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
                <div className="font-mono text-xs uppercase tracking-wider text-purple-300">
                  {ending.pathLabel}
                </div>
                <button
                  onClick={() => {
                    soundscape.playDieSelect();
                    setInspectedEndingId(null);
                  }}
                  className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4">
                <div>
                  <div className="font-mono text-xs text-amber-400">
                    {ending.subtitle}
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-0.5">
                    {ending.title}
                  </h3>
                  <p className="mt-2 text-xs italic text-zinc-300 border-l-2 border-purple-500/60 pl-3">
                    {ending.summaryQuote}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-zinc-200 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  {ending.epilogueParagraphs.map(
                    (p, i) => (
                      <p key={i}>{p}</p>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ending.cityAftermath.map(
                    (af, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800"
                      >
                        <div className="text-xs font-semibold text-purple-300">
                          {af.heading}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {af.detail}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* STORY BRIEFING DOSSIER MODAL */}
      {inspectedStory && (() => {
        const story = getLocalizedStory(inspectedStory, lang);
        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-amber-500/60 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
              {/* MODAL HEADER */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-950 border-b border-zinc-800">
                <img
                  src={story.imageArt}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <button
                  onClick={() => {
                    soundscape.playDieSelect();
                    setInspectedStory(null);
                  }}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded border border-zinc-700 bg-black/80 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    <span>
                      {t('campaign.story_num', 'STORY 0{num}', lang).replace(
                        '{num}',
                        String(story.number)
                      )}
                    </span>
                    <span>•</span>
                    <span>{story.caseDocket}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {story.title}
                  </h3>
                  <div className="text-xs text-amber-300 font-medium">
                    {story.subtitle} — {story.region}
                  </div>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                    {t('campaign.modal_synopsis', 'OPERATIONAL SYNOPSIS', lang)}
                  </div>
                  <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                    {story.synopsis}
                  </p>
                </div>

                {/* PROTAGONIST & ERA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono space-y-1">
                    <div className="text-[10px] text-zinc-400 uppercase">
                      {t('campaign.modal_protagonist', 'PROTAGONIST DOSSIER', lang)}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {story.protagonistName}
                    </div>
                    <div className="text-[11px] text-amber-400">
                      {story.protagonistRole}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono space-y-1">
                    <div className="text-[10px] text-zinc-400 uppercase">
                      {t('campaign.modal_era', 'TIMELINE & STRUCTURE', lang)}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {story.era}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {story.region}
                    </div>
                  </div>
                </div>

                {/* REGIONAL MECHANICS */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
                    {t('campaign.modal_mechanics', 'REGIONAL OPERATIONAL MECHANICS', lang)}
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    {story.regionalMechanic}
                  </p>
                </div>

                {/* FACTIONS */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                    {t('campaign.modal_factions', 'LOCAL THEATRE FACTIONS', lang)}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {story.factions.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* KEYSTONE TARGET */}
                <div className="p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/50 space-y-1">
                  <div className="font-mono text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                    ★ {t('campaign.modal_keystone_target', 'KEYSTONE EXTRACTION TARGET', lang)}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {story.keystoneTitle}
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {story.keystoneSummary}
                  </p>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-400">
                  {story.isPlayable
                    ? 'Ready to infiltrate.'
                    : story.unlockConditionText}
                </span>
                {story.isPlayable ? (
                  <button
                    onClick={() => {
                      soundscape.playOutcome('clean');
                      handleSelectStory(story.id);
                      setInspectedStory(null);
                      setActiveTab('new');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    {t('campaign.launch_operation', 'Launch Operation →', lang)}
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-500 font-mono text-xs cursor-not-allowed border border-zinc-700"
                  >
                    {t('campaign.locked', 'Classified / Locked', lang)}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* KEYSTONE DOSSIER INSPECTOR MODAL */}
      {inspectedKeystone && (() => {
        const keystone = getLocalizedKeystone(inspectedKeystone, lang);
        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-purple-500/60 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
              <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
                <div className="font-mono text-xs uppercase tracking-wider text-purple-300 font-bold">
                  {keystone.classification}
                </div>
                <button
                  onClick={() => {
                    soundscape.playDieSelect();
                    setInspectedKeystone(null);
                  }}
                  className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <div>
                  <div className="font-mono text-xs text-amber-400">
                    {keystone.sourceLabel}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {keystone.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                    {keystone.summary}
                  </p>
                </div>

                {/* FORENSIC EXCERPTS */}
                <div className="space-y-2 bg-black/60 p-4 rounded-xl border border-zinc-800 font-mono text-xs">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1">
                    EXCERPT TRANSCRIPT // UNREDACTED EVIDENCE
                  </div>
                  {keystone.documentExcerpt.map((ex, i) => (
                    <p key={i} className="text-amber-200/90 leading-relaxed italic">
                      "{ex}"
                    </p>
                  ))}
                </div>

                {/* GAMEPLAY CARRYOVER BENEFIT */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-1 font-mono text-xs">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider">
                    ★ CAMPAIGN CARRYOVER ADVANTAGE
                  </div>
                  <div className="text-zinc-200">
                    {keystone.gameplayEffect}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onOpenProfile={() => {
          setIsLeaderboardOpen(false);
          setIsProfileOpen(true);
        }}
        userProfile={userProfile}
        lang={lang}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={(p) => setUserProfile(p)}
        lang={lang}
      />

      {/* Google Play Store Tester Modal */}
      <GooglePlayTesterModal
        isOpen={isPlayTesterOpen}
        onClose={() => setIsPlayTesterOpen(false)}
        defaultEmail={userProfile.email}
        lang={lang}
      />

      {/* Floating Quick-Menu Button (Mobile Only when viewing sub-tab) */}
      {activeTab !== 'main' && (
        <div className="fixed bottom-4 right-4 z-40 md:hidden">
          <button
            onClick={() => {
              soundscape.playDieSelect();
              tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-3.5 py-2 rounded-full bg-zinc-900/95 text-amber-300 border border-amber-500/50 shadow-2xl font-mono text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>↑</span>
            <span>{t('intro.menu_top', 'Menu Top', lang)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

