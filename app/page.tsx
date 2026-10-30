'use client';

import React, { useState, useEffect } from 'react';
import { initialGameState } from '../data/initialState';
import { transitionToAct2 } from '../data/act2State';
import { GameState } from '../types/game';
import {
  DEFAULT_GAME_SETTINGS,
  GameSettings,
  SaveSlotId,
  SaveSlotRecord,
} from '../types/settings';
import {
  clearAllSavesAndTutorial,
  deleteSaveSlot,
  loadAllSaveSlots,
  loadSettings,
  saveSettings,
  writeSaveSlot,
} from '../engine/storage';
import { loadCampaignProgression } from '../engine/campaignStorage';
import { setupAuthListener } from '../engine/cloudSync';
import { soundscape } from '../engine/soundscape';
import { initializeNativeApp } from '../engine/nativeBridge';
import { TitleIntroScreen } from '../components/TitleIntroScreen';
import { PrologueScreen } from '../components/PrologueScreen';
import { GameDashboard } from '../components/GameDashboard';
import { SettingsModal } from '../components/SettingsModal';

import { initialHighveldGameState } from '../data/story2HighveldState';
import { initialNamaquaGameState } from '../data/story3NamaquaState';
import { initialCapeGameState } from '../data/story4CapeState';
import { initialOctagonGameState } from '../data/story5OctagonState';
import { StoryId } from '../types/campaign';

type ScreenStage = 'title' | 'prologue' | 'map';

