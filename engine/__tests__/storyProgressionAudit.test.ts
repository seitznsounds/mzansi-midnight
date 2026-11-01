import { describe, it, expect } from 'vitest';
import { initialGameState } from '../../data/initialState';
import { transitionToAct2 } from '../../data/act2State';
import { initialHighveldGameState } from '../../data/story2HighveldState';
import { initialNamaquaGameState } from '../../data/story3NamaquaState';
import { initialCapeGameState } from '../../data/story4CapeState';
import { initialOctagonGameState } from '../../data/story5OctagonState';
import { ALL_CAMPAIGN_ENDINGS, ActEnding } from '../../data/endings';
import { ITEMS_CATALOG } from '../../data/itemsCatalog';
import { GameState, MapNode, ActionSlot } from '../../types/game';

// Import all event decks
import { EVENT_DECK } from '../../data/eventDeck';
import { HIGHVELD_EVENT_DECK } from '../../data/story2HighveldEvents';
import { NAMAQUA_EVENT_DECK } from '../../data/story3NamaquaEvents';
import { CAPE_EVENT_DECK } from '../../data/story4CapeEvents';
import { OCTAGON_EVENT_DECK } from '../../data/story5OctagonEvents';

interface StoryAuditTarget {
  name: string;
  initialState: GameState;
  events: Record<string, any>;
  expectedEndingIds: string[];
}

const ALL_STORIES: StoryAuditTarget[] = [
  {
    name: 'Story 1 Act 1 (eThekwini-Gold)',
    initialState: initialGameState,
    events: EVENT_DECK,
    expectedEndingIds: [
      'ending_vigilante',
      'ending_whistleblower',
      'ending_kingpin',
      'ending_captured',
    ],
  },
  {
    name: 'Story 1 Act 2 (The Commission of Inquiry)',
    initialState: transitionToAct2(initialGameState, 'ending_whistleblower'),
    events: EVENT_DECK,
    expectedEndingIds: [
      'ending_act2_reckoning',
      'ending_act2_revolution',
      'ending_act2_syndicate_state',
      'ending_act2_vanished',
    ],
  },
  {
    name: 'Story 2 (Highveld-Chrome)',
    initialState: initialHighveldGameState,
    events: HIGHVELD_EVENT_DECK,
    expectedEndingIds: [
      'ending_highveld_siu_vindication',
      'ending_highveld_red_blackout',
      'ending_highveld_arbitrage_partner',
      'ending_highveld_shaft_collapse',
    ],
  },
  {
    name: 'Story 3 (Namaqua-Diamond)',
    initialState: initialNamaquaGameState,
    events: NAMAQUA_EVENT_DECK,
    expectedEndingIds: [
      'ending_namaqua_naval_raid',
      'ending_namaqua_divers_rebellion',
      'ending_namaqua_diamond_flight',
      'ending_namaqua_desert_dune_grave',
    ],
  },
  {
    name: 'Story 4 (Cape-Nocturne)',
    initialState: initialCapeGameState,
    events: CAPE_EVENT_DECK,
    expectedEndingIds: [
      'ending_cape_sovereign_seizure',
      'ending_cape_gang_truce',
      'ending_cape_winelands_audit',
      'ending_cape_shadow_execution',
    ],
  },
  {
    name: 'Story 5 (The Sovereign Octagon)',
    initialState: initialOctagonGameState,
    events: OCTAGON_EVENT_DECK,
    expectedEndingIds: [
      'ending_octagon_constitutional_reckoning',
      'ending_octagon_peoples_revolution',
      'ending_octagon_shadow_director',
      'ending_octagon_balkanized_republic',
      'ending_octagon_vanished_watchers',
    ],
  },
];

describe('Story Progression & Graph Reachability Audit', () => {
  ALL_STORIES.forEach((story) => {
    describe(`Graph Reachability: ${story.name}`, () => {
      it('1. All defined nodes can be unlocked from starting state', () => {
        const nodes = story.initialState.nodes;
        const totalNodeIds = Object.keys(nodes);
        expect(totalNodeIds.length).toBeGreaterThanOrEqual(5);

        // Track reachable nodes starting from initially unlocked nodes
        const unlockedNodeIds = new Set<string>(
          totalNodeIds.filter((id) => nodes[id].isUnlocked)
        );
        expect(unlockedNodeIds.size).toBeGreaterThanOrEqual(1);

        let changed = true;
        while (changed) {
          changed = false;
          for (const nodeId of Array.from(unlockedNodeIds)) {
            const node = nodes[nodeId];
            if (!node) continue;

            for (const slot of node.actionSlots) {
              const outcomes = [slot.outcomes.clean, slot.outcomes.compromised];
              for (const outcome of outcomes) {
                if (outcome?.unlockNodeIds) {
                  for (const targetId of outcome.unlockNodeIds) {
                    if (!unlockedNodeIds.has(targetId) && nodes[targetId]) {
                      unlockedNodeIds.add(targetId);
                      changed = true;
                    }
                  }
                }
              }
            }
          }

          // Also check events that might unlock nodes
          for (const event of Object.values(story.events)) {
            if (event.choices) {
              for (const choice of event.choices) {
                if (choice.effect?.unlockNodeIds) {
                  for (const targetId of choice.effect.unlockNodeIds) {
                    if (!unlockedNodeIds.has(targetId) && nodes[targetId]) {
                      unlockedNodeIds.add(targetId);
                      changed = true;
                    }
                  }
                }
              }
            }
          }
        }

        // Assert 100% of nodes in this story are reachable and unlockable
        const unreachableNodes = totalNodeIds.filter((id) => !unlockedNodeIds.has(id));
        expect(
          unreachableNodes,
          `Nodes [${unreachableNodes.join(', ')}] in ${story.name} are unreachable from starting state!`
        ).toEqual([]);
      });

      it('2. Starting nodes cannot trigger turn-1 soft-lock on failure', () => {
        const nodes = story.initialState.nodes;
        const initialUnlocked = Object.values(nodes).filter((n) => n.isUnlocked);
        expect(initialUnlocked.length).toBeGreaterThanOrEqual(1);

        // Verify that if a player rolls failure on turn 1, they are not permanently deadlocked
        // Either:
        // A) Multiple nodes are unlocked initially, OR
        // B) The key progression slot is repeatable (isRepeatable: true), OR
        // C) There are multiple action slots allowing recovery.
        for (const startNode of initialUnlocked) {
          const slots = startNode.actionSlots;
          const hasRepeatableProgression = slots.some(
            (s) => s.isRepeatable || (s.outcomes.failure && s.outcomes.failure.unlockNodeIds)
          );
          const hasMultipleUnlocked = initialUnlocked.length > 1;

          expect(
            hasRepeatableProgression || hasMultipleUnlocked,
            `Start node ${startNode.id} in ${story.name} can cause turn-1 soft-lock on failure!`
          ).toBe(true);
        }
      });
    });
  });
});

