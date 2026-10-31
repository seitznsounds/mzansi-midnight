'use client';

import React, { useEffect, useState } from 'react';
import { AdrenalineMetrics } from '../engine/adrenaline';
import { SupportedLanguage } from '../types/settings';
import { t } from '../engine/i18n';

export interface RollFeedbackData {
  title: string;
  rollMath: string;
  tier: 'clean' | 'compromised' | 'failure' | 'blocked';
  narrative: string;
  summary: string;
}

interface ActionOutcomeDispatchProps {
  feedback: RollFeedbackData | null;
  adrenaline: AdrenalineMetrics;
  lang?: SupportedLanguage;
  onDismiss: () => void;
}

export const ActionOutcomeDispatch: React.FC<ActionOutcomeDispatchProps> = ({
  feedback,
  adrenaline,
  lang = 'en',
  onDismiss,
}) => {
  const [progress, setProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!feedback) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 6500; // 6.5s auto-dismiss
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (isPaused) return prev;
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [feedback, onDismiss, isPaused]);

  if (!feedback) return null;

  const isClean = feedback.tier === 'clean';
  const isCompromised = feedback.tier === 'compromised';
  const isFailure = feedback.tier === 'failure';
  const isBlocked = feedback.tier === 'blocked';

  const tierColors = {
    clean: {
      border: 'border-emerald-500/80',
      bg: 'bg-zinc-950/95',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      accent: 'text-emerald-400',
      progress: 'bg-emerald-500',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    },
    compromised: {
      border: 'border-amber-500/80',
      bg: 'bg-zinc-950/95',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      accent: 'text-amber-400',
      progress: 'bg-amber-500',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    },
    failure: {
      border: 'border-red-600/90',
      bg: 'bg-zinc-950/95',
      badge: 'bg-red-500/20 text-red-300 border-red-500/50',
      accent: 'text-red-400',
      progress: 'bg-red-600',
      glow: 'shadow-[0_0_30px_rgba(220,38,38,0.3)]',
    },
    blocked: {
      border: 'border-amber-500/90',
      bg: 'bg-zinc-950/95',
      badge: 'bg-amber-500/25 text-amber-300 border-amber-500/60',
      accent: 'text-amber-400',
      progress: 'bg-amber-500',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.35)]',
    },
  }[feedback.tier];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-24 sm:bottom-20 right-3 sm:right-6 left-3 sm:left-auto z-50 w-auto sm:w-full sm:max-w-lg rounded-2xl border-2 backdrop-blur-xl shadow-2xl p-4 sm:p-5 select-none transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${tierColors.border} ${tierColors.bg} ${tierColors.glow}`}
    >
      {/* ADRENALINE SCANNER HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-2.5 text-[10px] font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isBlocked
                ? 'bg-amber-400 animate-ping'
                : adrenaline.level >= 4
                ? 'bg-red-500 animate-ping'
                : adrenaline.level >= 3
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-zinc-300 font-bold truncate max-w-[240px] sm:max-w-xs">
            {isBlocked
              ? t('ui.tactical_warning', 'TACTICAL PRECONDITION WARNING', lang)
              : adrenaline.scannerStatusText}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold hidden sm:inline">
            {isBlocked ? 'STATUS: BLOCKED' : `TENSION ${adrenaline.score}%`}
          </span>
          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 cursor-pointer text-xs font-mono"
            title="Dismiss notification [ESC]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* OUTCOME TIER & ROLL MATH */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded border text-[11px] font-mono font-bold uppercase tracking-wider ${tierColors.badge}`}
          >
            {isClean
              ? t('ui.clean_success', 'CLEAN SUCCESS', lang)
              : isCompromised
              ? t('ui.compromised', 'COMPROMISED', lang)
              : isBlocked
              ? t('ui.action_blocked', 'ACTION BLOCKED', lang)
              : t('ui.blowback', 'BLOWBACK / FAILURE', lang)}
          </span>
          <span className="text-xs font-mono text-zinc-400">
            [{feedback.rollMath}]
          </span>
        </div>

        <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[160px] text-right">
          {feedback.title}
        </span>
      </div>

      {/* NARRATIVE OUTCOME BEAT */}
      <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed font-sans mb-3">
        {feedback.narrative}
      </p>

      {/* MECHANICAL CONSEQUENCE PILL */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-amber-300">
          <span className="text-[10px] uppercase text-zinc-500">
            {isBlocked
              ? t('ui.action_requirement', 'REQUIRED TO UNBLOCK', lang)
              : t('ui.outcome_result', 'PAYOUT // CONSEQUENCE', lang)}:
          </span>
          <span className="font-semibold">{feedback.summary}</span>
        </div>

        {adrenaline.isClimaxImminent && (
          <span className="text-[10px] uppercase font-bold text-red-400 animate-pulse hidden sm:inline">
            ⚡ CLIMAX DRAWING NEAR
          </span>
        )}
      </div>

      {/* AUTO-DISMISS COUNTDOWN BAR */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-900 overflow-hidden rounded-b-2xl">
        <div
          className={`h-full transition-all duration-75 ${tierColors.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
