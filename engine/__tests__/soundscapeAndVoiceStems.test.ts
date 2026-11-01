import { describe, it, expect } from 'vitest';
import {
  CONTACT_VOICE_PROFILES,
  resolveContactVoiceProfile,
  EarconType,
} from '../voiceStems';
import {
  REGIONAL_ATMOSPHERES,
  normalizeStoryId,
  soundscape,
} from '../soundscape';

describe('Phase 28: Multilingual Voice Stabs & Acoustic Earcons Registry', () => {
  const validEarcons: EarconType[] = [
    'radio_squelch',
    'police_chirp',
    'modem_burst',
    'typewriter_strike',
    'luxury_chime',
    'harbor_bell',
    'cape_flats_whistle',
    'scrambler_uplink',
    'folder_snap',
  ];

  it('1. All registered contact profiles have valid formant acoustic parameters', () => {
    const keys = Object.keys(CONTACT_VOICE_PROFILES);
    expect(keys.length).toBeGreaterThanOrEqual(16);

    for (const [key, profile] of Object.entries(CONTACT_VOICE_PROFILES)) {
      expect(profile.id).toBe(key);
      expect(profile.name.length).toBeGreaterThan(0);
      expect(profile.nativeGreeting.length).toBeGreaterThan(0);
      expect(profile.transcription.length).toBeGreaterThan(0);
      expect(validEarcons).toContain(profile.earcon);

      // Human fundamental pitch range F0: ~80Hz (bass) to ~260Hz (soprano)
      expect(profile.basePitch).toBeGreaterThanOrEqual(80);
      expect(profile.basePitch).toBeLessThanOrEqual(280);

      // Pharyngeal throat cavity formant F1: ~300Hz to ~900Hz
      expect(profile.formantF1).toBeGreaterThanOrEqual(250);
      expect(profile.formantF1).toBeLessThanOrEqual(950);

      // Oral mouth cavity formant F2: ~800Hz to ~2500Hz
      expect(profile.formantF2).toBeGreaterThanOrEqual(750);
      expect(profile.formantF2).toBeLessThanOrEqual(2600);

      // Vocal stab duration between 0.25s and 0.8s
      expect(profile.durationSec).toBeGreaterThanOrEqual(0.25);
      expect(profile.durationSec).toBeLessThanOrEqual(0.8);
    }
  });

  it('2. Fuzzy resolver maps Story 1 (eThekwini-Gold) nodes and IDs to key characters', () => {
    // Constable Nandi
    const nandiByNode = resolveContactVoiceProfile('n1_safehouse');
    expect(nandiByNode.id).toBe('nandi');
    expect(nandiByNode.nativeGreeting).toBe('Sbu...');
    expect(nandiByNode.earcon).toBe('radio_squelch');

    // Bra Bheki
    const bhekiByNode = resolveContactVoiceProfile('n2_taxi_rank');
    expect(bhekiByNode.id).toBe('bheki');
    expect(bhekiByNode.nativeGreeting).toBe('Sho, mfowethu');
    expect(bhekiByNode.earcon).toBe('folder_snap');

    // Brigadier Mokoena
    const mokoenaByNode = resolveContactVoiceProfile('n12_cargo_apron');
    expect(mokoenaByNode.id).toBe('mokoena');
    expect(mokoenaByNode.nativeGreeting).toBe('Hawu...');
    expect(mokoenaByNode.earcon).toBe('police_chirp');

    // Ma-Sibi Khumalo
    const masibi = resolveContactVoiceProfile('masibi');
    expect(masibi.id).toBe('masibi');
    expect(masibi.nativeGreeting).toBe('Sawubona');
    expect(masibi.earcon).toBe('luxury_chime');

    // Zuko Ndlovu
    const zukoByNode = resolveContactVoiceProfile('n11_citrus_estate');
    expect(zukoByNode.id).toBe('zuko');
    expect(zukoByNode.nativeGreeting).toBe('Heita');
  });

  it('3. Fuzzy resolver maps Story 2 (Highveld-Chrome) nodes and IDs correctly', () => {
    // Bra K
    const braK = resolveContactVoiceProfile('h1_braamfontein_safehouse');
    expect(braK.id).toBe('bra_k');
    expect(braK.nativeGreeting).toBe('Dumela');

    // Vusi Sithole
    const vusi = resolveContactVoiceProfile('h3_hillbrow_substation');
    expect(vusi.id).toBe('vusi');
    expect(vusi.nativeGreeting).toBe('Heita da');

    // Advocate Nomsa Khumalo
    const khumalo = resolveContactVoiceProfile('h7_siu_headquarters');
    expect(khumalo.id).toBe('khumalo');
    expect(khumalo.nativeGreeting).toBe('Agee');
  });

  it('4. Fuzzy resolver maps Story 3 (Namaqua-Diamond) nodes and IDs correctly', () => {
    // Tannie Bettie
    const bettie = resolveContactVoiceProfile('d1_port_nolloth_jetty');
    expect(bettie.id).toBe('bettie');
    expect(bettie.nativeGreeting).toBe('Môre, seun');
    expect(bettie.earcon).toBe('harbor_bell');

    // Swartbooi Witbooi
    const swartbooi = resolveContactVoiceProfile('d3_richtersveld_canyon');
    expect(swartbooi.id).toBe('swartbooi');
    expect(swartbooi.nativeGreeting).toBe('Goeiedag');

    // Colonel Petrov
    const petrov = resolveContactVoiceProfile('d6_aegis_coastal_compound');
    expect(petrov.id).toBe('petrov');
    expect(petrov.nativeGreeting).toBe('Petrov here');
  });

  it('5. Fuzzy resolver maps Story 4 (Cape-Nocturne) nodes and IDs correctly', () => {
    // Pastor Ronnie
    const ronnie = resolveContactVoiceProfile('c1_bo_kaap_safehouse');
    expect(ronnie.id).toBe('ronnie');
    expect(ronnie.nativeGreeting).toBe('Aweh, my broe');
    expect(ronnie.earcon).toBe('cape_flats_whistle');

    // Zack Rossouw
    const rossouw = resolveContactVoiceProfile('c2_long_street_club');
    expect(rossouw.id).toBe('rossouw');
    expect(rossouw.nativeGreeting).toBe('Wat soek jy?');

    // Baroness Claudine
    const claudine = resolveContactVoiceProfile('c4_stellenbosch_estate');
    expect(claudine.id).toBe('claudine');
    expect(claudine.nativeGreeting).toBe('Bonsoir');
  });

  it('6. Fuzzy resolver maps Story 5 (Sovereign Octagon) nodes and IDs correctly', () => {
    const taskforce = resolveContactVoiceProfile('o1_drakensberg_bunker');
    expect(taskforce.id).toBe('taskforce');
    expect(taskforce.nativeGreeting).toBe('Protocol verified');
    expect(taskforce.earcon).toBe('scrambler_uplink');
  });

  it('7. Fallback profile handles unknown node/contact IDs cleanly', () => {
    const fallback = resolveContactVoiceProfile('unknown_node_xyz');
    expect(fallback.id).toBe('unknown_node_xyz');
    expect(fallback.nativeGreeting).toBe('Heita');
    expect(fallback.earcon).toBe('radio_squelch');
    expect(fallback.formantF1).toBe(500);
    expect(fallback.formantF2).toBe(1500);
  });
});

