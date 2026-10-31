import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageInfo,
} from '../types/settings';
import {
  MapNode,
  ActionSlot,
  ActionEffect,
  Clock,
  FactionId,
} from '../types/game';
import { NarrativeEvent, EventChoice } from '../types/events';
import { CharacterBackground, PrologueSceneNode } from '../types/prologue';
import {
  ContactDialogueTree,
  DialogueNode,
} from '../data/contactDialogues';
import { ActEnding } from '../data/endings';
import { CatalogItem } from '../data/itemsCatalog';
import type { TacticalRecommendation } from './advisor';
import type { StoryMetadata, KeystoneDossier } from '../types/campaign';

import en from '../data/i18n/en.json';
import zu from '../data/i18n/zu.json';
import xh from '../data/i18n/xh.json';
import af from '../data/i18n/af.json';
import st from '../data/i18n/st.json';
import nso from '../data/i18n/nso.json';
import tn from '../data/i18n/tn.json';
import ts from '../data/i18n/ts.json';
import ss from '../data/i18n/ss.json';
import ve from '../data/i18n/ve.json';
import nr from '../data/i18n/nr.json';

const DICTIONARIES: Record<SupportedLanguage, Record<string, string>> = {
  en: en as Record<string, string>,
  zu: zu as Record<string, string>,
  xh: xh as Record<string, string>,
  af: af as Record<string, string>,
  st: st as Record<string, string>,
  nso: nso as Record<string, string>,
  tn: tn as Record<string, string>,
  ts: ts as Record<string, string>,
  ss: ss as Record<string, string>,
  ve: ve as Record<string, string>,
  nr: nr as Record<string, string>,
};

// Antigravity i18n Master Bundle (All 11 SA Official Languages)

/**
 * Look up a localized string for the specified language.
 * Falls back to English (en) if the translation does not exist in the active language,
 * and finally to the provided fallback or the key itself.
 */
export function t(
  key: string,
  fallback?: string,
  lang: SupportedLanguage = 'en'
): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  if (dict && typeof dict[key] === 'string' && dict[key].trim().length > 0) {
    return dict[key];
  }

  // Fallback to English dictionary
  const enDict = DICTIONARIES.en;
  if (enDict && typeof enDict[key] === 'string' && enDict[key].trim().length > 0) {
    return enDict[key];
  }

  return fallback !== undefined ? fallback : key;
}

/**
 * Get language metadata by language code.
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return (
    found || {
      code,
      name: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      region: 'South Africa',
    }
  );
}

/**
 * Helper to get a localized District Node title, district description, and body.
 * Supports both getLocalizedNode('n1_safehouse', 'Safehouse', 'CBD', 'en') and getLocalizedNode(node, 'zu')
 */
export function getLocalizedNode(
  nodeOrId: MapNode | string,
  titleOrLang?: string | SupportedLanguage,
  subtitle?: string,
  langArg: SupportedLanguage = 'en'
): { title: string; district: string; desc?: string } {
  if (typeof nodeOrId === 'object' && nodeOrId !== null) {
    const lang = (titleOrLang as SupportedLanguage) || 'en';
    return {
      title: t(`node.${nodeOrId.id}.title`, nodeOrId.title, lang),
      district: t(`node.${nodeOrId.id}.district`, nodeOrId.subtitle, lang),
      desc: t(`node.${nodeOrId.id}.desc`, '', lang),
    };
  }
  const nodeId = nodeOrId;
  const baseTitle = (titleOrLang as string) || '';
  const baseSubtitle = subtitle || '';
  const lang = langArg;
  return {
    title: t(`node.${nodeId}.title`, baseTitle, lang),
    district: t(`node.${nodeId}.district`, baseSubtitle, lang),
    desc: t(`node.${nodeId}.desc`, '', lang),
  };
}

/**
 * Helper to get a localized ActionSlot with translated title, description, and outcome tier logs.
 */
export function getLocalizedSlot(
  slot: ActionSlot,
  lang: SupportedLanguage = 'en'
): ActionSlot {
  return {
    ...slot,
    title: t(`slot.${slot.id}.title`, slot.title, lang),
    description: t(`slot.${slot.id}.desc`, slot.description, lang),
    outcomes: {
      clean: {
        ...slot.outcomes.clean,
        narrativeLog: t(
          `slot.${slot.id}.clean`,
          slot.outcomes.clean.narrativeLog,
          lang
        ),
      },
      compromised: {
        ...slot.outcomes.compromised,
        narrativeLog: t(
          `slot.${slot.id}.compromised`,
          slot.outcomes.compromised.narrativeLog,
          lang
        ),
      },
      failure: {
        ...slot.outcomes.failure,
        narrativeLog: t(
          `slot.${slot.id}.failure`,
          slot.outcomes.failure.narrativeLog,
          lang
        ),
      },
    },
  };
}

