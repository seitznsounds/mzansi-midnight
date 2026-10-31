'use client';

import React, { useEffect } from 'react';
import { GameState } from '../types/game';
import { EVENT_DECK } from '../data/eventDeck';
import { HIGHVELD_EVENT_DECK } from '../data/story2HighveldEvents';
import { NAMAQUA_EVENT_DECK } from '../data/story3NamaquaEvents';
import { CAPE_EVENT_DECK } from '../data/story4CapeEvents';
import { OCTAGON_EVENT_DECK } from '../data/story5OctagonEvents';
import { EventChoice } from '../types/events';
import { SupportedLanguage } from '../types/settings';
import { t, getLocalizedEvent, getLocalizedItemName } from '../engine/i18n';
import { resolveTriggeredEvent } from '../engine/eventResolver';
import { soundscape } from '../engine/soundscape';

const EVENT_PORTRAIT_MAP: Record<string, string> = {
  evt_trt_safehouse_raid: '/assets/characters/mokoena.jpg',
  evt_nandi_critical: '/assets/characters/nandi.jpg',
  evt_shanela_roadblock: '/assets/nodes/n3_central_precinct.jpg',
  evt_docket_decoded: '/assets/nodes/n4_city_hall.jpg',
  evt_phone_decrypted: '/assets/characters/sparks.jpg',
  evt_climax_berth14: '/assets/characters/zuko.jpg',
  evt_composure_breakdown: '/assets/nodes/n1_safehouse.jpg',
  evt_morning_masibi_wire: '/assets/nodes/n4_city_hall.jpg',
  evt_morning_cable_theft: '/assets/characters/bheki.jpg',
  evt_morning_port_tipoff: '/assets/nodes/n6_pier2_port.jpg',
  // Story 2 Highveld Event Portraits
  evt_highveld_blackout_crisis: '/assets/nodes/h3_hillbrow_substation.jpg',
  evt_highveld_shaft_collapse: '/assets/nodes/h4_witwatersrand_shaft.jpg',
  evt_highveld_nia_raid: '/assets/characters/sithole.jpg',
  evt_highveld_tribunal_ready: '/assets/characters/khumalo.jpg',
  evt_highveld_midas_decrypted: '/assets/nodes/h7_siu_headquarters.jpg',
  evt_highveld_climax_kendon: '/assets/characters/helena.jpg',
  // Story 3 Namaqua Event Portraits
  evt_namaqua_malmokken_storm: '/assets/nodes/m1_port_nolloth_jetty.jpg',
  evt_namaqua_naval_intercept: '/assets/characters/petrov.jpg',
  evt_namaqua_heat_exhaustion: '/assets/nodes/m3_richtersveld_canyon.jpg',
  evt_namaqua_diver_embolism: '/assets/characters/swartbooi.jpg',
  evt_namaqua_climax_arms_drop: '/assets/nodes/m5_orange_river_pont.jpg',
  evt_namaqua_climax_admiralty: '/assets/characters/cloete.jpg',
  // Story 4 Cape Event Portraits
  evt_gang_war_escalation: '/assets/nodes/c2_manenberg_tenements.jpg',
  evt_gale_force_blackout: '/assets/nodes/c1_long_street_strip.jpg',
  evt_swart_death_squad: '/assets/characters/general_swart.jpg',
  evt_red_cipher_unlocked: '/assets/characters/warren.jpg',
  evt_extortion_ring_smashed: '/assets/characters/zack.jpg',
  evt_climax_pier109: '/assets/nodes/c4_table_bay_berth.jpg',
  // Story 5 Octagon Event Portraits
  evt_black_sky_collapse: '/assets/nodes/o3_apollo_scada.jpg',
  evt_mercenary_air_assault: '/assets/nodes/o1_drakensberg_redoubt.jpg',
  evt_radar_blackout_hazard: '/assets/nodes/o5_karoo_ew_corridor.jpg',
  evt_coup_declaration_crisis: '/assets/characters/phumzile.jpg',
  evt_treason_docket_complete: '/assets/characters/sindi.jpg',
  evt_omega_cipher_decrypted: '/assets/characters/kabelo.jpg',
  evt_summit_breach_climax: '/assets/characters/sterling_swart.jpg',
};

