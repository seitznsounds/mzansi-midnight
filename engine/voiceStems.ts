'use client';

import { SupportedLanguage } from '../types/settings';

export type EarconType =
  | 'radio_squelch'
  | 'police_chirp'
  | 'modem_burst'
  | 'typewriter_strike'
  | 'luxury_chime'
  | 'harbor_bell'
  | 'cape_flats_whistle'
  | 'scrambler_uplink'
  | 'folder_snap';

export interface ContactVoiceProfile {
  id: string;
  name: string;
  nativeGreeting: string; // e.g. "Sho", "Heita", "Aweh", "Dumela", "Sawubona", "Môre"
  earcon: EarconType;
  basePitch: number; // Fundamental F0 frequency in Hz (e.g. 100Hz baritone, 220Hz female)
  formantF1: number; // First vowel formant (throat cavity)
  formantF2: number; // Second vowel formant (oral cavity)
  durationSec: number;
  transcription: string; // What the character sounds like
}

// -----------------------------------------------------------------------------
// CONTACT VOICE REGISTRY (Stories 1 through 5)
// -----------------------------------------------------------------------------
export const CONTACT_VOICE_PROFILES: Record<string, ContactVoiceProfile> = {
  // Story 1: eThekwini-Gold
  nandi: {
    id: 'nandi',
    name: 'Constable Nandi',
    nativeGreeting: 'Sbu...',
    earcon: 'radio_squelch',
    basePitch: 220,
    formantF1: 450,
    formantF2: 2100,
    durationSec: 0.38,
    transcription: 'Tense tactical whisper // "Sbu..."',
  },
  bheki: {
    id: 'bheki',
    name: 'Bra Bheki',
    nativeGreeting: 'Sho, mfowethu',
    earcon: 'folder_snap',
    basePitch: 105,
    formantF1: 480,
    formantF2: 950,
    durationSec: 0.42,
    transcription: 'Deep street baritone // "Sho"',
  },
  mokoena: {
    id: 'mokoena',
    name: 'Brigadier Mokoena',
    nativeGreeting: 'Hawu...',
    earcon: 'police_chirp',
    basePitch: 115,
    formantF1: 750,
    formantF2: 1100,
    durationSec: 0.45,
    transcription: 'Authoritative TRT command // "Hawu"',
  },
  masibi: {
    id: 'masibi',
    name: 'Councillor Ma-Sibi Khumalo',
    nativeGreeting: 'Sawubona',
    earcon: 'luxury_chime',
    basePitch: 195,
    formantF1: 820,
    formantF2: 1350,
    durationSec: 0.52,
    transcription: 'Silky diplomatic greeting // "Sawubona"',
  },
  sparks: {
    id: 'sparks',
    name: 'Sparks',
    nativeGreeting: "Signal's live",
    earcon: 'modem_burst',
    basePitch: 155,
    formantF1: 320,
    formantF2: 2250,
    durationSec: 0.36,
    transcription: 'Fast cyberpunk chatter // "Hot Signal"',
  },
  zuko: {
    id: 'zuko',
    name: 'Zuko Ndlovu',
    nativeGreeting: 'Heita',
    earcon: 'radio_squelch',
    basePitch: 98,
    formantF1: 520,
    formantF2: 1750,
    durationSec: 0.46,
    transcription: 'Harbour kingpin drawl // "Heita"',
  },
  vandermerwe: {
    id: 'vandermerwe',
    name: 'Colonel van der Merwe',
    nativeGreeting: 'Middag',
    earcon: 'typewriter_strike',
    basePitch: 110,
    formantF1: 490,
    formantF2: 1400,
    durationSec: 0.4,
    transcription: 'Gruff Hawks veteran // "Middag"',
  },

  // Story 2: Highveld-Chrome
  bra_k: {
    id: 'bra_k',
    name: 'Kagiso "Bra K" Molefe',
    nativeGreeting: 'Dumela',
    earcon: 'folder_snap',
    basePitch: 125,
    formantF1: 360,
    formantF2: 850,
    durationSec: 0.42,
    transcription: 'Precise forensic auditor // "Dumela"',
  },
  khumalo: {
    id: 'khumalo',
    name: 'Advocate Nomsa Khumalo',
    nativeGreeting: 'Agee',
    earcon: 'luxury_chime',
    basePitch: 210,
    formantF1: 780,
    formantF2: 1280,
    durationSec: 0.45,
    transcription: 'Sharp advocate courtroom greeting // "Agee"',
  },
  vusi: {
    id: 'vusi',
    name: 'Vusi Sithole',
    nativeGreeting: 'Heita da',
    earcon: 'police_chirp',
    basePitch: 130,
    formantF1: 510,
    formantF2: 1720,
    durationSec: 0.38,
    transcription: 'Township wiretapper // "Heita da"',
  },

  // Story 3: Namaqua-Diamond
  bettie: {
    id: 'bettie',
    name: 'Tannie Bettie van Zyl',
    nativeGreeting: 'Môre, seun',
    earcon: 'harbor_bell',
    basePitch: 185,
    formantF1: 520,
    formantF2: 1050,
    durationSec: 0.5,
    transcription: 'Warm coastal matriarch // "Môre"',
  },
  swartbooi: {
    id: 'swartbooi',
    name: 'Swartbooi Witbooi',
    nativeGreeting: 'Goeiedag',
    earcon: 'radio_squelch',
    basePitch: 110,
    formantF1: 420,
    formantF2: 1100,
    durationSec: 0.44,
    transcription: 'Desert runner tracker // "Goeiedag"',
  },
  petrov: {
    id: 'petrov',
    name: 'Colonel Yuri Petrov',
    nativeGreeting: 'Petrov here',
    earcon: 'police_chirp',
    basePitch: 95,
    formantF1: 400,
    formantF2: 1300,
    durationSec: 0.42,
    transcription: 'Steely naval privateer // "Petrov"',
  },

  // Story 4: Cape-Nocturne
  ronnie: {
    id: 'ronnie',
    name: 'Pastor Ronnie Jacobs',
    nativeGreeting: 'Aweh, my broe',
    earcon: 'cape_flats_whistle',
    basePitch: 120,
    formantF1: 760,
    formantF2: 1250,
    durationSec: 0.48,
    transcription: 'Cape Flats street truce // "Aweh"',
  },
  rossouw: {
    id: 'rossouw',
    name: 'Zack "The Bull" Rossouw',
    nativeGreeting: 'Wat soek jy?',
    earcon: 'folder_snap',
    basePitch: 100,
    formantF1: 580,
    formantF2: 980,
    durationSec: 0.42,
    transcription: 'Bouncer shakedown rasp // "Wat soek jy?"',
  },
  claudine: {
    id: 'claudine',
    name: 'Baroness Claudine de Villiers',
    nativeGreeting: 'Bonsoir',
    earcon: 'luxury_chime',
    basePitch: 230,
    formantF1: 510,
    formantF2: 1850,
    durationSec: 0.45,
    transcription: 'Winelands aristocratic chill // "Bonsoir"',
  },

  // Story 5: Sovereign Octagon
  taskforce: {
    id: 'taskforce',
    name: 'Hawks Taskforce Commander',
    nativeGreeting: 'Protocol verified',
    earcon: 'scrambler_uplink',
    basePitch: 135,
    formantF1: 480,
    formantF2: 1950,
    durationSec: 0.55,
    transcription: 'Bunker encrypted scrambler // "Protocol Verified"',
  },
};