/**
 * Helper to get a localized Threat or World Clock.
 */
export function getLocalizedClock(
  clock: Clock,
  lang: SupportedLanguage = 'en'
): Clock {
  return {
    ...clock,
    title: t(`clock.${clock.id}.title`, clock.title, lang),
    description: t(`clock.${clock.id}.desc`, clock.description, lang),
  };
}

/**
 * Helper to get a localized Threat Clock title.
 */
export function getLocalizedClockTitle(
  clockId: string,
  baseTitle: string,
  lang: SupportedLanguage = 'en'
): string {
  return t(`clock.${clockId}.title`, baseTitle, lang);
}

/**
 * Helper to get a localized Evidence / Gear Item label.
 */
export function getLocalizedItemName(
  itemId: string,
  baseName: string,
  lang: SupportedLanguage = 'en'
): string {
  return t(`item.${itemId}`, t(`item.${itemId}.name`, baseName, lang), lang);
}

/**
 * Helper to get a localized CatalogItem with translated title and description.
 */
export function getLocalizedCatalogItem(
  item: CatalogItem,
  lang: SupportedLanguage = 'en'
): CatalogItem {
  return {
    ...item,
    title: t(`item.${item.id}.name`, t(`item.${item.id}`, item.title, lang), lang),
    summary: t(`item.${item.id}.desc`, item.summary, lang),
    gameplayEffect: t(`item.${item.id}.effect`, item.gameplayEffect, lang),
  };
}

/**
 * Helper to get a localized Faction name.
 */
export function getLocalizedFactionName(
  factionId: string,
  baseName: string,
  lang: SupportedLanguage = 'en'
): string {
  return t(`faction.${factionId}`, baseName, lang);
}

/**
 * Helper to get a fully localized NarrativeEvent with translated paragraphs and choices.
 */
export function getLocalizedEvent(
  event: NarrativeEvent,
  lang: SupportedLanguage = 'en'
): NarrativeEvent {
  const localizedBody = Array.isArray(event.bodyText)
    ? event.bodyText.map((p, idx) =>
        t(`event.${event.id}.p${idx + 1}`, p, lang)
      )
    : event.bodyText;

  const localizedChoices: EventChoice[] = Array.isArray(event.choices)
    ? event.choices.map((choice) => ({
        ...choice,
        label: t(`choice.${choice.id}.label`, choice.label, lang),
        description: t(`choice.${choice.id}.desc`, choice.description, lang),
        effect: choice.effect
          ? {
              ...choice.effect,
              narrativeLog: t(
                `choice.${choice.id}.log`,
                choice.effect.narrativeLog,
                lang
              ),
            }
          : choice.effect,
      }))
    : event.choices;

  return {
    ...event,
    title: t(`event.${event.id}.title`, event.title, lang),
    speakerName: event.speakerName
      ? t(`event.${event.id}.speaker`, event.speakerName, lang)
      : event.speakerName,
    speakerRole: event.speakerRole
      ? t(`event.${event.id}.role`, event.speakerRole, lang)
      : event.speakerRole,
    locationLabel: event.locationLabel
      ? t(`event.${event.id}.location`, event.locationLabel, lang)
      : event.locationLabel,
    bodyText: localizedBody,
    choices: localizedChoices,
  };
}


/**
 * Helper to get a fully localized ContactDialogueTree with translated dialogue nodes and responses.
 */
