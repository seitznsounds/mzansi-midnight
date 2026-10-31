import { describe, it, expect } from 'vitest';
import { initialGameState } from '../../data/initialState';
import { resolveActionSlot, isCorridorRoadblocked } from '../resolver';
import { GameState } from '../../types/game';
import fs from 'node:fs';
import path from 'node:path';

describe('Dice Roll Notifications & Action Precondition Warnings', () => {
  const rootDir = process.cwd();

  it('rejects action and logs insufficient funds when operative lacks required cash', () => {
    // Find a slot with cash cost or create a state where cash is insufficient
    const state: GameState = structuredClone(initialGameState);
    // n5_cyber_pawn or another node with cash cost
    const node = state.nodes['n5_cyber_pawn'];
    expect(node).toBeDefined();

    const cashSlot = node.actionSlots.find((s) => s.costCash && s.costCash > 0);
    expect(cashSlot).toBeDefined();

    // Set operative cash below requirement
    state.cash = (cashSlot!.costCash || 100) - 1;
    const availableDie = state.dicePool.find((d) => !d.isUsed)!;

    const nextState = resolveActionSlot(
      state,
      'n5_cyber_pawn',
      cashSlot!.id,
      availableDie.id
    );

    // Die must NOT be consumed
    const nextDie = nextState.dicePool.find((d) => d.id === availableDie.id)!;
    expect(nextDie.isUsed).toBe(false);

    // Top active log entry must state insufficient funds
    expect(nextState.activeLog[0]).toContain('Insufficient funds');
    expect(nextState.activeLog[0]).toContain(String(cashSlot!.costCash));
  });

  it('blocks actions when corridor is roadblocked without bypass', () => {
    const state: GameState = structuredClone(initialGameState);
    state.currentNodeId = 'n1_safehouse';
    state.clocks.precinct_heat.current = 4;

    expect(isCorridorRoadblocked(state, 'n1_safehouse', 'n4_city_hall')).toBe(true);

    const targetNode = state.nodes['n4_city_hall'];
    const targetSlot = targetNode.actionSlots[0];
    const availableDie = state.dicePool.find((d) => !d.isUsed)!;

    const nextState = resolveActionSlot(
      state,
      'n4_city_hall',
      targetSlot.id,
      availableDie.id
    );

    const nextDie = nextState.dicePool.find((d) => d.id === availableDie.id)!;
    expect(nextDie.isUsed).toBe(false);
    expect(nextState.activeLog[0]).toContain('Action blocked: Cross the SAPS Roadblock');
  });

  it('blocks actions during Stage 6 Load Shedding without generator diesel', () => {
    const state: GameState = structuredClone(initialGameState);
    state.loadSheddingStage = 6;
    state.generatorActiveToday = false;

    // Find a slot disabled during Stage 6
    let targetNodeId = '';
    let targetSlotId = '';
    for (const [nId, n] of Object.entries(state.nodes)) {
      const s = n.actionSlots.find((slot) => slot.disabledDuringStage6);
      if (s) {
        targetNodeId = nId;
        targetSlotId = s.id;
        break;
      }
    }

    if (targetNodeId && targetSlotId) {
      state.currentNodeId = targetNodeId;
      const availableDie = state.dicePool.find((d) => !d.isUsed)!;
      const nextState = resolveActionSlot(
        state,
        targetNodeId,
        targetSlotId,
        availableDie.id
      );

      const nextDie = nextState.dicePool.find((d) => d.id === availableDie.id)!;
      expect(nextDie.isUsed).toBe(false);
      expect(nextState.activeLog[0]).toContain('Stage 6 Load Shedding');
    }
  });

  it('verifies ActionOutcomeDispatch component supports the "blocked" tier', () => {
    const dispatchPath = path.join(rootDir, 'components', 'ActionOutcomeDispatch.tsx');
    const dispatchContent = fs.readFileSync(dispatchPath, 'utf8');

    expect(dispatchContent).toContain("'clean' | 'compromised' | 'failure' | 'blocked'");
    expect(dispatchContent).toContain('isBlocked');
    expect(dispatchContent).toContain('ui.action_blocked');
    expect(dispatchContent).toContain('ui.action_requirement');
  });

  it('verifies GameDashboard renders proactive insufficient funds and mobile dispatch ticker', () => {
    const dashboardPath = path.join(rootDir, 'components', 'GameDashboard.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

    // Proactive insufficient funds check
    expect(dashboardContent).toContain('cannotAffordCash');
    expect(dashboardContent).toContain('ui.insufficient_funds');
    expect(dashboardContent).toContain('INSUFFICIENT FUNDS');

    // Blocked roll feedback handling
    expect(dashboardContent).toContain("tier: 'blocked'");
    expect(dashboardContent).toContain('blockedNarrative');
    expect(dashboardContent).toContain('NO DIE SELECTED');

    // Mobile Live Tactical Scanner Ticker
    expect(dashboardContent).toContain('MOBILE LIVE TACTICAL SCANNER / DISPATCH TICKER');
    expect(dashboardContent).toContain('DISPATCH:');
  });
});