export const EventModal: React.FC<{
  state: GameState;
  lang?: SupportedLanguage;
  onResolve: (nextState: GameState) => void;
}> = ({ state, lang = 'en', onResolve }) => {
  const activeEventId = state.triggeredEventsQueue[0];
  const allEvents = {
    ...EVENT_DECK,
    ...HIGHVELD_EVENT_DECK,
    ...NAMAQUA_EVENT_DECK,
    ...CAPE_EVENT_DECK,
    ...OCTAGON_EVENT_DECK,
  };

  useEffect(() => {
    if (!activeEventId) return;
    const ev = allEvents[activeEventId];
    if (ev?.category === 'threat_crisis') {
      soundscape.playCrisisAlert();
    } else if (ev) {
      soundscape.playOutcome('clean');
    }
  }, [activeEventId]);

  if (!activeEventId) return null;

  const rawEvent = allEvents[activeEventId];
  if (!rawEvent) return null;
  const event = getLocalizedEvent(rawEvent, lang);

  const isThreat = event.category === 'threat_crisis';
  const isWorldEvent = event.category === 'world_event';
  const portraitSrc = EVENT_PORTRAIT_MAP[event.id];

  // Helper to check if player meets requirements for a gated option
  const checkChoiceEligibility = (
    choice: EventChoice
  ): { allowed: boolean; reason?: string } => {
    if (choice.requiredCash && state.cash < choice.requiredCash) {
      return {
        allowed: false,
        reason: `Requires R${choice.requiredCash} (Have R${state.cash})`,
      };
    }
    if (choice.requiredItem && !state.inventory.includes(choice.requiredItem)) {
      return { allowed: false, reason: `Missing item: ${choice.requiredItem}` };
    }
    if (
      choice.requiredAnyItem &&
      !choice.requiredAnyItem.some((item) => state.inventory.includes(item))
    ) {
      return {
        allowed: false,
        reason: 'Requires Decoded Tanker Ledger or Berth 14 Manifest',
      };
    }
    if (choice.requiredStat) {
      const playerStat = state.stats[choice.requiredStat.stat];
      if (playerStat < choice.requiredStat.min) {
        return {
          allowed: false,
          reason: `Requires ${choice.requiredStat.stat.toUpperCase()} +${
            choice.requiredStat.min
          }`,
        };
      }
    }
    if (choice.requiredFactionRep) {
      const rep = state.factionRep[choice.requiredFactionRep.factionId];
      if (rep < choice.requiredFactionRep.min) {
        return {
          allowed: false,
          reason: `Requires ${choice.requiredFactionRep.factionId} Rep >= ${choice.requiredFactionRep.min}`,
        };
      }
    }
    return { allowed: true };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div
        className={`w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl border-2 bg-zinc-950 shadow-2xl overflow-hidden ${
          isThreat
            ? 'border-red-600/80 shadow-[0_0_50px_rgba(220,38,38,0.2)]'
            : isWorldEvent
            ? 'border-cyan-400/80 shadow-[0_0_50px_rgba(34,211,238,0.16)]'
            : 'border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.15)]'
        }`}
      >
        {/* TOP HEADER BANNER */}
        <div
          className={`px-4 sm:px-6 py-2.5 sm:py-3 border-b flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest shrink-0 ${
            isThreat
              ? 'bg-red-950/50 border-red-900 text-red-300'
              : isWorldEvent
              ? 'bg-cyan-950/40 border-cyan-900 text-cyan-300'
              : 'bg-amber-950/40 border-amber-900 text-amber-300'
          }`}
        >
          <span>
            {isThreat
              ? t('events.header.threat', 'CRITICAL THREAT TRIGGERED', lang)
              : isWorldEvent
              ? t('events.header.world', 'ENCRYPTED MORNING WIRE // STREET DISPATCH', lang)
              : t('events.header.investigation', 'INVESTIGATION BREAKTHROUGH', lang)}
          </span>
          <span>{event.locationLabel}</span>
        </div>

        {/* EVENT BODY CONTENT */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            {portraitSrc && (
              <img
                src={portraitSrc}
                alt={event.title}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-zinc-700 shrink-0"
              />
            )}
            <div>
              <h2 className="text-lg sm:text-2xl font-medium text-zinc-100">{event.title}</h2>
              {event.speakerName && (
                <p className="text-[11px] sm:text-xs font-mono text-amber-400 mt-1">
                  {event.speakerName} —{' '}
                  <span className="text-zinc-400">{event.speakerRole}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-zinc-300 border-l-2 border-zinc-800 pl-4">
            {event.bodyText.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* CHOICES LIST */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono uppercase text-zinc-500">
              {t('events.select_response', 'Select Your Response:', lang)}
            </div>
            {event.choices.map((choice) => {
              const { allowed, reason } = checkChoiceEligibility(choice);

              return (
                <button
                  key={choice.id}
                  disabled={!allowed}
                  onClick={() => {
                    soundscape.playDieSelect();
                    onResolve(resolveTriggeredEvent(state, event.id, choice.id));
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    allowed
                      ? 'bg-zinc-900/90 border-zinc-700 hover:border-amber-400 hover:bg-zinc-900 cursor-pointer'
                      : 'bg-zinc-950 border-zinc-900 opacity-45 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-sm font-medium text-zinc-100">
                      {choice.label}
                    </span>
                    {!allowed && (
                      <span className="text-xs font-mono text-red-400 bg-red-950/40 px-2 py-0.5 rounded self-start sm:self-auto">
                        {t('events.locked', 'LOCKED', lang)}: {reason}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400">{choice.description}</p>

                  {/* Consequence Pills */}
                  <div className="flex flex-wrap gap-2 mt-1 text-[11px] font-mono">
                    {choice.requiredCash && (
                      <span className="text-amber-400">-R{choice.requiredCash}</span>
                    )}
                    {choice.effect.composureDelta && (
                      <span
                        className={
                          choice.effect.composureDelta > 0
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {choice.effect.composureDelta > 0 ? '+' : ''}
                        {choice.effect.composureDelta} {t('events.composure', 'Composure', lang)}
                      </span>
                    )}
                    {choice.effect.addInventoryItem && (
                      <span className="text-cyan-400">
                        +{t('events.item', 'Item', lang)}: {getLocalizedItemName(choice.effect.addInventoryItem, lang)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