export function getLocalizedDialogue(
  nodeId: string,
  dialogue: ContactDialogueTree,
  lang: SupportedLanguage = 'en'
): ContactDialogueTree {
  const localizedNodes: Record<string, DialogueNode> = {};
  if (dialogue.nodes) {
    for (const [dnodeId, dnode] of Object.entries(dialogue.nodes)) {
      const localizedParagraphs = Array.isArray(dnode.paragraphs)
        ? dnode.paragraphs.map((p, idx) =>
            t(`dialogue.${nodeId}.${dnodeId}.p${idx + 1}`, p, lang)
          )
        : dnode.paragraphs;

      const localizedResponses = Array.isArray(dnode.responses)
        ? dnode.responses.map((resp) => ({
            ...resp,
            label: t(`dialogue_resp.${resp.id}.label`, resp.label, lang),
            rewardSummary: resp.rewardSummary
              ? t(
                  `dialogue_resp.${resp.id}.reward`,
                  getLocalizedTextByEnglishValue(resp.rewardSummary, lang),
                  lang
                )
              : resp.rewardSummary,
          }))
        : dnode.responses;

      const localizedSpeakerMood = dnode.speakerMood
        ? t(
            `dialogue.${nodeId}.${dnodeId}.mood`,
            getLocalizedTextByEnglishValue(dnode.speakerMood, lang),
            lang
          )
        : dnode.speakerMood;

      localizedNodes[dnodeId] = {
        ...dnode,
        speakerMood: localizedSpeakerMood,
        paragraphs: localizedParagraphs,
        responses: localizedResponses,
      };
    }
  }

  return {
    ...dialogue,
    contactName: t(`dialogue.${nodeId}.name`, dialogue.contactName, lang),
    contactRole: t(`dialogue.${nodeId}.role`, dialogue.contactRole, lang),
    nodes: localizedNodes,
  };
}

/**
 * Helper to get a fully localized ActEnding record.
 */
export function getLocalizedEnding(
  ending: ActEnding,
  lang: SupportedLanguage = 'en'
): ActEnding {
  if (!ending) return ending;

  const localizedParagraphs = Array.isArray(ending.epilogueParagraphs)
    ? ending.epilogueParagraphs.map((p: string, idx: number) =>
        t(`ending.${ending.id}.p${idx + 1}`, p, lang)
      )
    : ending.epilogueParagraphs;

  const localizedCityAftermath = Array.isArray(ending.cityAftermath)
    ? ending.cityAftermath.map(
        (item: { heading: string; detail: string }, idx: number) => ({
          heading: t(
            `ending.${ending.id}.shift${idx + 1}.title`,
            item.heading,
            lang
          ),
          detail: t(
            `ending.${ending.id}.shift${idx + 1}.summary`,
            item.detail,
            lang
          ),
        })
      )
    : ending.cityAftermath;

  return {
    ...ending,
    pathLabel: t(`ending.${ending.id}.pathLabel`, ending.pathLabel, lang),
    title: t(`ending.${ending.id}.title`, ending.title, lang),
    subtitle: t(`ending.${ending.id}.subtitle`, ending.subtitle, lang),
    summaryQuote: t(`ending.${ending.id}.quote`, ending.summaryQuote, lang),
    act2Hook: ending.act2Hook
      ? t(`ending.${ending.id}.hook`, ending.act2Hook, lang)
      : ending.act2Hook,
    epilogueParagraphs: localizedParagraphs,
    cityAftermath: localizedCityAftermath,
  };
}

/**
 * Helper to get a localized CharacterBackground for the prologue.
 */
export function getLocalizedBackground(
  bg: CharacterBackground,
  lang: SupportedLanguage = 'en'
): CharacterBackground {
  return {
    ...bg,
    title: t(`bg.${bg.id}.title`, bg.title, lang),
    formerUnit: t(`bg.${bg.id}.former_unit`, bg.formerUnit, lang),
    tagline: t(`bg.${bg.id}.tagline`, bg.tagline, lang),
    description: t(`bg.${bg.id}.desc`, bg.description, lang),
  };
}

/**
 * Helper to get a localized PrologueSceneNode.
 */
export function getLocalizedPrologueNode(
  pnode: PrologueSceneNode,
  lang: SupportedLanguage = 'en'
): PrologueSceneNode {
  return {
    ...pnode,
    timestamp: t(`pnode.${pnode.id}.time`, pnode.timestamp, lang),
    speaker: pnode.speaker
      ? t(`pnode.${pnode.id}.speaker`, pnode.speaker, lang)
      : pnode.speaker,
    speakerRole: pnode.speakerRole
      ? t(`pnode.${pnode.id}.role`, pnode.speakerRole, lang)
      : pnode.speakerRole,
    paragraphs: Array.isArray(pnode.paragraphs)
      ? pnode.paragraphs.map((p, idx) =>
          t(`pnode.${pnode.id}.p${idx + 1}`, p, lang)
        )
      : pnode.paragraphs,
    options: Array.isArray(pnode.options)
      ? pnode.options.map((opt) => ({
          ...opt,
          label: t(`popt.${opt.id}.label`, opt.label, lang),
        }))
      : pnode.options,
  };
}