export const NODE_TO_VOICE_PROFILE_MAP: Record<string, string> = {
  // Story 1: eThekwini-Gold
  n1_safehouse: 'nandi',
  n2_taxi_rank: 'bheki',
  n3_central_precinct: 'mokoena',
  n4_city_hall: 'masibi',
  n5_cyber_pawn: 'sparks',
  n6_pier2_port: 'zuko',
  n7_archive_basement: 'vandermerwe',
  n8_ridge_penthouses: 'masibi',
  n9_township_depot: 'bheki',
  n10_high_court: 'vandermerwe',
  n11_citrus_estate: 'zuko',
  n12_cargo_apron: 'mokoena',

  // Story 2: Highveld-Chrome
  h1_braamfontein_safehouse: 'bra_k',
  h2_sandton_tower: 'khumalo',
  h3_hillbrow_substation: 'vusi',
  h4_witwatersrand_shaft: 'bra_k',
  h5_union_buildings: 'taskforce',
  h6_kendon_coal_depot: 'vusi',
  h7_siu_headquarters: 'khumalo',

  // Story 3: Namaqua-Diamond
  d1_port_nolloth_jetty: 'bettie',
  d2_alexander_bay_quarry: 'bettie',
  d3_richtersveld_canyon: 'swartbooi',
  d4_debeers_ghost_mine: 'swartbooi',
  d5_orange_river_pont: 'swartbooi',
  d6_aegis_coastal_compound: 'petrov',
  d7_springbok_magistrate: 'bettie',

  // Story 4: Cape-Nocturne
  c1_long_street_strip: 'rossouw',
  c1_bo_kaap_safehouse: 'ronnie',
  c2_manenberg_tenements: 'ronnie',
  c2_long_street_club: 'rossouw',
  c3_camps_bay_promenade: 'claudine',
  c4_table_bay_container_berth: 'ronnie',
  c4_stellenbosch_estate: 'claudine',
  c5_stellenbosch_wine_estate: 'claudine',
  c6_agu_safehouse_ruin: 'rossouw',
  c7_provincial_police_hq: 'rossouw',

  // Story 5: Sovereign Octagon
  o1_drakensberg_bunker: 'taskforce',
  o2_union_buildings_subbasement: 'taskforce',
  o3_apollo_grid_command: 'sparks',
  o4_durban_berth_command: 'bheki',
  o5_karoo_airspace_corridor: 'taskforce',
  o6_waterkloof_command: 'taskforce',
  o7_octagon_summit: 'taskforce',
};

