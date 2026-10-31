'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { EndingId, FactionId, GameState } from '../types/game';
import { ACT_1_ENDINGS } from '../data/endings';
import { HIGHVELD_ENDINGS } from '../data/story2HighveldEndings';
import { NAMAQUA_ENDINGS } from '../data/story3NamaquaEndings';
import { CAPE_ENDINGS } from '../data/story4CapeEndings';
import { OCTAGON_ENDINGS } from '../data/story5OctagonEndings';
import { SupportedLanguage } from '../types/settings';
import { t, getLocalizedEnding, getLocalizedFactionName } from '../engine/i18n';
import { recordUnlockedEnding } from '../engine/storage';
import { recordStoryCompletion, loadCampaignProgression } from '../engine/campaignStorage';
import { calculateFixerEvaluation } from '../engine/advisor';
import {
  calculateComprehensiveScore,
  formatSpeedrunTime,
} from '../engine/scoringEngine';
import {
  submitHighScore,
  getSavedUserProfile,
  subscribeToUserProfile,
} from '../engine/cloudSync';
import { evaluateAchievements } from '../engine/achievements';
import { LeaderboardModal } from './LeaderboardModal';
import { UserProfileModal } from './UserProfileModal';
import { soundscape } from '../engine/soundscape';

const ENDING_SCENE_ARTWORK_MAP: Record<string, string> = {
  // Story 1 Act 1
  ending_vigilante: '/assets/endings/ending_vigilante.jpg',
  ending_whistleblower: '/assets/endings/ending_whistleblower.jpg',
  ending_kingpin: '/assets/endings/ending_kingpin.jpg',
  ending_captured: '/assets/endings/ending_captured.jpg',
  // Story 1 Act 2
  ending_act2_reckoning: '/assets/endings/ending_act2_reckoning.jpg',
  ending_act2_revolution: '/assets/endings/ending_act2_reckoning.jpg',
  ending_act2_syndicate_state: '/assets/endings/ending_kingpin.jpg',
  ending_act2_vanished: '/assets/endings/ending_captured.jpg',
  // Story 2 Highveld
  ending_highveld_siu_vindication: '/assets/endings/ending_highveld_vindication.jpg',
  ending_highveld_red_blackout: '/assets/cutscenes/climax_kendon.jpg',
  ending_highveld_arbitrage_partner: '/assets/endings/ending_kingpin.jpg',
  ending_highveld_shaft_collapse: '/assets/endings/ending_captured.jpg',
  // Story 3 Namaqua
  ending_namaqua_naval_raid: '/assets/endings/ending_namaqua_rebellion.jpg',
  ending_namaqua_divers_rebellion: '/assets/endings/ending_namaqua_rebellion.jpg',
  ending_namaqua_diamond_flight: '/assets/cutscenes/climax_namaqua.jpg',
  ending_namaqua_desert_dune_grave: '/assets/endings/ending_captured.jpg',
  // Story 4 Cape
  ending_cape_sovereign_seizure: '/assets/endings/ending_cape_seizure.jpg',
  ending_cape_gang_truce: '/assets/cutscenes/climax_cape.jpg',
  ending_cape_winelands_audit: '/assets/endings/ending_cape_seizure.jpg',
  ending_cape_shadow_execution: '/assets/endings/ending_captured.jpg',
  // Story 5 Octagon
  ending_octagon_constitutional_reckoning: '/assets/endings/ending_octagon_reckoning.jpg',
  ending_octagon_peoples_revolution: '/assets/endings/ending_octagon_reckoning.jpg',
  ending_octagon_shadow_director: '/assets/cutscenes/climax_octagon.jpg',
  ending_octagon_balkanized_republic: '/assets/cutscenes/climax_kendon.jpg',
  ending_octagon_vanished_watchers: '/assets/cutscenes/climax_octagon.jpg',
};

const STORY_FACTIONS: Record<string, FactionId[]> = {
  story_1_ethekwini: ['abasanta', 'city_hall', 'saps_trt', 'street_syndicate', 'hawks'],
  story_2_highveld: ['megawatt_cartel', 'sandton_arbitrage', 'reef_zamazamas', 'siu_clean_hands', 'red_guard_populists'],
  story_3_namaqua: ['aegis_marine', 'artisanal_divers', 'kalahari_runners', 'namaqua_command', 'namib_syndicate'],
  story_4_cape: ['long_street_racket', 'cape_gang_federation', 'winelands_club', 'agu_renegades', 'dockers_union'],
  story_5_octagon: ['united_hawks_taskforce', 'the_sovereign_octagon', 'constitutional_court_guard', 'national_grid_command', 'people_resistance_front'],
};