/**
 * Formats mechanical outcome summaries (e.g. "+2 Clocks", "-10% Composure") cleanly with localized tags.
 */
export function formatLocalizedOutcomeSummary(
  effect: ActionEffect,
  lang: SupportedLanguage = 'en'
): string {
  const parts: string[] = [];
  if (effect.clockProgress && effect.clockProgress.length > 0) {
    for (const cp of effect.clockProgress) {
      parts.push(
        `${cp.delta > 0 ? '+' : ''}${cp.delta} ${t('ui.active_clocks', 'Clock', lang)}`
      );
    }
  }
  if (effect.cashDelta) {
    parts.push(`${effect.cashDelta > 0 ? '+' : ''}R${effect.cashDelta}`);
  }
  if (effect.composureDelta) {
    parts.push(
      `${effect.composureDelta > 0 ? '+' : ''}${effect.composureDelta}% ${t('ui.composure', 'Composure', lang)}`
    );
  }
  if (effect.addInventoryItem) {
    parts.push(
      `+ ${getLocalizedItemName(effect.addInventoryItem, effect.addInventoryItem, lang)}`
    );
  }
  return parts.length > 0
    ? parts.join(' • ')
    : t('ui.clean_success', 'Resolved', lang);
}

/**
 * Helper to get a localized TacticalRecommendation for ObjectiveTracker.
 */