/**
 * Resolves a contact identifier from arbitrary dialogue or node keys
 */
export function resolveContactVoiceProfile(contactOrNodeId: string): ContactVoiceProfile {
  const rawKey = contactOrNodeId.toLowerCase().trim();

  // 1. Exact node map lookup
  if (NODE_TO_VOICE_PROFILE_MAP[rawKey]) {
    const profileKey = NODE_TO_VOICE_PROFILE_MAP[rawKey];
    if (CONTACT_VOICE_PROFILES[profileKey]) {
      return CONTACT_VOICE_PROFILES[profileKey];
    }
  }

  // 2. Exact contact profile key lookup
  if (CONTACT_VOICE_PROFILES[rawKey]) {
    return CONTACT_VOICE_PROFILES[rawKey];
  }

  // 3. Substring / fuzzy match across keys and names
  const normalized = rawKey.replace(/^(n|h|d|c|o)\d+_/, '');

  for (const [key, profile] of Object.entries(CONTACT_VOICE_PROFILES)) {
    if (
      normalized.includes(key) ||
      rawKey.includes(key) ||
      profile.name.toLowerCase().includes(normalized) ||
      profile.name.toLowerCase().includes(rawKey)
    ) {
      return profile;
    }
  }

  // Fallback profile
  return {
    id: contactOrNodeId,
    name: 'Contact Informant',
    nativeGreeting: 'Heita',
    earcon: 'radio_squelch',
    basePitch: 120,
    formantF1: 500,
    formantF2: 1500,
    durationSec: 0.4,
    transcription: 'Secure Radio Uplink // "Heita"',
  };
}

/**
 * Procedural Acoustic Earcon & Formant Voice Synthesizer
 * Uses Web Audio BiquadFilterNodes tuned to phonetic formant resonances (F1/F2).
 */
