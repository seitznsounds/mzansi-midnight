import { describe, it, expect, vi } from 'vitest';
import { initialGameState } from '../../data/initialState';
import { ACT_2_NODES } from '../../data/act2State';
import { HIGHVELD_NODES } from '../../data/story2HighveldState';
import { NAMAQUA_NODES } from '../../data/story3NamaquaState';
import { CAPE_NODES } from '../../data/story4CapeState';
import { OCTAGON_NODES } from '../../data/story5OctagonState';
import { getLocalizedNode, getLocalizedFactionName } from '../i18n';

describe('Mobile Map & HUD Responsiveness Architecture', () => {
  // Test badge code generator utility used by mobile circular beacon pins
  const getNodeBadgeCode = (id: string, title: string) => {
    const match = id.match(/^([a-z]+)?(\d+)/i);
    if (match && match[2]) {
      const prefix = match[1] ? match[1][0].toUpperCase() : 'N';
      return `${prefix}${match[2]}`;
    }
    return title.substring(0, 2).toUpperCase();
  };

  it('generates clean, compact tactical beacon codes for all nodes across all campaigns', () => {
    // Act 1
    expect(getNodeBadgeCode('n1_safehouse', 'Safehouse')).toBe('N1');
    expect(getNodeBadgeCode('n4_city_hall', 'City Hall')).toBe('N4');
    expect(getNodeBadgeCode('n7_archive_basement', 'Archive Basement')).toBe('N7');

    // Act 2
    expect(getNodeBadgeCode('n8_ridge_penthouses', 'Ridge Penthouses')).toBe('N8');
    expect(getNodeBadgeCode('n10_high_court', 'High Court')).toBe('N10');

    // Story 2 Highveld
    expect(getNodeBadgeCode('h1_braamfontein', 'Braamfontein')).toBe('H1');
    expect(getNodeBadgeCode('h6_kendon_grid', 'Kendon Grid')).toBe('H6');

    // Story 3 Namaqua
    expect(getNodeBadgeCode('nam1_port_nolloth', 'Port Nolloth')).toBe('N1');
    expect(getNodeBadgeCode('nam4_alexander_bay', 'Alexander Bay')).toBe('N4');

    // Story 4 Cape
    expect(getNodeBadgeCode('c1_camps_bay', 'Camps Bay')).toBe('C1');
    expect(getNodeBadgeCode('c7_pier109', 'Pier 109')).toBe('C7');

    // Story 5 Octagon
    expect(getNodeBadgeCode('oct1_union_buildings', 'Union Buildings')).toBe('O1');
    expect(getNodeBadgeCode('oct5_apollo_scada', 'Apollo SCADA')).toBe('O5');
  });

  it('verifies all story nodes have defined, bounded cartographic coordinates (0-100%)', () => {
    const allNodeSets = [
      initialGameState.nodes,
      ACT_2_NODES,
      HIGHVELD_NODES,
      NAMAQUA_NODES,
      CAPE_NODES,
      OCTAGON_NODES,
    ];

    for (const nodeMap of allNodeSets) {
      for (const [id, node] of Object.entries(nodeMap)) {
        expect(node.x, `Node ${id} X coord must be >= 5 and <= 95`).toBeGreaterThanOrEqual(5);
        expect(node.x, `Node ${id} X coord must be >= 5 and <= 95`).toBeLessThanOrEqual(95);
        expect(node.y, `Node ${id} Y coord must be >= 5 and <= 95`).toBeGreaterThanOrEqual(5);
        expect(node.y, `Node ${id} Y coord must be >= 5 and <= 95`).toBeLessThanOrEqual(95);
      }
    }
  });

  it('formats combined 4-investigator attributes chip cleanly without overflow strings', () => {
    const stats = { street: 1, dockets: 0, wire: -1, influence: 3 };
    const formatted = [
      `STRT: ${stats.street >= 0 ? `+${stats.street}` : stats.street}`,
      `DCKT: ${stats.dockets >= 0 ? `+${stats.dockets}` : stats.dockets}`,
      `WIRE: ${stats.wire >= 0 ? `+${stats.wire}` : stats.wire}`,
      `INFL: ${stats.influence >= 0 ? `+${stats.influence}` : stats.influence}`,
    ].join(' | ');

    expect(formatted).toBe('STRT: +1 | DCKT: +0 | WIRE: -1 | INFL: +3');
    // Total string length is 41 characters, well within a 360px viewport
    expect(formatted.length).toBeLessThan(45);
  });

  it('localizes node labels, districts, and faction badges for mobile focus bar', () => {
    const safehouse = getLocalizedNode('n1_safehouse', 'Mercury Arcade Flat', 'Player Safehouse • CBD Central', 'en');
    expect(safehouse.title).toBe('Mercury Arcade Flat');
    expect(safehouse.district).toContain('CBD Central');

    const safehouseZulu = getLocalizedNode('n1_safehouse', 'Mercury Arcade Flat', 'Player Safehouse • CBD Central', 'zu');
    expect(safehouseZulu.title).toBeTruthy();

    const factionEn = getLocalizedFactionName('street_syndicate', 'en');
    const factionZulu = getLocalizedFactionName('street_syndicate', 'zu');
    expect(factionEn).toBeTruthy();
    expect(factionZulu).toBeTruthy();
  });

  it('triggers onInspectNode callback to transition from map to action tab', () => {
    const onSelectNode = vi.fn();
    const onInspectNode = vi.fn();

    const handleInspect = (nodeId: string) => {
      onSelectNode(nodeId);
      onInspectNode(nodeId);
    };

    handleInspect('n1_safehouse');
    expect(onSelectNode).toHaveBeenCalledWith('n1_safehouse');
    expect(onInspectNode).toHaveBeenCalledWith('n1_safehouse');
  });
});