describe('Item Prerequisites & Economy Consistency Audit', () => {
  ALL_STORIES.forEach((story) => {
    it(`All requiredItems in ${story.name} are obtainable in that story`, () => {
      const nodes = story.initialState.nodes;
      const initialInventory = new Set<string>(story.initialState.inventory || []);

      // Collect all items obtainable in this story
      const obtainableItems = new Set<string>(initialInventory);

      // 1. Items sold at nodes or in itemsCatalog with soldAtNodeId
      for (const [nodeId, node] of Object.entries(nodes)) {
        for (const item of Object.values(ITEMS_CATALOG)) {
          if (item.soldAtNodeId === nodeId) {
            obtainableItems.add(item.id);
          }
        }
        for (const slot of node.actionSlots) {
          if (slot.outcomes.clean?.addInventoryItem) {
            obtainableItems.add(slot.outcomes.clean.addInventoryItem);
          }
          if (slot.outcomes.compromised?.addInventoryItem) {
            obtainableItems.add(slot.outcomes.compromised.addInventoryItem);
          }
        }
      }

      // 2. Items awarded by story events
      for (const event of Object.values(story.events)) {
        if (event.choices) {
          for (const choice of event.choices) {
            if (choice.effect?.addInventoryItem) {
              obtainableItems.add(choice.effect.addInventoryItem);
            }
          }
        }
      }

      // Check all requiredItems in action slots
      for (const node of Object.values(nodes)) {
        for (const slot of node.actionSlots) {
          if (slot.requiredItem) {
            expect(
              obtainableItems.has(slot.requiredItem),
              `Slot "${slot.title}" on node "${node.title}" requires item "${slot.requiredItem}" which is not obtainable in ${story.name}!`
            ).toBe(true);
          }
        }
      }

      // Check all requiredItems in event choices
      for (const [eventId, event] of Object.entries(story.events)) {
        if (event.choices) {
          for (const choice of event.choices) {
            if (choice.requiredItem) {
              expect(
                obtainableItems.has(choice.requiredItem),
                `Event choice "${choice.id}" in event "${eventId}" requires item "${choice.requiredItem}" which is not obtainable in ${story.name}!`
              ).toBe(true);
            }
          }
        }
      }
    });
  });
});

describe('Ending Completeness & Trigger Coverage Audit', () => {
  it('1. Exactly 25 distinct endings exist in ALL_CAMPAIGN_ENDINGS', () => {
    const endingKeys = Object.keys(ALL_CAMPAIGN_ENDINGS);
    expect(endingKeys.length).toBe(25);
  });

  it('2. Every ending has valid, complete narrative and typography metadata', () => {
    for (const [endingId, ending] of Object.entries(ALL_CAMPAIGN_ENDINGS)) {
      expect(ending.id).toBe(endingId);
      expect(ending.title.length).toBeGreaterThan(0);
      expect(ending.subtitle.length).toBeGreaterThan(0);
      expect(ending.pathLabel.length).toBeGreaterThan(0);
      expect(ending.summaryQuote.length).toBeGreaterThan(0);
      expect(['amber', 'cyan', 'purple', 'red']).toContain(ending.accentColor);
      expect(ending.epilogueParagraphs.length).toBeGreaterThanOrEqual(1);
      expect(ending.cityAftermath.length).toBeGreaterThanOrEqual(1);
      for (const aftermath of ending.cityAftermath) {
        expect(aftermath.heading.length).toBeGreaterThan(0);
        expect(aftermath.detail.length).toBeGreaterThan(0);
      }
    }
  });

  ALL_STORIES.forEach((story) => {
    it(`3. Every expected ending in ${story.name} has a reachable triggerEndingId in event choices`, () => {
      const triggeredEndingIds = new Set<string>();

      for (const event of Object.values(story.events)) {
        if (event.choices) {
          for (const choice of event.choices) {
            if (choice.effect?.triggerEndingId) {
              triggeredEndingIds.add(choice.effect.triggerEndingId);
            }
          }
        }
      }

      for (const expectedId of story.expectedEndingIds) {
        expect(
          triggeredEndingIds.has(expectedId),
          `Ending "${expectedId}" in ${story.name} has no choice with triggerEndingId in its event deck!`
        ).toBe(true);

        expect(
          (ALL_CAMPAIGN_ENDINGS as Record<string, ActEnding>)[expectedId],
          `Ending "${expectedId}" is not registered in ALL_CAMPAIGN_ENDINGS!`
        ).toBeDefined();
      }
    });
  });
});