export function synthesizeVoiceStab(
  ctx: AudioContext,
  profile: ContactVoiceProfile,
  volume: number = 0.85
): void {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.35 * volume, now);
  master.connect(ctx.destination);

  // 1. SIGNATURE ACOUSTIC EARCON (Radio, Chime, Modem, Bell)
  playEarcon(ctx, profile.earcon, master, volume, now);

  // 2. PHONETIC FORMANT VOCAL STAB (Simulating vocal tract vowel acoustics)
  const voiceStartTime = now + 0.05;
  const duration = profile.durationSec;

  // Glottal source (sawtooth impulse wave with slight pitch-drop contour)
  const glottal = ctx.createOscillator();
  glottal.type = 'sawtooth';
  glottal.frequency.setValueAtTime(profile.basePitch, voiceStartTime);
  glottal.frequency.exponentialRampToValueAtTime(
    profile.basePitch * 0.88,
    voiceStartTime + duration
  );

  // Formant F1 Bandpass Filter (Pharyngeal throat cavity resonance)
  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(profile.formantF1, voiceStartTime);
  f1.Q.setValueAtTime(7.5, voiceStartTime);

  // Formant F2 Bandpass Filter (Oral mouth cavity resonance)
  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(profile.formantF2, voiceStartTime);
  f2.Q.setValueAtTime(8.5, voiceStartTime);

  // Voice Amplitude Envelope
  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0.0001, voiceStartTime);
  voiceGain.gain.linearRampToValueAtTime(0.25 * volume, voiceStartTime + 0.04);
  voiceGain.gain.exponentialRampToValueAtTime(0.001, voiceStartTime + duration);

  // Parallel formant routing
  glottal.connect(f1);
  glottal.connect(f2);
  f1.connect(voiceGain);
  f2.connect(voiceGain);
  voiceGain.connect(master);

  glottal.start(voiceStartTime);
  glottal.stop(voiceStartTime + duration + 0.05);
}

/**
 * Synthesizes signature contact earcons (radio chirp, typewriter strike, modem burst, etc.)
 */
function playEarcon(
  ctx: AudioContext,
  type: EarconType,
  dest: AudioNode,
  volume: number,
  now: number
): void {
  switch (type) {
    case 'radio_squelch': {
      // Tactile two-tone radio frequency click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);
      gain.gain.setValueAtTime(0.18 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.045);
      break;
    }

    case 'police_chirp': {
      // TRT blue-light electronic chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1180, now);
      osc.frequency.linearRampToValueAtTime(1650, now + 0.025);
      gain.gain.setValueAtTime(0.14 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }

    case 'modem_burst': {
      // 1200-baud cybernetic data burst
      [1200, 2400].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + idx * 0.02);
        gain.gain.setValueAtTime(0.09 * volume, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.02);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + idx * 0.02);
        osc.stop(now + (idx + 1) * 0.025);
      });
      break;
    }

    case 'typewriter_strike': {
      // Mechanical archive typewriter platen strike
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.03);
      gain.gain.setValueAtTime(0.25 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }

    case 'luxury_chime': {
      // High-floor glass penthouse elevator bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, now); // E6
      gain.gain.setValueAtTime(0.16 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.42);
      break;
    }

    case 'harbor_bell': {
      // Alexander Bay / Port Nolloth bronze fog bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(698.46, now); // F5
      gain.gain.setValueAtTime(0.2 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }

    case 'cape_flats_whistle': {
      // Cape Flats street corner whistle signal
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.linearRampToValueAtTime(1920, now + 0.04);
      osc.frequency.linearRampToValueAtTime(1550, now + 0.08);
      gain.gain.setValueAtTime(0.13 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.11);
      break;
    }

    case 'scrambler_uplink': {
      // Drakensberg bunker encrypted satellite handshake
      [880, 1760, 2640].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.015);
        gain.gain.setValueAtTime(0.1 * volume, now + i * 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.015 + 0.04);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + i * 0.015);
        osc.stop(now + i * 0.015 + 0.045);
      });
      break;
    }

    case 'folder_snap':
    default: {
      // Tactile dossier snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);
      gain.gain.setValueAtTime(0.16 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.045);
      break;
    }
  }
}
