'use client';

import { GameSettings, SupportedLanguage } from '../types/settings';
import { StoryId } from '../types/campaign';
import {
  ContactVoiceProfile,
  resolveContactVoiceProfile,
  synthesizeVoiceStab,
} from './voiceStems';

export interface RegionalAtmosphereConfig {
  storyId: string;
  name: string;
  noiseFilterType: BiquadFilterType;
  noiseFilterFreq: number; // Hz
  noiseFilterQ: number;
  noiseGain: number;
  droneType: OscillatorType;
  droneFreq: number; // Hz
  droneFilterFreq: number; // Hz
  droneGain: number;
  subDroneFreq: number; // Hz
  subDroneGain: number;
}

export const REGIONAL_ATMOSPHERES: Record<string, RegionalAtmosphereConfig> = {
  story_1_ethekwini: {
    storyId: 'story_1_ethekwini',
    name: 'eThekwini Coastal Subtropical & Port',
    noiseFilterType: 'bandpass',
    noiseFilterFreq: 950,
    noiseFilterQ: 0.7,
    noiseGain: 0.08,
    droneType: 'sawtooth',
    droneFreq: 55, // 55Hz Eskom substation transformer hum
    droneFilterFreq: 120,
    droneGain: 0.06,
    subDroneFreq: 110,
    subDroneGain: 0.03,
  },
  story_2_highveld: {
    storyId: 'story_2_highveld',
    name: 'Highveld Summer Thunder & Mine Hoist',
    noiseFilterType: 'lowpass',
    noiseFilterFreq: 240,
    noiseFilterQ: 1.2,
    noiseGain: 0.07,
    droneType: 'triangle',
    droneFreq: 88, // 88Hz industrial mine winch
    droneFilterFreq: 180,
    droneGain: 0.07,
    subDroneFreq: 44,
    subDroneGain: 0.05,
  },
  story_3_namaqua: {
    storyId: 'story_3_namaqua',
    name: 'Namaqua Desert Wind & Benguela Swell',
    noiseFilterType: 'bandpass',
    noiseFilterFreq: 480,
    noiseFilterQ: 1.8,
    noiseGain: 0.06,
    droneType: 'sine',
    droneFreq: 44, // 44Hz Atlantic Benguela oceanic swell
    droneFilterFreq: 90,
    droneGain: 0.08,
    subDroneFreq: 88,
    subDroneGain: 0.02,
  },
  story_4_cape: {
    storyId: 'story_4_cape',
    name: 'Cape Doctor Gale & Urban Nocturne',
    noiseFilterType: 'bandpass',
    noiseFilterFreq: 1150,
    noiseFilterQ: 4.2, // Whistling Cape Doctor gale resonance
    noiseGain: 0.09,
    droneType: 'sawtooth',
    droneFreq: 65, // 65Hz nocturnal city grid drone
    droneFilterFreq: 140,
    droneGain: 0.05,
    subDroneFreq: 130,
    subDroneGain: 0.02,
  },
  story_5_octagon: {
    storyId: 'story_5_octagon',
    name: 'Drakensberg Bunker HVAC & SCADA Klaxon',
    noiseFilterType: 'lowpass',
    noiseFilterFreq: 160,
    noiseFilterQ: 0.5,
    noiseGain: 0.06,
    droneType: 'triangle',
    droneFreq: 38, // 38Hz Cold War sub-bass drone
    droneFilterFreq: 85,
    droneGain: 0.09,
    subDroneFreq: 76,
    subDroneGain: 0.04,
  },
};

