'use client';

import React, { useState } from 'react';
import { GameSettings, SUPPORTED_LANGUAGES } from '../types/settings';
import { soundscape } from '../engine/soundscape';

export const SettingsModal: React.FC<{
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onClearAllData?: () => void;
  onClose: () => void;
}> = ({ isOpen, settings, onUpdateSettings, onClearAllData, onClose }) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof GameSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    soundscape.applySettings(next);
    soundscape.playDieSelect();
    onUpdateSettings(next);
  };

  const handleSlider = (
    key: 'ambientVolume' | 'sfxVolume',
    value: number
  ) => {
    const next = { ...settings, [key]: value };
    soundscape.applySettings(next);
    onUpdateSettings(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-sans"
      onClick={() => {
        soundscape.playDieSelect();
        onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-2xl border-2 border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono text-xs shrink-0">
          <span className="text-amber-400 uppercase tracking-widest">
            SYSTEM &amp; AUDIO CONFIGURATION
          </span>
          <button
            onClick={() => {
              soundscape.playDieSelect();
              onClose();
            }}
            className="text-zinc-400 hover:text-white uppercase cursor-pointer"
          >
            [Close ✕]
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* 1. AUDIO SECTION */}
          <div className="space-y-3.5">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              01 // Procedural Noir Soundscape
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <div className="text-sm font-medium text-white">
                  Master Audio Mute
                </div>
                <div className="text-xs text-zinc-400">
                  Mute all Web Audio synthesis and ambient rain loops
                </div>
              </div>
              <button
                onClick={() => handleToggle('masterMuted', !settings.masterMuted)}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                  settings.masterMuted
                    ? 'bg-red-950/60 border-red-600 text-red-300'
                    : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                }`}
              >
                {settings.masterMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            {/* Ambient Volume Slider */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200">
                  Coastal Rain &amp; 55Hz Grid Hum
                </span>
                <span className="text-amber-400">{settings.ambientVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.ambientVolume}
                onChange={(e) =>
                  handleSlider('ambientVolume', Number(e.target.value))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* SFX Volume Slider */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200">
                  Tactical Dice &amp; Crisis Alerts
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">{settings.sfxVolume}%</span>
                  <button
                    onClick={() => soundscape.playOutcome('clean')}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-cyan-300 cursor-pointer"
                  >
                    [Test]
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.sfxVolume}
                onChange={(e) =>
                  handleSlider('sfxVolume', Number(e.target.value))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 2. VISUAL & ACCESSIBILITY SECTION */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              02 // Display &amp; Guidance Preferences
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 gap-3">
              <div>
                <div className="text-sm font-medium text-white">
                  Tactical Dice Face Style
                </div>
                <div className="text-xs text-zinc-400">
                  Switch action dice between digits (1–6) and traditional pips (⚀–⚅)
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-zinc-950 p-1 border border-zinc-800 shrink-0 font-mono text-xs">
                <button
                  onClick={() => {
                    const next: GameSettings = {
                      ...settings,
                      diceDisplayMode: 'numbers',
                    };
                    soundscape.playDieSelect();
                    onUpdateSettings(next);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    (settings.diceDisplayMode ?? 'numbers') === 'numbers'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  123
                </button>
                <button
                  onClick={() => {
                    const next: GameSettings = {
                      ...settings,
                      diceDisplayMode: 'dots',
                    };
                    soundscape.playDieSelect();
                    onUpdateSettings(next);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    settings.diceDisplayMode === 'dots'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚄ DOTS
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <div className="text-sm font-medium text-white">
                  Reduce Blackout Screen Flicker
                </div>
                <div className="text-xs text-zinc-400">
                  Disable screen flash during Load Shedding grid transitions
                </div>
              </div>
              <button
                onClick={() =>
                  handleToggle(
                    'reduceScreenFlicker',
                    !settings.reduceScreenFlicker
                  )
                }
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                  settings.reduceScreenFlicker
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                }`}
              >
                {settings.reduceScreenFlicker ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <div className="text-sm font-medium text-white">
                  Auto-Show Field Guide on First Visit
                </div>
                <div className="text-xs text-zinc-400">
                  Open the 6-step tactical HUD tutorial on new timelines
                </div>
              </div>
              <button
                onClick={() =>
                  handleToggle('autoShowTutorial', !settings.autoShowTutorial)
                }
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                  settings.autoShowTutorial
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                    : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                }`}
              >
                {settings.autoShowTutorial ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* 3. LANGUAGE & LOCALISATION SECTION */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                03 // Language &amp; Localisation
              </div>
              <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/40">
                11 Official Languages
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
              <div className="text-xs text-zinc-300">
                Choose your preferred interface language. All district names, clocks, and narrative reports will adjust automatically:
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = (settings.language ?? 'en') === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        soundscape.playDieSelect();
                        const next: GameSettings = {
                          ...settings,
                          language: lang.code,
                        };
                        onUpdateSettings(next);
                      }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-xs ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                          {lang.nativeName}
                        </span>
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {lang.code}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {lang.name} • {lang.region}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. DATA MANAGEMENT */}
          {onClearAllData && (
            <div className="pt-2 border-t border-zinc-800 space-y-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-red-400">
                04 // Dossier Storage Management
              </div>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-800/70 text-red-300 font-mono text-xs uppercase tracking-wider cursor-pointer text-left flex items-center justify-between"
                >
                  <span>Purge All Saved Dossiers &amp; Reset Tutorial</span>
                  <span>[Wipe Data]</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-600 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-red-200">
                    Confirm permanent deletion of all save slots?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        soundscape.playCrisisAlert();
                        onClearAllData();
                        setConfirmClear(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase cursor-pointer"
                    >
                      Confirm Purge
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                soundscape.playDieSelect();
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