describe('Phase 28: Regional Procedural Soundscapes & Web Audio Engine', () => {
  it('1. Story normalizer handles story keys, codes, and fallbacks cleanly', () => {
    expect(normalizeStoryId('story_1_ethekwini')).toBe('story_1_ethekwini');
    expect(normalizeStoryId('ethekwini-gold')).toBe('story_1_ethekwini');
    expect(normalizeStoryId('highveld')).toBe('story_2_highveld');
    expect(normalizeStoryId('story_2')).toBe('story_2_highveld');
    expect(normalizeStoryId('namaqua')).toBe('story_3_namaqua');
    expect(normalizeStoryId('story_3')).toBe('story_3_namaqua');
    expect(normalizeStoryId('cape-nocturne')).toBe('story_4_cape');
    expect(normalizeStoryId('story_4')).toBe('story_4_cape');
    expect(normalizeStoryId('octagon')).toBe('story_5_octagon');
    expect(normalizeStoryId('story_5')).toBe('story_5_octagon');
    expect(normalizeStoryId(undefined)).toBe('story_1_ethekwini');
    expect(normalizeStoryId('')).toBe('story_1_ethekwini');
  });

  it('2. All 5 regional soundscape profiles define distinct physical acoustics', () => {
    const stories = [
      'story_1_ethekwini',
      'story_2_highveld',
      'story_3_namaqua',
      'story_4_cape',
      'story_5_octagon',
    ];

    for (const storyId of stories) {
      const cfg = REGIONAL_ATMOSPHERES[storyId];
      expect(cfg).toBeDefined();
      expect(cfg.storyId).toBe(storyId);
      expect(cfg.name.length).toBeGreaterThan(0);

      // Noise frequency in realistic weather/ambient range
      expect(cfg.noiseFilterFreq).toBeGreaterThanOrEqual(100);
      expect(cfg.noiseFilterFreq).toBeLessThanOrEqual(1500);

      // Substation / industrial drone in sub-bass / low-frequency range
      expect(cfg.droneFreq).toBeGreaterThanOrEqual(30);
      expect(cfg.droneFreq).toBeLessThanOrEqual(120);

      // Sub drone in bass range
      expect(cfg.subDroneFreq).toBeGreaterThanOrEqual(30);
      expect(cfg.subDroneFreq).toBeLessThanOrEqual(150);
    }

    // Specific sonic signatures verify narrative grounding:
    // eThekwini has 55Hz Eskom hum
    expect(REGIONAL_ATMOSPHERES.story_1_ethekwini.droneFreq).toBe(55);
    // Highveld has lowpass thunder/mine rumble at 240Hz
    expect(REGIONAL_ATMOSPHERES.story_2_highveld.noiseFilterType).toBe('lowpass');
    // Cape has high Q resonant gale whistling
    expect(REGIONAL_ATMOSPHERES.story_4_cape.noiseFilterQ).toBeGreaterThanOrEqual(4.0);
    // Octagon has sub-bass Cold War drone at 38Hz
    expect(REGIONAL_ATMOSPHERES.story_5_octagon.droneFreq).toBe(38);
  });

  it('3. SoundscapeEngine supports regional switching, voice stabs, and blocked warnings', () => {
    expect(soundscape.getMuted()).toBe(false);

    soundscape.setRegionalAtmosphere('story_2_highveld', {
      loadSheddingStage: 6,
      adrenalineLevel: 4,
    });
    expect(soundscape.getCurrentStoryId()).toBe('story_2_highveld');

    soundscape.setRegionalAtmosphere('story_3_namaqua');
    expect(soundscape.getCurrentStoryId()).toBe('story_3_namaqua');

    // Play methods do not throw in node/headless environment
    expect(() => soundscape.playBlockedWarning()).not.toThrow();
    expect(() => soundscape.playRegionalStinger('story_1_ethekwini')).not.toThrow();
    expect(() => soundscape.playRegionalStinger('story_2_highveld')).not.toThrow();
    expect(() => soundscape.playRegionalStinger('story_3_namaqua')).not.toThrow();
    expect(() => soundscape.playRegionalStinger('story_4_cape')).not.toThrow();
    expect(() => soundscape.playRegionalStinger('story_5_octagon')).not.toThrow();

    const voice = soundscape.playContactVoiceStab('nandi');
    expect(voice.id).toBe('nandi');
    expect(voice.nativeGreeting).toBe('Sbu...');

    soundscape.setVolumes(60, 75);
    soundscape.setMuted(true);
    expect(soundscape.getMuted()).toBe(true);
    soundscape.setMuted(false);
  });
});