export function normalizeStoryId(storyId?: StoryId | string): string {
  if (!storyId) return 'story_1_ethekwini';
  const s = storyId.toLowerCase();
  if (s.includes('highveld') || s.includes('story_2')) return 'story_2_highveld';
  if (s.includes('namaqua') || s.includes('story_3')) return 'story_3_namaqua';
  if (s.includes('cape') || s.includes('story_4')) return 'story_4_cape';
  if (s.includes('octagon') || s.includes('story_5')) return 'story_5_octagon';
  return 'story_1_ethekwini';
}

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientVolume: number = 0.75; // 0.0 to 1.0
  private sfxVolume: number = 0.85; // 0.0 to 1.0
  private ambientGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private subDroneOsc: OscillatorNode | null = null;
  private subDroneGain: GainNode | null = null;
  private currentStoryId: string = 'story_1_ethekwini';
  private currentLoadSheddingStage: number = 4;
  private currentAdrenalineLevel: number = 1;
  private ambientRunning: boolean = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.syncAmbientGain();
  }

  public setVolumes(ambientPct: number, sfxPct: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, ambientPct / 100));
    this.sfxVolume = Math.max(0, Math.min(1, sfxPct / 100));
    this.syncAmbientGain();
  }

  public applySettings(settings: GameSettings): void {
    this.isMuted = settings.masterMuted;
    this.ambientVolume = Math.max(0, Math.min(1, settings.ambientVolume / 100));
    this.sfxVolume = Math.max(0, Math.min(1, settings.sfxVolume / 100));
    this.syncAmbientGain();
  }

  private syncAmbientGain(): void {
    if (this.ambientGain && this.ctx) {
      const target = this.isMuted ? 0 : 0.11 * this.ambientVolume;
      this.ambientGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
    }
  }

  public getCurrentStoryId(): string {
    return this.currentStoryId;
  }

  /**
   * Adjusts procedural soundscape parameters smoothly according to regional story and game conditions
   */
  public setRegionalAtmosphere(
    storyId?: StoryId | string,
    options?: { loadSheddingStage?: number; adrenalineLevel?: number }
  ): void {
    const normalized = normalizeStoryId(storyId || this.currentStoryId);
    this.currentStoryId = normalized;
    if (options?.loadSheddingStage !== undefined) {
      this.currentLoadSheddingStage = options.loadSheddingStage;
    }
    if (options?.adrenalineLevel !== undefined) {
      this.currentAdrenalineLevel = options.adrenalineLevel;
    }

    if (this.ambientRunning) {
      this.applyRegionalAtmosphereParams(normalized, options, false);
    }
  }

  private applyRegionalAtmosphereParams(
    storyId: string,
    options?: { loadSheddingStage?: number; adrenalineLevel?: number },
    immediate: boolean = false
  ): void {
    if (
      !this.ctx ||
      !this.rainFilter ||
      !this.rainGain ||
      !this.humOsc ||
      !this.humGain ||
      !this.humFilter ||
      !this.subDroneOsc ||
      !this.subDroneGain
    ) {
      return;
    }

    const cfg =
      REGIONAL_ATMOSPHERES[storyId] || REGIONAL_ATMOSPHERES.story_1_ethekwini;
    const now = this.ctx.currentTime;
    const rampTime = immediate ? 0.05 : 0.8;

    const stage = options?.loadSheddingStage ?? this.currentLoadSheddingStage;
    const adr = options?.adrenalineLevel ?? this.currentAdrenalineLevel;
    this.currentStoryId = storyId;
    this.currentLoadSheddingStage = stage;
    this.currentAdrenalineLevel = adr;

    // Modifiers based on load shedding and adrenaline
    const stage6Factor = stage === 6 ? 0.45 : 1.0;
    const adrFactor = 1 + (adr - 1) * 0.12;

    try {
      this.rainFilter.type = cfg.noiseFilterType;
      this.rainFilter.frequency.setTargetAtTime(
        cfg.noiseFilterFreq * adrFactor,
        now,
        rampTime
      );
      this.rainFilter.Q.setTargetAtTime(cfg.noiseFilterQ, now, rampTime);
      this.rainGain.gain.setTargetAtTime(
        cfg.noiseGain * (stage === 6 ? 1.25 : 1.0),
        now,
        rampTime
      );

      this.humOsc.frequency.setTargetAtTime(cfg.droneFreq, now, rampTime);
      this.humFilter.frequency.setTargetAtTime(cfg.droneFilterFreq, now, rampTime);
      this.humGain.gain.setTargetAtTime(
        cfg.droneGain * stage6Factor,
        now,
        rampTime
      );

      this.subDroneOsc.frequency.setTargetAtTime(cfg.subDroneFreq, now, rampTime);
      this.subDroneGain.gain.setTargetAtTime(
        cfg.subDroneGain * stage6Factor,
        now,
        rampTime
      );
    } catch {
      // Graceful fallback for browser Web Audio edge-cases
    }
  }

  public startAmbient(): void {
    if (this.ambientRunning) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.value = this.isMuted ? 0 : 0.11 * this.ambientVolume;
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      const cfg =
        REGIONAL_ATMOSPHERES[this.currentStoryId] ||
        REGIONAL_ATMOSPHERES.story_1_ethekwini;

      // 1. Regional weather / environment noise buffer (3 seconds looped)
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
      }

      const rainNode = ctx.createBufferSource();
      rainNode.buffer = noiseBuffer;
      rainNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = cfg.noiseFilterType;
      filter.frequency.value = cfg.noiseFilterFreq;
      filter.Q.value = cfg.noiseFilterQ;

      const rainGain = ctx.createGain();
      rainGain.gain.value = cfg.noiseGain;

      rainNode.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(masterGain);
      rainNode.start();
      this.rainSource = rainNode;
      this.rainFilter = filter;
      this.rainGain = rainGain;

      // 2. Primary Substation / Industrial Drone
      const hum = ctx.createOscillator();
      const humGain = ctx.createGain();
      hum.type = cfg.droneType;
      hum.frequency.value = cfg.droneFreq;
      humGain.gain.value = cfg.droneGain;

      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.value = cfg.droneFilterFreq;

      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(masterGain);
      hum.start();
      this.humOsc = hum;
      this.humFilter = humFilter;
      this.humGain = humGain;

      // 3. Secondary Regional Sub-Drone / Harmonic
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.value = cfg.subDroneFreq;
      subGain.gain.value = cfg.subDroneGain;

      sub.connect(subGain);
      subGain.connect(masterGain);
      sub.start();
      this.subDroneOsc = sub;
      this.subDroneGain = subGain;

      this.ambientRunning = true;
    } catch {
      // Ignore autoplay errors until first user gesture
    }
  }

  public playDieSelect(): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.startAmbient();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.045);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  public playOutcome(tier: 'clean' | 'compromised' | 'failure'): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.startAmbient();

    const now = ctx.currentTime;
    const freqs =
      tier === 'clean'
        ? [330, 440, 659.25] // Crisp emerald fifth/octave
        : tier === 'compromised'
        ? [293.66, 349.23] // Tense minor interval
        : [146.83, 138.59]; // Dissonant low buzz

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tier === 'failure' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.14 * this.sfxVolume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  public playCycleRoll(isStage6: boolean): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.startAmbient();

    const now = ctx.currentTime;

    // 4 rapid dice clicks
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380 + i * 70, now + i * 0.065);
      gain.gain.setValueAtTime(0.13 * this.sfxVolume, now + i * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.065);
      osc.stop(now + i * 0.065 + 0.045);
    }

    // Heavy substation breaker clunk if Stage 6 hits
    if (isStage6) {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, now + 0.15);
      sub.frequency.exponentialRampToValueAtTime(32, now + 0.55);

      subGain.gain.setValueAtTime(0.32 * this.sfxVolume, now + 0.15);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now + 0.15);
      sub.stop(now + 0.6);
    }
  }

  public playCrisisAlert(): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [740, 587.33].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      gain.gain.setValueAtTime(0.09 * this.sfxVolume, now + i * 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.1);
    });
  }

  /**
   * Tactile feedback for blocked actions (insufficient cash, roadblocked corridor, Stage 6 locked)
   */
  public playBlockedWarning(): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.08].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now + offset);
      osc.frequency.exponentialRampToValueAtTime(65, now + offset + 0.06);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  /**
   * Heartbeat thud pulse scaling in tempo and depth with adrenaline level (1 to 5)
   */
  public playHeartbeat(adrenalineLevel: number = 3): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const intensity = Math.max(1, Math.min(5, adrenalineLevel));
    const vol = (0.12 + intensity * 0.04) * this.sfxVolume;

    // Lub-dub double pulse
    [0, 0.13].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const baseFreq = idx === 0 ? 55 : 44;
      osc.frequency.setValueAtTime(baseFreq + intensity * 4, now + offset);
      osc.frequency.exponentialRampToValueAtTime(26, now + offset + 0.12);

      gain.gain.setValueAtTime(vol * (idx === 0 ? 1 : 0.7), now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  }

  /**
   * Encrypted police/wire scanner squelch chirp
   */
  public playScannerSquelch(): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1420, now + 0.025);
    osc.frequency.linearRampToValueAtTime(320, now + 0.06);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Signature regional atmospheric stinger (harbor foghorn, thunder boom, harbor bell, gale whistle, bunker klaxon)
   */
  public playRegionalStinger(storyId?: StoryId | string): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.startAmbient();

    const normalized = normalizeStoryId(storyId || this.currentStoryId);
    const now = ctx.currentTime;

    switch (normalized) {
      case 'story_1_ethekwini': {
        // eThekwini Harbor Deep Foghorn (110Hz + 138.59Hz minor dual tone)
        const tones = [110, 138.59];
        tones.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(260, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, now + 0.25);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.85);
        });
        break;
      }

      case 'story_2_highveld': {
        // Highveld Thunder Roll & Industrial Winch Crack
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(34, now + 1.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.24 * this.sfxVolume, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.35);
        break;
      }

      case 'story_3_namaqua': {
        // Alexander Bay Harbor Bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(698.46, now); // F5
        gain.gain.setValueAtTime(0.26 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        const overtone = ctx.createOscillator();
        const overGain = ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(1396.9, now);
        overGain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
        overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        overtone.connect(overGain);
        overGain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.15);
        overtone.start(now);
        overtone.stop(now + 0.55);
        break;
      }

      case 'story_4_cape': {
        // Cape Doctor Gale & Street Whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1480, now);
        osc.frequency.linearRampToValueAtTime(1920, now + 0.05);
        osc.frequency.linearRampToValueAtTime(1550, now + 0.1);
        gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'story_5_octagon': {
        // Drakensberg Bunker SCADA Emergency Klaxon (alternating dual warble)
        [0, 0.14].forEach((pulseTime, pIdx) => {
          const freqs = pIdx % 2 === 0 ? [880, 660] : [660, 880];
          freqs.forEach((freq, fIdx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            const t = now + pulseTime + fIdx * 0.06;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.11 * this.sfxVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.06);
          });
        });
        break;
      }
    }
  }

  /**
   * Plays authentic character greeting stab & acoustic earcon
   */
  public playContactVoiceStab(
    contactIdOrNodeId: string,
    lang?: SupportedLanguage
  ): ContactVoiceProfile {
    const profile = resolveContactVoiceProfile(contactIdOrNodeId);
    if (this.isMuted || this.sfxVolume <= 0) return profile;

    const ctx = this.ensureContext();
    if (!ctx) return profile;
    this.startAmbient();

    synthesizeVoiceStab(ctx, profile, this.sfxVolume);
    return profile;
  }

  /**
   * Cinematic cutscene / climax chord stinger
   */
  public playCutsceneStinger(mood: 'crisis' | 'triumph' | 'noir' = 'noir'): void {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.startAmbient();

    const now = ctx.currentTime;
    const freqs =
      mood === 'crisis'
        ? [110, 116.54, 164.81, 233.08] // Dark diminished dread chord
        : mood === 'triumph'
        ? [130.81, 164.81, 196.0, 261.63] // Resolute major chord
        : [98.0, 123.47, 146.83, 220.0]; // Noir minor 7th

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = mood === 'crisis' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const noteVol = (0.16 / freqs.length) * this.sfxVolume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteVol, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8 + idx * 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.2);
    });
  }

  /**
   * Escalated action outcome sound scaling with narrative adrenaline level
   */
  public playAdrenalineOutcome(
    tier: 'clean' | 'compromised' | 'failure',
    adrenalineLevel: number = 1
  ): void {
    this.playOutcome(tier);
    if (adrenalineLevel >= 4) {
      this.playHeartbeat(adrenalineLevel);
    }
    if (adrenalineLevel >= 3 && tier !== 'clean') {
      setTimeout(() => this.playScannerSquelch(), 180);
    }
  }
}

export const soundscape = new SoundscapeEngine();
