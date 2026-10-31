'use client';

import React, { useState } from 'react';
import {
  canSelectDialogueResponse,
  ALL_CONTACT_DIALOGUES,
  CONTACT_DIALOGUES,
  DialogueResponse,
  FACTION_NAMES,
  hasAvailableUnclaimedDialogueReward,
} from '../data/contactDialogues';
import { ITEMS_CATALOG } from '../data/itemsCatalog';
import { applyDialogueReward } from '../engine/resolver';
import { soundscape } from '../engine/soundscape';
import { FactionId, GameState } from '../types/game';
import { SupportedLanguage } from '../types/settings';
import {
  t,
  getLocalizedDialogue,
  getLocalizedFactionName,
  getLocalizedItemName,
  getLocalizedStatName,
  getLocalizedTextByEnglishValue,
} from '../engine/i18n';

export { canSelectDialogueResponse, hasAvailableUnclaimedDialogueReward, FACTION_NAMES };

interface ContactDialogueModalProps {
  nodeId: string;
  nodeTitle: string;
  state: GameState;
  lang?: SupportedLanguage;
  onUpdateState: (nextState: GameState) => void;
  onClose: () => void;
}

export default function ContactDialogueModal({
  nodeId,
  nodeTitle,
  state,
  lang = 'en',
  onUpdateState,
  onClose,
}: ContactDialogueModalProps) {
  const rawTree = ALL_CONTACT_DIALOGUES[nodeId] ?? CONTACT_DIALOGUES[nodeId];
  const tree = rawTree ? getLocalizedDialogue(nodeId, rawTree, lang) : null;
  const [currentDialogueNodeId, setCurrentDialogueNodeId] = useState<string>(
    tree?.rootNodeId ?? 'root'
  );
  const [lastClaimedBanner, setLastClaimedBanner] = useState<string | null>(
    null
  );

  if (!tree) return null;

  const dialogueNode =
    tree.nodes[currentDialogueNodeId] ?? tree.nodes[tree.rootNodeId];
  const claimedList = state.claimedDialogueRewards ?? [];

  const handleSelectResponse = (response: DialogueResponse) => {
    const { allowed } = canSelectDialogueResponse(state, response);
    if (!allowed) {
      soundscape.playCrisisAlert();
      return;
    }

    // Apply one-time reward if present and not yet claimed
    if (
      response.rewardId &&
      response.effect &&
      !claimedList.includes(response.rewardId)
    ) {
      soundscape.playOutcome('clean');
      const nextState = applyDialogueReward(
        state,
        response.rewardId,
        response.effect,
        response.costCash
      );
      onUpdateState(nextState);
      setLastClaimedBanner(
        response.rewardSummary ?? response.effect.narrativeLog
      );
    } else {
      soundscape.playDieSelect();
    }

    if (response.nextNodeId === 'EXIT') {
      onClose();
    } else {
      setCurrentDialogueNodeId(response.nextNodeId);
    }
  };

  const factionRep =
    tree.factionId !== 'neutral' ? state.factionRep[tree.factionId] ?? 0 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* TOP HEADER WITH NPC PORTRAIT & FACTION STANDING */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-amber-950/25 border-b border-zinc-800">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={tree.avatar}
                alt={tree.contactName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-amber-500/60 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono text-[9px] font-bold uppercase">
                {t('dialogue.live', 'LIVE', lang)}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                  {nodeTitle}
                </span>
                {tree.factionId !== 'neutral' && factionRep !== null && (
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      factionRep > 0
                        ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                        : factionRep < 0
                        ? 'bg-red-950/60 border-red-600/60 text-red-300'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {getLocalizedFactionName(tree.factionId, lang)} {t('dialogue.rep', 'Rep', lang)}:{' '}
                    {factionRep > 0 ? `+${factionRep}` : factionRep}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mt-0.5">
                {tree.contactName}
              </h3>
              <p className="font-mono text-xs text-zinc-400">
                {tree.contactRole}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundscape.playDieSelect();
              onClose();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer"
            title="End Conversation"
          >
            {t('dialogue.esc', '✕ ESC', lang)}
          </button>
        </div>

        {/* DIALOGUE BODY & STAGE DIRECTION */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* STAGE MOOD LINE */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/90 font-mono text-xs text-amber-300/90 italic">
            * {dialogueNode.speakerMood}
          </div>

          {/* CLAIMED FAVOR FEEDBACK BANNER */}
          {lastClaimedBanner && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/60 flex items-center justify-between gap-2 font-mono text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">★</span>
                <span>
                  <strong className="text-emerald-300">
                    {t('dialogue.intel_secured', 'INTEL SECURED:', lang)}
                  </strong>{' '}
                  {getLocalizedTextByEnglishValue(lastClaimedBanner, lang)}
                </span>
              </div>
              <button
                onClick={() => setLastClaimedBanner(null)}
                className="text-[10px] text-emerald-400 hover:underline shrink-0 cursor-pointer"
              >
                {t('ui.dismiss', 'Dismiss', lang)}
              </button>
            </div>
          )}

          {/* SPOKEN PARAGRAPHS */}
          <div className="space-y-3 text-sm sm:text-base text-zinc-100 leading-relaxed pl-3 border-l-2 border-amber-500/50">
            {dialogueNode.paragraphs.map((para, idx) => (
              <p key={idx} className="text-zinc-200">
                {para}
              </p>
            ))}
          </div>

          {/* PLAYER RESPONSE OPTIONS */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              <span>{t('dialogue.select_response', 'Select Interrogation / Response Line (0 Dice Cost)', lang)}</span>
              <span>{t('dialogue.cash', 'Cash', lang)}: R{state.cash}</span>
            </div>

            {dialogueNode.responses.map((resp) => {
              const { allowed, lockReason } = canSelectDialogueResponse(
                state,
                resp
              );
              const isRewardClaimed =
                resp.rewardId && claimedList.includes(resp.rewardId);

              return (
                <button
                  key={resp.id}
                  onClick={() => handleSelectResponse(resp)}
                  disabled={!allowed}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    !allowed
                      ? 'bg-zinc-900/30 border-zinc-800/60 text-zinc-500 cursor-not-allowed opacity-70'
                      : isRewardClaimed
                      ? 'bg-zinc-900/80 border-zinc-700 hover:border-amber-500/50 text-zinc-200 cursor-pointer'
                      : resp.rewardId
                      ? 'bg-amber-950/20 border-amber-500/50 hover:bg-amber-950/35 hover:border-amber-400 text-amber-100 shadow-sm cursor-pointer'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-200 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium leading-snug">
                      {resp.label}
                    </span>
                    {resp.nextNodeId === 'EXIT' && (
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        {t('dialogue.leave', 'Leave', lang)}
                      </span>
                    )}
                  </div>

                  {/* REQUIREMENT & REWARD BADGES */}
                  {(resp.requiredStat ||
                    resp.requiredItem ||
                    resp.requiredFactionRep ||
                    resp.rewardSummary ||
                    !allowed) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[10px]">
                      {resp.requiredStat && (
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            allowed
                              ? 'bg-sky-950/60 border-sky-600/50 text-sky-300'
                              : 'bg-red-950/50 border-red-800/60 text-red-300'
                          }`}
                        >
                          {t('ui.stat_check', 'Stat Check', lang)}: {getLocalizedStatName(resp.requiredStat.stat, lang)} &ge;{' '}
                          {resp.requiredStat.min}
                        </span>
                      )}

                      {resp.requiredItem && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                            allowed
                              ? 'bg-purple-950/60 border-purple-600/50 text-purple-300'
                              : 'bg-red-950/50 border-red-800/60 text-red-300'
                          }`}
                        >
                          {t('dialogue.evidence', 'Evidence', lang)}:{' '}
                          {getLocalizedItemName(resp.requiredItem, lang)}
                        </span>
                      )}

                      {resp.requiredFactionRep && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                            allowed
                              ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                              : 'bg-red-950/50 border-red-800/60 text-red-300'
                          }`}
                        >
                          {getLocalizedFactionName(resp.requiredFactionRep.factionId, lang)}{' '}
                          {t('dialogue.rep', 'Rep', lang)} &ge; +{resp.requiredFactionRep.min}
                        </span>
                      )}

                      {!allowed && lockReason && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/70 border border-red-700/60 text-red-300">
                          {t('dialogue.locked', 'LOCKED', lang)}: {lockReason}
                        </span>
                      )}

                      {resp.rewardSummary && !isRewardClaimed && allowed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold">
                          ★ {t('dialogue.one_time_intel', 'One-Time Intel', lang)}: {resp.rewardSummary}
                        </span>
                      )}

                      {isRewardClaimed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
                          {t('dialogue.intel_claimed', '✓ Intel Already Claimed', lang)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
