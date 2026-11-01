import React from 'react';
import { FactionId, GameState, MapNode } from '../types/game';
import { SupportedLanguage } from '../types/settings';
import { t, getLocalizedNode, getLocalizedFactionName } from '../engine/i18n';

interface DistrictSvgMapProps {
  state: GameState;
  selectedNodeId: string;
  lang?: SupportedLanguage;
  onSelectNode: (nodeId: string) => void;
  onInspectNode?: (nodeId: string) => void;
}

const FACTION_THEME: Record<
  FactionId | 'neutral',
  { border: string; badge: string; dot: string; label: string }
> = {
  neutral: {
    border: 'border-zinc-600',
    badge: 'bg-zinc-800 text-zinc-300',
    dot: 'bg-zinc-400',
    label: 'Neutral Turf',
  },
  street_syndicate: {
    border: 'border-amber-500/80',
    badge: 'bg-amber-950/80 text-amber-300',
    dot: 'bg-amber-400',
    label: 'Queen St. Alliance',
  },
  saps_trt: {
    border: 'border-red-500/80',
    badge: 'bg-red-950/80 text-red-300',
    dot: 'bg-red-500',
    label: 'SAPS Organized Crime',
  },
  city_hall: {
    border: 'border-emerald-500/80',
    badge: 'bg-emerald-950/80 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'City Hall Coalition',
  },
  abasanta: {
    border: 'border-purple-500/80',
    badge: 'bg-purple-950/80 text-purple-300',
    dot: 'bg-purple-400',
    label: 'Abasanta Logistics',
  },
  hawks: {
    border: 'border-cyan-500/80',
    badge: 'bg-cyan-950/80 text-cyan-300',
    dot: 'bg-cyan-400',
    label: 'DPCI Hawks Holdout',
  },
  megawatt_cartel: {
    border: 'border-orange-500/80',
    badge: 'bg-orange-950/80 text-orange-300',
    dot: 'bg-orange-400',
    label: 'The Megawatt Cartel',
  },
  sandton_arbitrage: {
    border: 'border-cyan-500/80',
    badge: 'bg-cyan-950/80 text-cyan-300',
    dot: 'bg-cyan-400',
    label: 'Sandton Energy Arbitrage',
  },
  reef_zamazamas: {
    border: 'border-yellow-500/80',
    badge: 'bg-yellow-950/80 text-yellow-300',
    dot: 'bg-yellow-400',
    label: 'The Reef Zama-Zamas',
  },
  siu_clean_hands: {
    border: 'border-emerald-500/80',
    badge: 'bg-emerald-950/80 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'SIU Clean Hands',
  },
  red_guard_populists: {
    border: 'border-red-500/80',
    badge: 'bg-red-950/80 text-red-300',
    dot: 'bg-red-500',
    label: 'Red Guard Populists',
  },
  aegis_marine: {
    border: 'border-blue-600/80',
    badge: 'bg-blue-950/80 text-blue-300',
    dot: 'bg-blue-500',
    label: 'Aegis-Atlantis Marine',
  },
  artisanal_divers: {
    border: 'border-amber-500/80',
    badge: 'bg-amber-950/80 text-amber-300',
    dot: 'bg-amber-400',
    label: 'Artisanal Shore Divers',
  },
  kalahari_runners: {
    border: 'border-orange-500/80',
    badge: 'bg-orange-950/80 text-orange-300',
    dot: 'bg-orange-400',
    label: 'Kalahari Desert Runners',
  },
  namaqua_command: {
    border: 'border-emerald-500/80',
    badge: 'bg-emerald-950/80 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'Namaqua Coastal Command',
  },
  namib_syndicate: {
    border: 'border-purple-500/80',
    badge: 'bg-purple-950/80 text-purple-300',
    dot: 'bg-purple-400',
    label: 'Namib Diamond Syndicate',
  },
  long_street_racket: {
    border: 'border-purple-500/80',
    badge: 'bg-purple-950/80 text-purple-300',
    dot: 'bg-purple-400',
    label: 'Long Street Security Racket',
  },
  cape_gang_federation: {
    border: 'border-red-600/80',
    badge: 'bg-red-950/80 text-red-300',
    dot: 'bg-red-500',
    label: '28s / Cape Flats Federation',
  },
  winelands_club: {
    border: 'border-emerald-500/80',
    badge: 'bg-emerald-950/80 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'The Winelands Capital Club',
  },
  agu_renegades: {
    border: 'border-cyan-500/80',
    badge: 'bg-cyan-950/80 text-cyan-300',
    dot: 'bg-cyan-400',
    label: 'AGU Renegades',
  },
  dockers_union: {
    border: 'border-amber-500/80',
    badge: 'bg-amber-950/80 text-amber-300',
    dot: 'bg-amber-400',
    label: 'Table Bay Stevedores Union',
  },
  united_hawks_taskforce: {
    border: 'border-cyan-500/80',
    badge: 'bg-cyan-950/80 text-cyan-300',
    dot: 'bg-cyan-400',
    label: 'United Hawks Taskforce',
  },
  the_sovereign_octagon: {
    border: 'border-purple-600/80',
    badge: 'bg-purple-950/80 text-purple-300',
    dot: 'bg-purple-500',
    label: 'The Sovereign Octagon',
  },
  constitutional_court_guard: {
    border: 'border-emerald-500/80',
    badge: 'bg-emerald-950/80 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'Constitutional Court Guard',
  },
  national_grid_command: {
    border: 'border-amber-500/80',
    badge: 'bg-amber-950/80 text-amber-300',
    dot: 'bg-amber-400',
    label: 'National Grid Command',
  },
  people_resistance_front: {
    border: 'border-red-500/80',
    badge: 'bg-red-950/80 text-red-300',
    dot: 'bg-red-500',
    label: "People's Resistance Front",
  },
};