export function getLocalizedRecommendation(
  rec: TacticalRecommendation,
  lang: SupportedLanguage = 'en'
): TacticalRecommendation {
  if (!rec) return rec;

  let localizedBadge = rec.badgeLabel;
  if (rec.badgeLabel === 'FREE CONTACT INTEL (0 DICE)') {
    localizedBadge = t('advisor.badge.free_intel', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'CYCLE COMPLETE') {
    localizedBadge = t('advisor.badge.cycle_complete', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'URGENT MEDICAL CRISIS') {
    localizedBadge = t('advisor.badge.medical_crisis', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'IMMINENT TRT RAID') {
    localizedBadge = t('advisor.badge.trt_raid', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'HIT SQUAD CLOSING IN') {
    localizedBadge = t('advisor.badge.hit_squad', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'WARRANT IMMINENT') {
    localizedBadge = t('advisor.badge.warrant', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'LOW COMPOSURE WARNING') {
    localizedBadge = t('advisor.badge.low_composure', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'ACT 2 FINALE UNLOCKED') {
    localizedBadge = t('advisor.badge.act2_finale', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'ACT 1 CLIMAX UNLOCKED') {
    localizedBadge = t('advisor.badge.act1_climax', rec.badgeLabel, lang);
  } else if (rec.badgeLabel === 'RECOMMENDED NEXT MOVE') {
    localizedBadge = t('advisor.badge.recommended', rec.badgeLabel, lang);
  } else {
    localizedBadge = t(`advisor.badge.${rec.badgeLabel}`, rec.badgeLabel, lang);
  }

  const targetNodeTitle = rec.targetNodeId
    ? getLocalizedNode(rec.targetNodeId, '', '', lang).title
    : '';

  let localizedHeadline = rec.headline;
  if (rec.headline.startsWith('Unclaimed Intel Available at ')) {
    localizedHeadline = t(
      'advisor.headline.unclaimed_intel',
      'Unclaimed Intel Available at {node}',
      lang
    ).replace('{node}', targetNodeTitle || rec.headline.replace('Unclaimed Intel Available at ', ''));
  } else if (rec.headline.includes('All Action Dice Spent')) {
    localizedHeadline = t('advisor.headline.cycle_complete', rec.headline, lang);
  } else if (rec.headline.includes("Constable Nandi's Wound")) {
    localizedHeadline = t('advisor.headline.nandi_wound', rec.headline, lang);
  } else if (rec.headline.includes("Mokoena's Sweep is")) {
    localizedHeadline = t('advisor.headline.mokoena_sweep', rec.headline, lang);
  } else if (rec.headline.includes('Izinkabi Hit Squad at')) {
    localizedHeadline = t('advisor.headline.hit_squad', rec.headline, lang);
  } else if (rec.headline.includes('Contempt Warrant at')) {
    localizedHeadline = t('advisor.headline.contempt_warrant', rec.headline, lang);
  } else if (rec.headline.startsWith('Composure at ')) {
    localizedHeadline = t('advisor.headline.low_composure', rec.headline, lang);
  } else if (rec.headline.includes('Both Supreme Exhibits Secured')) {
    localizedHeadline = t('advisor.headline.both_act2_exhibits', rec.headline, lang);
  } else if (rec.headline.includes('Hangar 7 & Citrus Estate Unlocked')) {
    localizedHeadline = t('advisor.headline.one_act2_exhibit', rec.headline, lang);
  } else if (rec.headline.includes('Full Dossier & Audio Secured')) {
    localizedHeadline = t('advisor.headline.both_act1_exhibits', rec.headline, lang);
  } else if (rec.headline.includes('Berth 14 Climax Ready')) {
    localizedHeadline = t('advisor.headline.one_act1_exhibit', rec.headline, lang);
  } else if (rec.headline.includes('Extract Tanker GPS at Northern Township Depot')) {
    localizedHeadline = t('advisor.headline.act2_stage6', rec.headline, lang);
  } else if (rec.headline.includes('File Section 205 Subpoena')) {
    localizedHeadline = t('advisor.headline.subpoena_high_court', rec.headline, lang);
  } else if (rec.headline.includes('Pull Black-Box GPS')) {
    localizedHeadline = t('advisor.headline.gps_depot', rec.headline, lang);
  } else if (rec.headline.includes("Crack Auditor's Handset")) {
    localizedHeadline = t('advisor.headline.crack_handset', rec.headline, lang);
  } else if (rec.headline.includes('Cross-Reference Docket #409')) {
    localizedHeadline = t('advisor.headline.audit_docket', rec.headline, lang);
  }

  let localizedHint = rec.hint;
  if (rec.hint.includes('and click "Speak with Contact" in the right drawer')) {
    localizedHint = t(
      'advisor.hint.unclaimed_intel',
      'Select {node} and click "Speak with Contact" in the right drawer to claim a free stat/evidence breakthrough without spending a die!',
      lang
    ).replace('{node}', targetNodeTitle || 'Node');
  } else if (rec.hint.includes('Click "End Cycle →" in the bottom-right bar')) {
    localizedHint = t('advisor.hint.cycle_complete', rec.hint, lang);
  } else if (rec.hint.includes('Call Dr. Maharaj')) {
    localizedHint = t('advisor.hint.nandi_surgeon', rec.hint, lang);
  } else if (rec.hint.includes('Rest & Patch Up Nandi" (R300) or speak with Nandi')) {
    localizedHint = t('advisor.hint.nandi_patch', rec.hint, lang);
  } else if (rec.hint.includes('Tap the Driver Network')) {
    localizedHint = t('advisor.hint.mokoena_sweep', rec.hint, lang);
  } else if (rec.hint.includes('Coordinate with Strike Committee')) {
    localizedHint = t('advisor.hint.hit_squad', rec.hint, lang);
  } else if (rec.hint.includes('File Section 205 Offshore Subpoena')) {
    localizedHint = t('advisor.hint.contempt_warrant', rec.hint, lang);
  } else if (rec.hint.includes('Mercury Arcade Flat ("Rest & Patch Up Nandi")')) {
    localizedHint = t('advisor.hint.recover_act1', rec.hint, lang);
  } else if (rec.hint.includes('Witness Protection Safe-Room Debrief')) {
    localizedHint = t('advisor.hint.recover_act2', rec.hint, lang);
  } else if (rec.hint.includes('purple "Hangar 7 Finale →" button')) {
    localizedHint = t('advisor.hint.act2_finale', rec.hint, lang);
  } else if (rec.hint.includes('purple "Berth 14 Finale →" button')) {
    localizedHint = t('advisor.hint.act1_finale', rec.hint, lang);
  } else if (rec.hint.includes('Stage 6 Load Shedding has locked computer servers')) {
    localizedHint = t('advisor.hint.act2_stage6', rec.hint, lang);
  } else if (rec.hint.includes('Trace Sovereign Pearl Trust')) {
    localizedHint = t('advisor.hint.subpoena_high_court', rec.hint, lang);
  } else if (rec.hint.includes('Synthesize Super-Lab Telemetry')) {
    localizedHint = t('advisor.hint.gps_depot', rec.hint, lang);
  } else if (rec.hint.includes('Crack Auditor’s Handset')) {
    localizedHint = t('advisor.hint.crack_handset', rec.hint, lang);
  } else if (rec.hint.includes('Audit Docket #409')) {
    localizedHint = t('advisor.hint.audit_docket', rec.hint, lang);
  }

  let localizedActionButton = rec.actionButtonLabel;
  if (rec.actionButtonLabel) {
    if (rec.actionButtonLabel.startsWith('Visit ')) {
      localizedActionButton = t(
        'advisor.action.visit_node',
        'Visit {node} →',
        lang
      ).replace('{node}', targetNodeTitle ? targetNodeTitle.split(' ')[0] : 'Node');
    } else if (rec.actionButtonLabel.includes('Safehouse')) {
      localizedActionButton = t('advisor.action.safehouse', rec.actionButtonLabel, lang);
    } else if (rec.actionButtonLabel.includes('Evade Sweep')) {
      localizedActionButton = t('advisor.action.evade_sweep', rec.actionButtonLabel, lang);
    } else if (rec.actionButtonLabel.includes('Depot')) {
      localizedActionButton = t('advisor.action.jump_depot', rec.actionButtonLabel, lang);
    } else if (rec.actionButtonLabel.includes('High Court')) {
      localizedActionButton = t('advisor.action.jump_high_court', rec.actionButtonLabel, lang);
    } else if (rec.actionButtonLabel.includes('Recover Composure')) {
      localizedActionButton = t('advisor.action.recover_composure', rec.actionButtonLabel, lang);
    } else if (rec.actionButtonLabel.includes('Finale')) {
      localizedActionButton = t('advisor.action.finale', rec.actionButtonLabel, lang);
    } else if (rec.actionButtonLabel.includes('Show Slot')) {
      localizedActionButton = t('advisor.action.show_slot', rec.actionButtonLabel, lang);
    }
  }

  let localizedStepTitle = rec.campaignStepTitle;
  if (rec.campaignStepTitle === 'Step 1/3: Decode Docket #409 or Crack Phone') {
    localizedStepTitle = t('advisor.step_title.act1_step1', rec.campaignStepTitle, lang);
  } else if (rec.campaignStepTitle === 'Step 2/3: Secure Second Lead or Trigger Berth 14') {
    localizedStepTitle = t('advisor.step_title.act1_step2', rec.campaignStepTitle, lang);
  } else if (rec.campaignStepTitle === 'Step 3/3: Launch Berth 14 Climax') {
    localizedStepTitle = t('advisor.step_title.act1_step3', rec.campaignStepTitle, lang);
  } else if (rec.campaignStepTitle === 'Step 1/3: Unmask Trust or Tanker GPS') {
    localizedStepTitle = t('advisor.step_title.act2_step1', rec.campaignStepTitle, lang);
  } else if (rec.campaignStepTitle === 'Step 2/3: Secure Second Exhibit or Strike Hangar 7') {
    localizedStepTitle = t('advisor.step_title.act2_step2', rec.campaignStepTitle, lang);
  } else if (rec.campaignStepTitle === 'Step 3/3: Execute Hangar 7 Grand Finale') {
    localizedStepTitle = t('advisor.step_title.act2_step3', rec.campaignStepTitle, lang);
  }

  return {
    ...rec,
    badgeLabel: localizedBadge,
    headline: localizedHeadline,
    hint: localizedHint,
    actionButtonLabel: localizedActionButton,
    campaignStepTitle: localizedStepTitle,
  };
}

const EN_REVERSE_MAP = new Map<string, string>();
for (const [k, v] of Object.entries(DICTIONARIES.en)) {
  if (typeof v === 'string' && v.trim().length > 0) {
    EN_REVERSE_MAP.set(v.trim(), k);
  }
}

/**
 * Look up any text by its exact English canonical string and translate into the active language.
 */
export function getLocalizedTextByEnglishValue(
  enText: string,
  lang: SupportedLanguage = 'en'
): string {
  if (!enText) return enText;
  const trimmed = enText.trim();
  const key = EN_REVERSE_MAP.get(trimmed);
  if (key) {
    return t(key, enText, lang);
  }
  return enText;
}

/**
 * Helper to get a localized stat name (Any, Dockets, Influence, Wire, Street).
 */
export function getLocalizedStatName(
  stat: string,
  lang: SupportedLanguage = 'en'
): string {
  if (!stat) return stat;
  const s = stat.toLowerCase().trim();
  return t(`stat.${s}`, stat, lang);
}

/**
 * Helper to get localized contact name and role for a given map node.
 */
export function getLocalizedContactName(
  nodeId: string,
  fallbackName: string,
  lang: SupportedLanguage = 'en'
): string {
  const byKey = t(`dialogue.${nodeId}.name`, '', lang);
  if (byKey && byKey.trim().length > 0) {
    return byKey;
  }
  return getLocalizedTextByEnglishValue(fallbackName, lang);
}

export function getLocalizedContactRole(
  nodeId: string,
  fallbackRole: string,
  lang: SupportedLanguage = 'en'
): string {
  const byKey = t(`dialogue.${nodeId}.role`, '', lang);
  if (byKey && byKey.trim().length > 0) {
    return byKey;
  }
  return getLocalizedTextByEnglishValue(fallbackRole, lang);
}

/**
 * Helper to get a localized log entry for Metro Dispatch & Comms Log.
 */
export function getLocalizedLogEntry(
  entry: string,
  lang: SupportedLanguage = 'en'
): string {
  if (!entry) return entry;

  // Initial scenario setups
  if (entry.includes('Day 1, 02:00 AM — Stage 4 Load Shedding. Constable Nandi collapses')) {
    return t('log.initial_act1', entry, lang);
  }
  if (entry.includes('Day 5, 08:00 AM — Commission of Inquiry begins. High Court subpoenas issued')) {
    return t('log.initial_act2', entry, lang);
  }
  if (entry.includes('No unused dice available to upgrade.')) {
    return t('log.no_unused_dice', entry, lang);
  }

  // Background selection in prologue
  if (
    entry.startsWith('Background Selected: ') ||
    entry.includes('The Paper-Trail Auditor') ||
    entry.includes('The Burned Enforcer') ||
    entry.includes('The Ghost Wiretapper')
  ) {
    if (entry.includes('The Paper-Trail Auditor') || entry.includes('forensic_hawk')) {
      return `${t('ui.background_selected', 'Background Selected', lang)}: ${t('bg.forensic_hawk.title', 'The Paper-Trail Auditor', lang)} (${t('bg.forensic_hawk.former_unit', 'DPCI (Hawks) Serious Commercial Crime Unit', lang)})`;
    }
    if (entry.includes('The Burned Enforcer') || entry.includes('trt_breacher')) {
      return `${t('ui.background_selected', 'Background Selected', lang)}: ${t('bg.trt_breacher.title', 'The Burned Enforcer', lang)} (${t('bg.trt_breacher.former_unit', 'SAPS Tactical Response Team (TRT) — Detached to Hawks', lang)})`;
    }
    if (entry.includes('The Ghost Wiretapper') || entry.includes('crime_intel')) {
      return `${t('ui.background_selected', 'Background Selected', lang)}: ${t('bg.crime_intel.title', 'The Ghost Wiretapper', lang)} (${t('bg.crime_intel.former_unit', 'Crime Intelligence Signals & Covert Surveillance', lang)})`;
    }
    const cleanContent = entry.replace(/^[^:]+:\s*/, '').trim();
    return `${t('ui.background_selected', 'Background Selected', lang)}: ${cleanContent}`;
  }

  // Prologue decision responses
  if (entry.includes('You haul Nandi inside and bolt the deadlocks as thunder shakes the arcade glass.')) {
    return t('prologue.log.bolt_deadlocks', entry, lang);
  }
  if (entry.includes('You spot it immediately: the tender bypassed provincial treasury using a Fake Disaster Declaration signature.')) {
    return t('prologue.log.fake_disaster', entry, lang);
  }
  if (entry.includes('Your steadiness slows her breathing. She gives you the passcode hint')) {
    return t('prologue.log.passcode_hint', entry, lang);
  }
  if (entry.includes('The dead auditor’s phone," she whispers') || entry.includes('The dead auditor')) {
    return t('prologue.log.dead_auditor_phone', entry, lang);
  }
  if (entry.includes('You pop the casing off her Tetraburst radio')) {
    return t('prologue.log.kill_radio', entry, lang);
  }
  if (entry.includes('You scan the rain-swept roofline—no laser sights')) {
    return t('prologue.log.clear_alley', entry, lang);
  }

  // Faction Tactical Perks
  if (entry.startsWith('[FACTION PERK: ')) {
    const perkMatch = entry.match(/^\[FACTION PERK:\s*([^\]]+)\]\s*(.*)$/);
    if (perkMatch) {
      const rawName = perkMatch[1].trim();
      const body = perkMatch[2];
      let localizedName = rawName;
      if (rawName.includes('HAWKS')) {
        localizedName = t('perk.perk_hawks_safechannel.name', 'Hawks Safe-Channel', lang);
      } else if (rawName.includes('IZINKABI')) {
        localizedName = t('perk.perk_izinkabi_muscle.name', 'Izinkabi Muscle', lang);
      } else if (rawName.includes('GRID')) {
        localizedName = t('perk.perk_grid_manipulation.name', 'Grid Manipulation', lang);
      } else if (rawName.includes('BLUE-LIGHT')) {
        localizedName = t('perk.perk_bluelight_escort.name', 'Blue-Light Escort', lang);
      }
      return `[${t('ui.faction_perk', 'FACTION PERK', lang)}: ${localizedName}] ${body}`;
    }
  }

  // Action slot dice rolls: [Roll X -> Y] or [Phonsa X -> Y] {Slot}: {Narrative}
  const rollMatch = entry.match(/^\[([A-Za-z\s]+)\s+(\d+)\s*->\s*(\d+)\]\s*(.*?):\s*(.*)$/);
  if (rollMatch) {
    const [, , dieVal, rollVal, slotName, narrative] = rollMatch;
    const localizedSlot = getLocalizedTextByEnglishValue(slotName, lang);
    const localizedNarrative = getLocalizedTextByEnglishValue(narrative, lang);
    return `[${t('ui.roll', 'Roll', lang)} ${dieVal} -> ${rollVal}] ${localizedSlot}: ${localizedNarrative}`;
  }

  if (entry.startsWith('[CONTACT INTEL] ')) {
    return `[${t('ui.contact_intel', 'CONTACT INTEL', lang)}] ${entry.replace('[CONTACT INTEL] ', '')}`;
  }
  if (entry.startsWith('[GEAR ACQUIRED] ')) {
    return `[${t('ui.gear_acquired', 'GEAR ACQUIRED', lang)}] ${entry.replace('[GEAR ACQUIRED] ', '')}`;
  }
  if (entry.startsWith('[CRISIS] ')) {
    return `[${t('ui.crisis', 'CRISIS', lang)}] ${entry.replace('[CRISIS] ', '')}`;
  }

  return entry;
}

/**
 * Return localized story metadata for preview cards and briefings.
 */
export function getLocalizedStory(
  story: StoryMetadata,
  lang: SupportedLanguage = 'en'
): StoryMetadata {
  return {
    ...story,
    title: t(`story.${story.id}.title`, story.title, lang),
    subtitle: t(`story.${story.id}.subtitle`, story.subtitle, lang),
    region: t(`story.${story.id}.region`, story.region, lang),
    era: t(`story.${story.id}.era`, story.era, lang),
    protagonistName: t(`story.${story.id}.protagonist_name`, story.protagonistName, lang),
    protagonistRole: t(`story.${story.id}.protagonist_role`, story.protagonistRole, lang),
    synopsis: t(`story.${story.id}.synopsis`, story.synopsis, lang),
    keystoneTitle: t(`story.${story.id}.keystone_title`, story.keystoneTitle, lang),
    unlockConditionText: t(`story.${story.id}.unlock_condition`, story.unlockConditionText, lang),
    regionalMechanic: t(`story.${story.id}.regional_mechanic`, story.regionalMechanic, lang),
  };
}

/**
 * Return localized keystone dossier data.
 */
export function getLocalizedKeystone(
  keystone: KeystoneDossier,
  lang: SupportedLanguage = 'en'
): KeystoneDossier {
  return {
    ...keystone,
    title: t(`keystone.${keystone.id}.title`, keystone.title, lang),
    sourceLabel: t(`keystone.${keystone.id}.source_label`, keystone.sourceLabel, lang),
    summary: t(`keystone.${keystone.id}.summary`, keystone.summary, lang),
    gameplayEffect: t(`keystone.${keystone.id}.gameplay_effect`, keystone.gameplayEffect, lang),
  };
}

export { SUPPORTED_LANGUAGES };