export default function EthekwiniGoldGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [screen, setScreen] = useState<ScreenStage>('title');
  const [activeSlotId, setActiveSlotId] = useState<SaveSlotId>('slot_1');
  const [saveSlots, setSaveSlots] = useState<
    Partial<Record<SaveSlotId, SaveSlotRecord>>
  >({});
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Hydrate settings & multi-slot save dossiers on mount and initialize native bridge
  useEffect(() => {
    setupAuthListener();
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    soundscape.applySettings(loadedSettings);

    const slots = loadAllSaveSlots();
    setSaveSlots(slots);
    setHydrated(true);

    initializeNativeApp(() => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true;
      }
      return false;
    });
  }, [isSettingsOpen]);

  // Persist active gameplay changes to both 'autosave' and the selected active slot
  useEffect(() => {
    if (!hydrated || screen === 'title') return;

    if (gameState.activeEndingId) {
      // Clear completed run from autosave and active slot so finished runs don't loop on load
      deleteSaveSlot('autosave');
      const updated = deleteSaveSlot(activeSlotId);
      setSaveSlots(updated);
    } else {
      const inPrologue = screen === 'prologue';
      writeSaveSlot('autosave', gameState, inPrologue);
      const updated = writeSaveSlot(activeSlotId, gameState, inPrologue);
      setSaveSlots(updated);
    }
  }, [gameState, screen, activeSlotId, hydrated]);

  const handleUpdateSettings = (nextSettings: GameSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  const handleClearAllSaves = () => {
    clearAllSavesAndTutorial();
    setSaveSlots({});
    setGameState(initialGameState);
    setScreen('title');
  };

  const handleStartNewGame = (
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
  ) => {
    setActiveSlotId(slotId);
    const progression = loadCampaignProgression();
    const isOctagon =
      storyId === 'story_5_octagon' ||
      mode === 'octagon_prologue' ||
      mode === 'octagon_map';
    const isCape =
      storyId === 'story_4_cape' ||
      mode === 'cape_prologue' ||
      mode === 'cape_map';
    const isNamaqua =
      storyId === 'story_3_namaqua' ||
      mode === 'namaqua_prologue' ||
      mode === 'namaqua_map';
    const isHighveld =
      storyId === 'story_2_highveld' ||
      mode === 'highveld_prologue' ||
      mode === 'highveld_map';

    let baseState: GameState;
    if (isOctagon) {
      baseState = {
        ...initialOctagonGameState,
        stats: { ...initialOctagonGameState.stats },
        inventory: [...initialOctagonGameState.inventory],
      };
    } else if (isCape) {
      baseState = {
        ...initialCapeGameState,
        stats: { ...initialCapeGameState.stats },
        inventory: [...initialCapeGameState.inventory],
      };
    } else if (isNamaqua) {
      baseState = {
        ...initialNamaquaGameState,
        stats: { ...initialNamaquaGameState.stats },
        inventory: [...initialNamaquaGameState.inventory],
      };
    } else if (isHighveld) {
      baseState = {
        ...initialHighveldGameState,
        stats: { ...initialHighveldGameState.stats },
        inventory: [...initialHighveldGameState.inventory],
      };
    } else if (mode === 'act2_map') {
      baseState = transitionToAct2(initialGameState, 'ending_whistleblower');
    } else {
      baseState = {
        ...initialGameState,
        stats: { ...initialGameState.stats },
        inventory: [...initialGameState.inventory],
      };
    }

    // Cross-Story Keystone & Legacy Carryover:
    if (progression.collectedKeystones?.length) {
      const merged = Array.from(
        new Set([...baseState.inventory, ...progression.collectedKeystones])
      );
      baseState.inventory = merged;
    }

    // Apply any unlocked story legacy hero stat carryover
    const completedList = Object.values(progression.completedStories);
    completedList.forEach((c) => {
      if (c?.heroStatCarryover) {
        const { stat, bonus } = c.heroStatCarryover;
        if (stat in baseState.stats) {
          baseState.stats[stat] = (baseState.stats[stat] || 0) + bonus;
        }
      }
    });

    baseState.runStartTime = Date.now();
    setGameState(baseState);
    if (
      mode === 'act1_map' ||
      mode === 'act2_map' ||
      mode === 'highveld_map' ||
      mode === 'namaqua_map' ||
      mode === 'cape_map' ||
      mode === 'octagon_map'
    ) {
      setScreen('map');
    } else {
      setScreen('prologue');
    }
  };


  const handleLoadSaveSlot = (record: SaveSlotRecord) => {
    setActiveSlotId(record.slotId === 'autosave' ? 'slot_1' : record.slotId);
    setGameState(record.gameState);
    setScreen(record.inPrologue ? 'prologue' : 'map');
  };

  const handleDeleteSaveSlot = (slotId: SaveSlotId) => {
    const updated = deleteSaveSlot(slotId);
    setSaveSlots(updated);
  };

  const handleManualSave = (currentState: GameState) => {
    writeSaveSlot('autosave', currentState, false);
    const updated = writeSaveSlot(activeSlotId, currentState, false);
    setSaveSlots(updated);
  };

  const handleReturnToMenu = () => {
    setScreen('title');
  };

  const handleEndingRestart = () => {
    deleteSaveSlot('autosave');
    const updated = deleteSaveSlot(activeSlotId);
    setSaveSlots(updated);
    setGameState(initialGameState);
    setScreen('title');
  };

  if (!hydrated) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-amber-400 flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        LOADING ETHEKWINI-GOLD DOSSIER...
      </div>
    );
  }

  return (
    <>
      {screen === 'title' && (
        <TitleIntroScreen
          saveSlots={saveSlots}
          lang={settings.language}
          onStartNewGame={handleStartNewGame}
          onLoadSaveSlot={handleLoadSaveSlot}
          onDeleteSaveSlot={handleDeleteSaveSlot}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {screen === 'prologue' && (
        <PrologueScreen
          initialState={gameState}
          lang={settings.language}
          onCompletePrologue={(configuredState) => {
            setGameState(configuredState);
            setScreen('map');
          }}
        />
      )}

      {screen === 'map' && (
        <GameDashboard
          initialData={gameState}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onStateChange={(nextState) => setGameState(nextState)}
          onManualSave={handleManualSave}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onReturnToMenu={handleReturnToMenu}
          onRestart={handleEndingRestart}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearAllData={handleClearAllSaves}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