type EndingPhase = 'scene' | 'aftermath' | 'fixer';

export const EndingScreen: React.FC<{
  state: GameState;
  endingId: EndingId;
  lang?: SupportedLanguage;
  onContinueToAct2?: (endingId: EndingId) => void;
  onStartNewGamePlus?: () => void;
  onRestart: () => void;
}> = ({
  state,
  endingId,
  lang = 'en',
  onContinueToAct2,
  onStartNewGamePlus,
  onRestart,
}) => {
  const [phase, setPhase] = useState<EndingPhase>('scene');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getSavedUserProfile());

  // Subscribe to real-time user profile & cloud auth changes
  useEffect(() => {
    const unsubscribe = subscribeToUserProfile((updated) => {
      setUserProfile(updated);
    });
    return () => unsubscribe();
  }, []);

  const isOctagon = state.storyId === 'story_5_octagon';
  const isCape = state.storyId === 'story_4_cape';
  const isNamaqua = state.storyId === 'story_3_namaqua';
  const isHighveld = state.storyId === 'story_2_highveld';

  const rawEnding = isOctagon
    ? OCTAGON_ENDINGS[endingId] || ACT_1_ENDINGS[endingId]
    : isCape
    ? CAPE_ENDINGS[endingId] || ACT_1_ENDINGS[endingId]
    : isNamaqua
    ? NAMAQUA_ENDINGS[endingId] || ACT_1_ENDINGS[endingId]
    : isHighveld
    ? HIGHVELD_ENDINGS[endingId] || ACT_1_ENDINGS[endingId]
    : ACT_1_ENDINGS[endingId] || HIGHVELD_ENDINGS[endingId];

  const ending = getLocalizedEnding(rawEnding, lang);
  const evaluation = calculateFixerEvaluation(state, endingId);
  const artwork = ENDING_SCENE_ARTWORK_MAP[endingId] || '/assets/endings/ending_vigilante.jpg';

  const progression = loadCampaignProgression();
  const elapsedSeconds =
    state.runStartTime && state.runStartTime > 0
      ? Math.max(1, Math.floor((Date.now() - state.runStartTime) / 1000))
      : 245;

  const comprehensiveScore = calculateComprehensiveScore({
    state,
    endingId,
    elapsedSeconds,
    campaignProgression: progression,
  });

  const canContinueToAct2 =
    Boolean(onContinueToAct2) &&
    (endingId === 'ending_vigilante' ||
      endingId === 'ending_whistleblower' ||
      endingId === 'ending_kingpin');
  const isAct2Ending = endingId.startsWith('ending_act2_');
  const canNewGamePlus =
    Boolean(onStartNewGamePlus) &&
    (isAct2Ending || isHighveld || isNamaqua || isCape || isOctagon) &&
    endingId !== 'ending_act2_vanished' &&
    endingId !== 'ending_highveld_shaft_collapse' &&
    endingId !== 'ending_namaqua_desert_dune_grave' &&
    endingId !== 'ending_cape_shadow_execution' &&
    endingId !== 'ending_octagon_balkanized_republic';

  useEffect(() => {
    recordUnlockedEnding(endingId, state);
    const sId = state.storyId || 'story_1_ethekwini';
    recordStoryCompletion(sId, endingId);
    evaluateAchievements({
      state,
      progression,
      lastEntry: {
        score: comprehensiveScore.totalScore,
        completionSeconds: elapsedSeconds,
        storyId: sId,
        composure: state.composure,
        cash: state.cash,
      },
    });
    soundscape.playCutsceneStinger('triumph');
  }, [endingId, state]);

  const handleSubmitScore = async () => {
    if (isSubmitting) return;
    if (isScoreSubmitted) {
      setIsLeaderboardOpen(true);
      return;
    }

    setIsSubmitting(true);
    const sId = state.storyId || 'story_1_ethekwini';
    const storyNames: Record<string, string> = {
      story_1_ethekwini: 'eThekwini-Gold',
      story_2_highveld: 'Highveld-Chrome',
      story_3_namaqua: 'Namaqua-Diamond',
      story_4_cape: 'Cape-Nocturne',
      story_5_octagon: 'The Sovereign Octagon',
    };

    const unlockedMap = recordUnlockedEnding(endingId, state);

    await submitHighScore({
      userId: userProfile.isGuest ? undefined : userProfile.id,
      userEmail: userProfile.email,
      playerName: userProfile.displayName || 'Fixer-Operative',
      playerAvatar: userProfile.avatarUrl,
      score: comprehensiveScore.totalScore,
      rankTitle: comprehensiveScore.rankTitle,
      storyId: sId,
      storyName: storyNames[sId] || 'Mzansi Campaign',
      endingId,
      endingTitle: ending.title,
      completionSeconds: elapsedSeconds,
      completionCycles: state.day,
      endingsUnlockedCount: Object.keys(unlockedMap).length,
      keystonesCount: progression.collectedKeystones.length,
      composure: state.composure,
      cash: state.cash,
    });

    setIsSubmitting(false);
    setIsScoreSubmitted(true);
    soundscape.playOutcome('clean');
    setIsLeaderboardOpen(true);
  };

  const themeClasses = {
    amber: {
      border: 'border-amber-500/80',
      banner: 'bg-amber-950/60 border-amber-800 text-amber-300',
      accentText: 'text-amber-400',
      tabActive: 'bg-amber-500 text-slate-950 font-bold',
      cardBorder: 'border-amber-800/50 bg-amber-950/15',
    },
    cyan: {
      border: 'border-cyan-500/80',
      banner: 'bg-cyan-950/60 border-cyan-800 text-cyan-300',
      accentText: 'text-cyan-400',
      tabActive: 'bg-cyan-400 text-slate-950 font-bold',
      cardBorder: 'border-cyan-800/50 bg-cyan-950/15',
    },
    purple: {
      border: 'border-purple-500/80',
      banner: 'bg-purple-950/60 border-purple-800 text-purple-300',
      accentText: 'text-purple-400',
      tabActive: 'bg-purple-400 text-slate-950 font-bold',
      cardBorder: 'border-purple-800/50 bg-purple-950/15',
    },
    red: {
      border: 'border-red-600/80',
      banner: 'bg-red-950/60 border-red-800 text-red-300',
      accentText: 'text-red-400',
      tabActive: 'bg-red-500 text-slate-950 font-bold',
      cardBorder: 'border-red-800/50 bg-red-950/15',
    },
  }[ending.accentColor as 'amber' | 'cyan' | 'purple' | 'red'] ?? {
    border: 'border-amber-500/80',
    banner: 'bg-amber-950/60 border-amber-800 text-amber-300',
    accentText: 'text-amber-400',
    tabActive: 'bg-amber-500 text-slate-950 font-bold',
    cardBorder: 'border-amber-800/50 bg-amber-950/15',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto flex items-center justify-center p-2 sm:p-4 md:p-6 select-none font-sans">
      <div
        className={`w-full max-w-5xl my-auto rounded-2xl border-2 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col ${themeClasses.border}`}
      >
        {/* TOP DOSSIER BANNER */}
        <div
          className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest ${themeClasses.banner}`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isOctagon
                ? 'STORY 5 NATIONAL FINALE'
                : isCape
                ? 'STORY 4 GRAND FINALE'
                : isNamaqua
                ? 'STORY 3 GRAND FINALE'
                : isHighveld
                ? 'STORY 2 GRAND FINALE'
                : isAct2Ending
                ? 'ACT 2 GRAND FINALE'
                : 'ACT 1 FINALE'}{' '}
              // {ending.pathLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-[10px]">
              ✓ ARCHIVED IN GALLERY
            </span>
            <span className="text-zinc-400 hidden sm:inline">
              CYCLE {state.day}
            </span>
          </div>
        </div>

        {/* PHASE TAB SELECTOR */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/60 font-mono text-xs">
          <button
            onClick={() => {
              soundscape.playDieSelect();
              setPhase('scene');
            }}
            className={`flex-1 py-3 px-4 text-center border-r border-zinc-800 uppercase tracking-wider transition-colors cursor-pointer ${
              phase === 'scene'
                ? themeClasses.tabActive
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            01 // {t('ending.tab_scene', 'CINEMATIC SCENE', lang)}
          </button>
          <button
            onClick={() => {
              soundscape.playDieSelect();
              setPhase('aftermath');
            }}
            className={`flex-1 py-3 px-4 text-center border-r border-zinc-800 uppercase tracking-wider transition-colors cursor-pointer ${
              phase === 'aftermath'
                ? themeClasses.tabActive
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            02 // {t('ending.tab_aftermath', 'DISTRICT AFTERMATH', lang)}
          </button>
          <button
            onClick={() => {
              soundscape.playDieSelect();
              setPhase('fixer');
            }}
            className={`flex-1 py-3 px-4 text-center uppercase tracking-wider transition-colors cursor-pointer ${
              phase === 'fixer'
                ? themeClasses.tabActive
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            03 // {t('ending.tab_fixer', 'FIXER EVALUATION', lang)}
          </button>
        </div>

        {/* MAIN BODY CONTENT BASED ON PHASE */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* PHASE 1: CINEMATIC SCENE & NARRATIVE */}
          {phase === 'scene' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* WIDESCREEN 16:9 CINEMATIC SCENE ARTWORK */}
              <div className="relative w-full aspect-video sm:aspect-[21/9] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
                <Image
                  src={artwork}
                  alt={ending.title}
                  fill
                  className="object-cover object-center filter brightness-95 contrast-105 transform hover:scale-105 transition-transform duration-7000"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/70 pointer-events-none" />

                {/* Subtitle & Title overlay at base of artwork */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10">
                  <div
                    className={`text-[11px] sm:text-xs font-mono uppercase tracking-widest ${themeClasses.accentText} drop-shadow`}
                  >
                    {ending.subtitle}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mt-1">
                    {ending.title}
                  </h1>
                </div>
              </div>

              {/* SUMMARY QUOTE */}
              <blockquote className="text-sm sm:text-base italic text-zinc-200 border-l-4 border-amber-500/80 pl-4 py-1 bg-zinc-900/40 rounded-r-lg">
                {ending.summaryQuote}
              </blockquote>

              {/* NARRATIVE EPILOGUE PARAGRAPHS */}
              <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-200 bg-zinc-900/50 p-4 sm:p-6 rounded-xl border border-zinc-800/80">
                {ending.epilogueParagraphs.map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* PHASE 2: DISTRICT AFTERMATH */}
          {phase === 'aftermath' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                  {t('ending.district_power_shift', 'District Power Shift & Systemic Fallout', lang)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ending.cityAftermath.map(
                    (item: { heading: string; detail: string }, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${themeClasses.cardBorder}`}
                      >
                        <h3 className={`text-sm font-semibold ${themeClasses.accentText}`}>
                          {item.heading}
                        </h3>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* FINAL STATS & FACTION LEDGER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 font-mono text-xs space-y-2">
                  <div className="text-zinc-400 uppercase font-bold border-b border-zinc-800 pb-1.5">
                    {t('ending.final_ledger', 'Final Fixer Ledger', lang)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Closing Cash:</span>
                    <span className="text-emerald-400 font-bold">
                      R{state.cash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Final Composure:</span>
                    <span className="text-cyan-400 font-bold">{state.composure}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cycles Survived:</span>
                    <span className="text-zinc-200">{state.day} Days</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 font-mono text-xs space-y-1.5">
                  <div className="text-zinc-400 uppercase font-bold border-b border-zinc-800 pb-1.5 mb-1">
                    {t('ending.faction_standing', 'Final Faction Standing', lang)}
                  </div>
                  {((state.storyId && STORY_FACTIONS[state.storyId]) ||
                    STORY_FACTIONS.story_1_ethekwini).map((fid) => {
                    const rep = state.factionRep[fid] ?? 0;
                    return (
                      <div key={fid} className="flex justify-between">
                        <span className="text-zinc-400">
                          {getLocalizedFactionName(fid, lang)}:
                        </span>
                        <span
                          className={
                            rep > 0
                              ? 'text-emerald-400 font-semibold'
                              : rep < 0
                              ? 'text-red-400 font-semibold'
                              : 'text-zinc-400'
                          }
                        >
                          {rep > 0 ? `+${rep}` : rep}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}          {/* PHASE 3: COMPREHENSIVE FIXER EVALUATION & LEADERBOARD */}
          {phase === 'fixer' && (
            <div className="space-y-5 animate-in fade-in duration-300 font-mono">
              {/* APEX SCORE & SPEEDRUN HERO CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-cyan-950/40 border-2 border-amber-500/50 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-black text-2xl shadow-lg ${
                        comprehensiveScore.rankGrade === 'S+' || comprehensiveScore.rankGrade === 'S'
                          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-yellow-500/30'
                          : comprehensiveScore.rankGrade === 'A'
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-cyan-500/30'
                          : 'border-white/30 bg-white/10 text-white shadow-white/10'
                      }`}
                    >
                      {comprehensiveScore.rankGrade}
                    </div>

                    <div>
                      <div className="text-[10px] text-amber-400 uppercase tracking-widest">
                        Fixer Performance Docket
                      </div>
                      <div className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                        {comprehensiveScore.rankTitle}
                      </div>
                      <div className="text-xs text-white/50">
                        Top {Math.max(1, Math.round(100 - comprehensiveScore.globalPercentile))}% Operative Ranking
                      </div>
                    </div>
                  </div>

                  {/* Speedrun Time Banner */}
                  <div className="flex items-center gap-4 bg-black/50 px-4 py-2 rounded-xl border border-white/10">
                    <div className="text-right">
                      <div className="text-[10px] text-white/40 uppercase">Speedrun Time</div>
                      <div className="text-base sm:text-lg font-black text-cyan-400 flex items-center gap-1.5">
                        <span>⏱️</span>
                        <span>{formatSpeedrunTime(elapsedSeconds)}</span>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="text-right">
                      <div className="text-[10px] text-white/40 uppercase">Total Score</div>
                      <div className="text-lg sm:text-xl font-black text-amber-300">
                        {comprehensiveScore.totalScore.toLocaleString()} PTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Vector Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Victory Base</div>
                    <div className="font-bold text-white mt-0.5">
                      +{comprehensiveScore.breakdown.baseVictory.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                    <div className="text-[10px] text-cyan-400 uppercase">Speedrun</div>
                    <div className="font-bold text-cyan-300 mt-0.5">
                      +{comprehensiveScore.breakdown.speedrunBonus.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Cycle Efficiency</div>
                    <div className="font-bold text-white mt-0.5">
                      +{comprehensiveScore.breakdown.cycleEfficiency.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Composure</div>
                    <div className="font-bold text-white mt-0.5">
                      +{comprehensiveScore.breakdown.composureBonus.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 uppercase">Cash War-Chest</div>
                    <div className="font-bold text-emerald-300 mt-0.5">
                      +{comprehensiveScore.breakdown.cashRetained.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Keystones</div>
                    <div className="font-bold text-white mt-0.5">
                      +{comprehensiveScore.breakdown.evidenceKeystones.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 uppercase">Anthology (X/25)</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      +{comprehensiveScore.breakdown.anthologyCompletion.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Direct High Score Board Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubmitScore}
                      disabled={isSubmitting}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                        isScoreSubmitted
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-emerald-950/50'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                      }`}
                    >
                      <span>🏆</span>
                      <span>
                        {isSubmitting
                          ? 'Submitting Dossier...'
                          : isScoreSubmitted
                          ? '✓ Recorded // Open High Score Board'
                          : 'Submit Score to High Score Board'}
                      </span>
                    </button>

                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>👤</span>
                      <span>Operative Vault & Cloud Save</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-white/40">
                    {userProfile.isGuest ? 'Local Guest Record' : `Verified Cloud: ${userProfile.displayName}`}
                  </div>
                </div>
              </div>

              {/* UNLOCKED RUN COMMENDATIONS */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono text-xs space-y-3">
                <div className="text-[10px] text-cyan-400 uppercase border-b border-zinc-800 pb-2 font-bold flex items-center justify-between">
                  <span>Tactical Commendations & Accolades</span>
                  <span>
                    {comprehensiveScore.commendations.filter((c) => c.unlocked).length}/
                    {comprehensiveScore.commendations.length} Unlocked
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {comprehensiveScore.commendations.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-lg border flex flex-col justify-between gap-1 transition-all ${
                        comm.unlocked
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-500 opacity-60'
                      }`}
                    >
                      <div className="text-[11px] font-semibold flex items-center justify-between">
                        <span>{comm.title}</span>
                        <span>{comm.unlocked ? '★' : '—'}</span>
                      </div>
                      <div className="text-[10px] opacity-80 leading-snug">
                        {comm.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACT 2 HOOK & CONTINUE / NEW GAME+ / RESTART BUTTONS */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono text-zinc-300 max-w-xl">{ending.act2Hook}</p>
              <div className="flex items-center gap-2 pt-1">
                {phase !== 'scene' && (
                  <button
                    onClick={() => setPhase(phase === 'fixer' ? 'aftermath' : 'scene')}
                    className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                  >
                    ◄ {t('ui.previous_phase', 'Previous', lang)}
                  </button>
                )}
                {phase !== 'fixer' && (
                  <button
                    onClick={() => setPhase(phase === 'scene' ? 'aftermath' : 'fixer')}
                    className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-200 hover:text-white cursor-pointer"
                  >
                    {t('ui.next_phase', 'Next Section ►', lang)}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
              {canContinueToAct2 && onContinueToAct2 && (
                <button
                  onClick={() => onContinueToAct2(endingId)}
                  className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                >
                  {t('ending.continue_act2', 'Continue to Act 2: The Commission →', lang)}
                </button>
              )}
              {canNewGamePlus && onStartNewGamePlus && (
                <button
                  onClick={onStartNewGamePlus}
                  className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                >
                  {t('ending.new_game_plus', 'New Game+ (Keep Gear & +R1,000) →', lang)}
                </button>
              )}
              <button
                onClick={onRestart}
                className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
              >
                {t('ending.new_timeline', 'New Timeline / Main Menu →', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};