export const DistrictSvgMap: React.FC<DistrictSvgMapProps> = ({
  state,
  selectedNodeId,
  lang = 'en',
  onSelectNode,
  onInspectNode,
}) => {
  const nodes = Object.values(state.nodes);

  const selectedNode = state.nodes[selectedNodeId];
  const selectedTheme = selectedNode ? FACTION_THEME[selectedNode.factionOwner] : null;
  const selectedLoc = selectedNode ? getLocalizedNode(selectedNode.id, selectedNode.title, selectedNode.subtitle, lang) : null;
  const selectedFactionLabel = selectedNode ? getLocalizedFactionName(selectedNode.factionOwner, lang) : null;
  const selectedHasStage6Lockout =
    selectedNode &&
    state.loadSheddingStage === 6 &&
    selectedNode.actionSlots.some((s) => s.disabledDuringStage6);

  const getNodeBadgeCode = (id: string, title: string) => {
    const match = id.match(/^([a-z]+)?(\d+)/i);
    if (match && match[2]) {
      const prefix = match[1] ? match[1][0].toUpperCase() : 'N';
      return `${prefix}${match[2]}`;
    }
    return title.substring(0, 2).toUpperCase();
  };

  const isAct2 = state.act === 2;
  const isHighveld = state.storyId === 'story_2_highveld';
  const isNamaqua = state.storyId === 'story_3_namaqua';
  const isCape = state.storyId === 'story_4_cape';
  const isOctagon = state.storyId === 'story_5_octagon';

  // Check if SAPS roadblocks are active on inner-city routes
  const isRoadblockActive = isOctagon
    ? (state.clocks.octagon_mercenary_sweep?.current ?? 0) >= 3 ||
      (state.clocks.airspace_radar_jamming?.current ?? 0) >= 4
    : isCape
    ? (state.clocks.gang_turf_war_clock?.current ?? 0) >= 4 ||
      (state.clocks.general_swart_manhunt?.current ?? 0) >= 5
    : isNamaqua
    ? (state.clocks.aegis_naval_patrol?.current ?? 0) >= 4 ||
      (state.clocks.malmokken_fog?.current ?? 0) >= 5
    : isHighveld
    ? (state.clocks.nia_surveillance?.current ?? 0) >= 4 ||
      (state.clocks.megawatt_sabotage?.current ?? 0) >= 6
    : isAct2
    ? (state.clocks.commission_subpoena?.current ?? 0) >= 4 ||
      (state.clocks.cartel_hit_squad?.current ?? 0) >= 5
    : (state.clocks.precinct_heat?.current ?? 0) >= 4 ||
      (state.clocks.mokoena_sweep?.current ?? 0) >= 5;

  // Regional Satellite Map Background & Coordinates Telemetry
  const mapBackgroundUrl = isOctagon
    ? '/assets/maps/map_octagon.jpg'
    : isCape
    ? '/assets/maps/map_cape.jpg'
    : isNamaqua
    ? '/assets/maps/map_namaqua.jpg'
    : isHighveld
    ? '/assets/maps/map_highveld.jpg'
    : '/assets/maps/map_ethekwini.jpg';

  const regionalCoordinates = isOctagon
    ? '28°40\'S // 29°10\'E • DRAKENSBERG NATIONAL REDOUBT • 2,800M'
    : isCape
    ? '33°55\'S // 18°25\'E • TABLE BAY FORESHORE • 25M'
    : isNamaqua
    ? '29°15\'S // 16°52\'E • BENZ-BENGUELA SKELETON COAST • 7M'
    : isHighveld
    ? '26°12\'S // 28°02\'E • WITWATERSRAND REEF BASIN • 1,753M'
    : isAct2
    ? '29°36\'S // 31°07\'E • KING SHAKA AIRWAYS • 92M'
    : '29°51\'S // 31°01\'E • NATAL POINT MARITIME • 14M';

  // Build deduplicated edge list between unlocked (or adjacent) nodes
  const edges: {
    id: string;
    from: MapNode;
    to: MapNode;
    isVisible: boolean;
    hasRoadblock: boolean;
  }[] = [];

  const seenPairs = new Set<string>();

  for (const node of nodes) {
    for (const targetId of node.connectedNodeIds) {
      const target = state.nodes[targetId];
      if (!target) continue;

      const pairKey = [node.id, target.id].sort().join('--');
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const isVisible = node.isUnlocked || target.isUnlocked;
      const isCbdArtery = isAct2
        ? pairKey.includes('n8_ridge_penthouses') ||
          pairKey.includes('n9_township_depot')
        : pairKey.includes('n1_safehouse') || pairKey.includes('n2_taxi_rank');

      edges.push({
        id: pairKey,
        from: node,
        to: target,
        isVisible,
        hasRoadblock:
          isRoadblockActive &&
          isCbdArtery &&
          node.isUnlocked &&
          target.isUnlocked,
      });
    }
  }

  return (
    <div className="relative flex-1 w-full min-h-[290px] xs:min-h-[320px] sm:min-h-[360px] rounded-xl border border-zinc-800/90 bg-slate-950 overflow-hidden shadow-inner flex flex-col">
      {/* MOBILE QUICK-SELECT NODE STRIP (VISIBLE <1024px) */}
      <div className="lg:hidden relative z-30 flex items-center gap-1.5 overflow-x-auto px-2.5 py-2 bg-zinc-950/90 border-b border-zinc-800/80 shrink-0">
        <span className="text-[9px] font-mono uppercase text-zinc-500 shrink-0 mr-1">
          {t('map.nodes_label', 'Nodes:', lang)}
        </span>
        {nodes
          .filter((n) => n.isUnlocked)
          .map((n) => {
            const active = n.id === selectedNodeId;
            const isHere = state.currentNodeId === n.id;
            const loc = getLocalizedNode(n.id, n.title, n.subtitle, lang);
            return (
              <button
                key={n.id}
                onClick={() => onSelectNode(n.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 border transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}
              >
                {isHere && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                )}
                <span>{loc.title.split(' (')[0]}</span>
              </button>
            );
          })}
      </div>

      {/* MAP CANVAS CONTAINER */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* 0. ATMOSPHERIC REGIONAL CARTOGRAPHIC SATELLITE BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none opacity-30 mix-blend-screen filter contrast-125 brightness-90 saturate-75"
          style={{
            backgroundImage: `url(${mapBackgroundUrl})`,
          }}
        />

        {/* RADIAL VIGNETTE & TELEMETRY MESH */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.35) 0%, rgba(2, 6, 23, 0.82) 75%, rgba(2, 6, 23, 0.98) 100%)',
          }}
        />

        {/* SCANLINE CRT SUBTLE TEXTURE */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.22)_51%)] bg-[length:100%_4px] opacity-40" />

        {/* 1. BACKGROUND TACTICAL GRID & ZONE LABELS */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 divide-x divide-zinc-900/60 z-0">
          <div className="p-2 sm:p-3 flex flex-col justify-between">
            <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-zinc-500/80 truncate">
              {isOctagon
                ? t('map.sector.octagon_transvaal', 'SECTOR 01 // PRETORIA & APOLLO SCADA', lang)
                : isCape
                ? t('map.sector.cape_strip', 'SECTOR 01 // CAMPS BAY & LONG STREET', lang)
                : isNamaqua
                ? t('map.sector.namaqua_coast', 'SECTOR 01 // PORT NOLLOTH & ALEXANDER BAY', lang)
                : isHighveld
                ? t('map.sector.highveld_spine', 'SECTOR 01 // BRAAMFONTEIN & HILLBROW', lang)
                : isAct2
                ? t('map.sector.umhlanga_north', 'SECTOR 01 // UMHLANGA & NORTH', lang)
                : t('map.sector.west_street', 'SECTOR 01 // WEST STREET', lang)}
            </span>
          </div>
          <div className="p-2 sm:p-3 flex flex-col justify-between bg-zinc-950/20">
            <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-zinc-500/80 truncate">
              {isOctagon
                ? t('map.sector.octagon_drakensberg', 'SECTOR 02 // DRAKENSBERG BUNKER & PORTS', lang)
                : isCape
                ? t('map.sector.cape_flats', 'SECTOR 02 // MANENBERG & AGU BUNKER', lang)
                : isNamaqua
                ? t('map.sector.namaqua_desert', 'SECTOR 02 // RICHTERSVELD GORGES & GHOST MINES', lang)
                : isHighveld
                ? t('map.sector.sandton_pretoria', 'SECTOR 02 // SANDTON & PRETORIA', lang)
                : isAct2
                ? t('map.sector.high_court', 'SECTOR 02 // HIGH COURT INQUIRY', lang)
                : t('map.sector.civic_spine', 'SECTOR 02 // CIVIC SPINE', lang)}
            </span>
          </div>
          <div className="p-2 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-zinc-500/80 truncate">
                {isOctagon
                  ? t('map.sector.octagon_karoo', 'SECTOR 03 // KAROO SUMMIT & STELLENBOSCH', lang)
                  : isCape
                  ? t('map.sector.cape_docks', 'SECTOR 03 // TABLE BAY PIER 109 & STELLENBOSCH', lang)
                  : isNamaqua
                  ? t('map.sector.namaqua_border', 'SECTOR 03 // ORANGE RIVER PONT & SPRINGBOK', lang)
                  : isHighveld
                  ? t('map.sector.crown_kendon', 'SECTOR 03 // CROWN REEFS & KENDON', lang)
                  : isAct2
                  ? t('map.sector.midlands_hangar7', 'SECTOR 03 // MIDLANDS & HANGAR 7', lang)
                  : t('map.sector.pier2_port', 'SECTOR 03 // PIER 2 PORT', lang)}
              </span>
              <span className="hidden md:inline-block text-[8px] font-mono tracking-wider text-amber-500/70 bg-zinc-950/80 px-2 py-0.5 rounded border border-amber-500/20">
                {regionalCoordinates}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SVG TRANSIT LINES, WATERFRONT CONTOURS & ROADBLOCKS */}
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern
              id="minorGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(39, 39, 42, 0.28)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Tactical Grid Overlay */}
          <rect width="1000" height="600" fill="url(#minorGrid)" />

          {/* Stylized Harbour Bay Coastline / Airport Corridor / Mine Reef / Skeleton Coast (Bottom Right) */}
          <path
            d="M 350 600 Q 520 470 1000 440 L 1000 600 Z"
            fill="rgba(8, 47, 73, 0.16)"
            stroke="rgba(14, 116, 144, 0.3)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <text
            x="640"
            y="565"
            fill="rgba(56, 189, 248, 0.25)"
            fontSize="13"
            fontFamily="monospace"
            letterSpacing="3"
          >
            {isOctagon
              ? t('map.water.national_grid', 'ESKOM 765KV SUPER-GRID // APOLLO SCADA BACKBONE', lang)
              : isCape
              ? t('map.water.cape_nocturne', 'TABLE BAY CONTAINER HARBOUR // ATLANTIC STRIP', lang)
              : isNamaqua
              ? t('map.water.namaqua_coastline', 'ATLANTIC SKELETON COAST // ORANGE RIVER DRIFT', lang)
              : isHighveld
              ? t('map.water.highveld_corridor', 'WITWATERSRAND REEF // SHAFT 4 & KENDON', lang)
              : isAct2
              ? t('map.water.hangar7', 'KING SHAKA APRON // HANGAR 7', lang)
              : t('map.water.berth14', 'NATAL PORT CHANNEL // BERTH 14', lang)}
          </text>

          {/* SVG Tactical Anchor Rings under nodes */}
          {nodes.map((node) => {
            if (!node.isUnlocked) return null;
            const cx = node.x * 10;
            const cy = node.y * 6;
            const isSelected = node.id === selectedNodeId;
            return (
              <g key={`anchor-${node.id}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? '26' : '18'}
                  fill="none"
                  stroke={isSelected ? 'rgba(251,191,36,0.4)' : 'rgba(82,82,91,0.3)'}
                  strokeWidth="1.5"
                  strokeDasharray={isSelected ? '4 4' : undefined}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill={isSelected ? '#fbbf24' : '#71717a'}
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* Render Transit Edges */}
          {edges.map((edge) => {
            if (!edge.isVisible) return null;

            const x1 = edge.from.x * 10;
            const y1 = edge.from.y * 6;
            const x2 = edge.to.x * 10;
            const y2 = edge.to.y * 6;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const bothUnlocked = edge.from.isUnlocked && edge.to.isUnlocked;
            const isSelectedEdge =
              edge.from.id === selectedNodeId || edge.to.id === selectedNodeId;

            return (
              <g key={edge.id}>
                {/* Outer Glow for Active/Selected Connections */}
                {bothUnlocked && isSelectedEdge && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      edge.hasRoadblock
                        ? 'rgba(239,68,68,0.25)'
                        : 'rgba(251,191,36,0.2)'
                    }
                    strokeWidth="8"
                  />
                )}

                {/* Main Transit Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    !bothUnlocked
                      ? 'rgba(63, 63, 70, 0.45)'
                      : edge.hasRoadblock
                      ? '#ef4444'
                      : isSelectedEdge
                      ? '#fbbf24'
                      : '#52525b'
                  }
                  strokeWidth={bothUnlocked ? '2.5' : '1.5'}
                  strokeDasharray={
                    !bothUnlocked
                      ? '6 6'
                      : edge.hasRoadblock
                      ? '10 5'
                      : undefined
                  }
                />

                {/* SAPS Roadblock Midpoint Marker */}
                {edge.hasRoadblock && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-58"
                      y="-11"
                      width="116"
                      height="22"
                      rx="4"
                      fill="#450a0a"
                      stroke="#dc2626"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {t('map.roadblock_warning', '! SAPS ROADBLOCK', lang)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* 3. INTERACTIVE NODE CARDS OVERLAY (RESPONSIVE SIZING) */}
        <div className="absolute inset-0">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const theme = FACTION_THEME[node.factionOwner];
            const loc = getLocalizedNode(node.id, node.title, node.subtitle, lang);
            const factionLabel = getLocalizedFactionName(node.factionOwner, lang);

            // Check if adjacent to an unlocked node so we can show it as a "Locked Lead"
            const isAdjacentToUnlocked = node.connectedNodeIds.some(
              (id) => state.nodes[id]?.isUnlocked
            );

            if (!node.isUnlocked && !isAdjacentToUnlocked) return null;

            // Render Locked / Undiscovered Lead Node
            if (!node.isUnlocked) {
              const unlockHint = isAct2
                ? t('map.hint.act2', 'Unlock: Trace Trust or Telemetry', lang)
                : node.id === 'n4_city_hall'
                ? t('map.hint.city_hall', 'Unlock: Audit Docket #409', lang)
                : node.id === 'n7_archive_basement'
                ? t('map.hint.basement', "Unlock: Crack Auditor's Phone", lang)
                : t('map.hint.default', 'Unlock: Audit Docket or Phone', lang);

              return (
                <React.Fragment key={`locked-${node.id}`}>
                  {/* MOBILE CIRCULAR LOCKED BEACON (<640px) */}
                  <div
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="sm:hidden absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-dashed border-zinc-700/80 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center opacity-70 pointer-events-none shadow-md z-10"
                    title={`${t('map.locked_lead', 'LOCKED LEAD', lang)}: ${loc.title}`}
                  >
                    <span className="text-zinc-400 text-xs leading-none">🔒</span>
                  </div>

                  {/* DESKTOP RECTANGULAR LOCKED CARD (>=640px) */}
                  <div
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="hidden sm:block absolute -translate-x-1/2 -translate-y-1/2 w-36 lg:w-40 p-1.5 sm:p-2 rounded-lg border border-dashed border-zinc-700/80 bg-zinc-950/80 backdrop-blur-sm text-center opacity-75 pointer-events-none shadow-lg z-10"
                  >
                    <div className="text-[8px] sm:text-[9px] font-mono uppercase text-amber-500/80">
                      {t('map.locked_lead', 'LOCKED LEAD', lang)}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-zinc-300 mt-0.5 truncate">
                      {loc.title}
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-mono text-zinc-400 mt-0.5 truncate">
                      {unlockHint}
                    </div>
                  </div>
                </React.Fragment>
              );
            }

            // Check if any slot on this node is affected by Stage 6 Load Shedding
            const hasStage6Lockout =
              state.loadSheddingStage === 6 &&
              node.actionSlots.some((s) => s.disabledDuringStage6);
            const hasStage6Bonus =
              state.loadSheddingStage === 6 &&
              node.actionSlots.some((s) => (s.stage6BonusModifier ?? 0) > 0);

            const isPlayerHere = state.currentNodeId === node.id;
            const badgeCode = getNodeBadgeCode(node.id, loc.title);

            return (
              <React.Fragment key={`node-${node.id}`}>
                {/* 1. MOBILE CIRCULAR TACTICAL BEACON PIN (<640px) */}
                <button
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`sm:hidden absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 xs:w-10 xs:h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-150 backdrop-blur-md shadow-lg ${
                    isSelected
                      ? 'bg-zinc-950 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-110 z-20 ring-2 ring-amber-400/40'
                      : `bg-zinc-950/90 ${theme.border} hover:scale-105 z-10`
                  }`}
                  title={`${loc.title} (${loc.district})`}
                >
                  <span
                    className={`font-mono font-bold text-[11px] xs:text-xs ${
                      isSelected ? 'text-amber-300 font-extrabold' : 'text-zinc-200'
                    }`}
                  >
                    {badgeCode}
                  </span>

                  {/* Player Location Radar Beacon */}
                  {isPlayerHere && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-black text-[7px] text-black font-black items-center justify-center">
                        ★
                      </span>
                    </span>
                  )}

                  {/* Stage 6 Lockout / Diesel / Stealth Indicators */}
                  {hasStage6Lockout && !state.generatorActiveToday && (
                    <span className="absolute -bottom-1 -left-1 px-1 rounded bg-red-950 border border-red-600 text-red-300 text-[8px] font-mono leading-none">
                      ⚡
                    </span>
                  )}
                  {hasStage6Lockout && state.generatorActiveToday && (
                    <span className="absolute -bottom-1 -left-1 px-1 rounded bg-cyan-950 border border-cyan-600 text-cyan-300 text-[8px] font-mono leading-none">
                      D
                    </span>
                  )}
                  {hasStage6Bonus && (
                    <span className="absolute -bottom-1 -right-1 px-1 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-[8px] font-mono leading-none">
                      +2
                    </span>
                  )}
                </button>

                {/* 2. DESKTOP EXPANDED RECTANGULAR CARD (>=640px) */}
                <button
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`hidden sm:block absolute -translate-x-1/2 -translate-y-1/2 w-36 lg:w-44 p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer shadow-xl backdrop-blur-md ${
                    isSelected
                      ? 'bg-zinc-950/90 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] scale-105 z-20'
                      : `bg-zinc-950/80 ${theme.border} hover:scale-105 hover:bg-zinc-900/90 z-10`
                  }`}
                >
                  {/* Top Faction Pill & Player Location Badge */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono uppercase tracking-wider truncate ${theme.badge}`}
                    >
                      {factionLabel}
                    </span>
                    {isPlayerHere ? (
                      <span className="px-1 sm:px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[8px] sm:text-[9px] font-mono font-semibold uppercase shrink-0">
                        {t('map.here', 'HERE', lang)}
                      </span>
                    ) : (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`}
                      />
                    )}
                  </div>

                  {/* Node Title & Subtitle */}
                  <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-zinc-100 mt-1 sm:mt-1.5 truncate">
                    {loc.title}
                  </div>
                  <div className="hidden sm:block text-[10px] lg:text-[11px] text-zinc-400 truncate">
                    {loc.district}
                  </div>

                  {/* Footer: Action Slots & Load Shedding Badges */}
                  <div className="mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
                    <span className="text-zinc-300">
                      {node.actionSlots.length} {t('map.slots', 'Slots', lang)}
                    </span>

                    {hasStage6Lockout && !state.generatorActiveToday && (
                      <span className="text-red-400 bg-red-950/60 px-1 py-0.5 rounded">
                        {t('map.dark', 'DARK', lang)}
                      </span>
                    )}
                    {hasStage6Lockout && state.generatorActiveToday && (
                      <span className="text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded">
                        {t('map.diesel', 'DIESEL', lang)}
                      </span>
                    )}
                    {hasStage6Bonus && (
                      <span className="text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">
                        +2 {t('map.stealth', 'STEALTH', lang)}
                      </span>
                    )}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* MOBILE ACTIVE NODE FOCUS CARD DOCKED AT BOTTOM (<640px) */}
        {selectedNode && selectedLoc && selectedTheme && (
          <div className="sm:hidden absolute bottom-2 inset-x-2 p-2 rounded-xl bg-zinc-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md z-30 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase tracking-wider ${selectedTheme.badge}`}>
                  {selectedFactionLabel}
                </span>
                {state.currentNodeId === selectedNode.id && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-mono font-bold uppercase">
                    {t('map.here', 'HERE', lang)}
                  </span>
                )}
                {selectedHasStage6Lockout && !state.generatorActiveToday && (
                  <span className="text-red-400 bg-red-950/70 border border-red-800 px-1 py-0.2 rounded text-[8px] font-mono">
                    {t('map.dark', 'DARK', lang)}
                  </span>
                )}
                {selectedHasStage6Lockout && state.generatorActiveToday && (
                  <span className="text-cyan-300 bg-cyan-950/70 border border-cyan-800 px-1 py-0.2 rounded text-[8px] font-mono">
                    {t('map.diesel', 'DIESEL', lang)}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-zinc-100 truncate mt-0.5">
                {selectedLoc.title}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate">
                {selectedLoc.district} • {selectedNode.actionSlots.length} {t('map.slots', 'Slots', lang)}
              </div>
            </div>

            {onInspectNode ? (
              <button
                type="button"
                onClick={() => onInspectNode(selectedNode.id)}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/80 text-amber-300 text-[11px] font-mono font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{t('ui.actions', 'ACTIONS', lang)}</span>
                <span>&rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectNode(selectedNode.id)}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/80 text-amber-300 text-[11px] font-mono font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{t('ui.selected', 'SELECTED', lang)}</span>
              </button>
            )}
          </div>
        )}

        {/* 4. MAP LEGEND OVERLAY (BOTTOM LEFT) */}
        <div className="hidden sm:flex absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800/80 items-center gap-4 text-[10px] font-mono text-zinc-400 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" /> {t('map.legend.active_corridor', 'Active Corridor', lang)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block" /> {t('map.legend.saps_roadblock', 'SAPS Roadblock', lang)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-zinc-500 inline-block" />{' '}
            {t('map.legend.locked_lead', 'Locked Lead', lang)}
          </span>
        </div>
      </div>
    </div>
  );
};
