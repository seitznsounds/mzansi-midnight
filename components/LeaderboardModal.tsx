'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LeaderboardEntry,
  LeaderboardTab,
  UserProfile,
} from '../types/leaderboard';
import { SupportedLanguage } from '../types/settings';
import { t } from '../engine/i18n';
import { fetchLeaderboard } from '../engine/cloudSync';
import { formatSpeedrunTime } from '../engine/scoringEngine';
import { CAMPAIGN_STORIES } from '../data/campaignStories';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
  userProfile?: UserProfile;
  lang?: SupportedLanguage;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
  userProfile,
  lang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('apex');
  const [selectedRegionalStory, setSelectedRegionalStory] =
    useState<string>('story_1_ethekwini');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load entries when tab or regional selection changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetchLeaderboard(activeTab, selectedRegionalStory)
      .then((data) => {
        if (isMounted) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load leaderboard:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, selectedRegionalStory]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.playerName.toLowerCase().includes(query) ||
        e.endingTitle.toLowerCase().includes(query) ||
        e.storyName.toLowerCase().includes(query) ||
        e.rankTitle.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  // Summary stats
  const topScore = entries.length > 0 ? Math.max(...entries.map((e) => e.score)) : 0;
  const bestSpeedrun =
    entries.filter((e) => e.completionSeconds > 0).length > 0
      ? Math.min(...entries.filter((e) => e.completionSeconds > 0).map((e) => e.completionSeconds))
      : 0;
  const maxEndings =
    entries.length > 0 ? Math.max(...entries.map((e) => e.endingsUnlockedCount)) : 0;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-5xl max-h-[92dvh] flex flex-col bg-[#0b0f14] border-2 border-amber-500/40 rounded-xl shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Top Decorative Tactical Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="leaderboard-title"
                  className="text-lg sm:text-xl font-black tracking-wider uppercase text-amber-300 font-mono"
                >
                  {t('scores.heading', 'Scores & Speedruns // Mzansi Fixer Registry', lang)}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono tracking-widest uppercase">
                  {t('scores.live_dispatch', 'Live Dispatch', lang)}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                {t(
                  'scores.subtitle',
                  'Federal High Scores // Tactical Speedruns // 25-Ending Anthology Completion',
                  lang
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/20 text-xs text-white/80 font-mono flex items-center gap-1.5 transition-colors"
                title={t('profile.tooltip', 'Operative Profile & Cloud Save', lang)}
              >
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.displayName}
                    className="w-4 h-4 rounded-full border border-amber-400/50"
                  />
                ) : (
                  <span>👤</span>
                )}
                <span>
                  {userProfile?.isGuest
                    ? t('auth.sign_in_google', 'Sign in with Google', lang)
                    : userProfile?.displayName || t('profile.title', 'Profile', lang)}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label={t('scores.close_aria', 'Close high score board', lang)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 flex items-center justify-center text-white/70 font-mono text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Benchmark Stats Banner */}
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 bg-black/40 text-center py-2.5 px-4 font-mono text-xs">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              {t('scores.record_high_score', 'Record High Score', lang)}
            </div>
            <div className="text-amber-400 font-black text-sm sm:text-base">
              {topScore.toLocaleString()} PTS
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              {t('scores.fastest_speedrun', 'Fastest Speedrun', lang)}
            </div>
            <div className="text-cyan-400 font-black text-sm sm:text-base">
              {bestSpeedrun > 0 ? formatSpeedrunTime(bestSpeedrun) : '--:--'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              {t('scores.max_endings_unlocked', 'Max Endings Unlocked', lang)}
            </div>
            <div className="text-emerald-400 font-black text-sm sm:text-base">
              {maxEndings}/25
            </div>
          </div>
        </div>

        {/* Tactical Tabs Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('apex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'apex'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {t('scores.tab_apex', '🏆 Apex Fixers', lang)}
            </button>
            <button
              onClick={() => setActiveTab('speedrun')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'speedrun'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {t('scores.tab_speedrunners', '⚡ Speedrunners', lang)}
            </button>
            <button
              onClick={() => setActiveTab('completionist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'completionist'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {t('scores.tab_completionists', '📚 Completionists (X/25)', lang)}
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'regional'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {t('scores.tab_regional', '🌐 Regional Anthology', lang)}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('scores.search_placeholder', 'Search operative...', lang)}
              className="w-full px-3 py-1.5 pl-8 bg-black/60 border border-white/20 rounded-lg text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="absolute left-2.5 top-1.5 text-xs text-white/40">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-xs text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Regional Filter Selector (When Regional tab active) */}
        {activeTab === 'regional' && (
          <div className="px-5 py-2 bg-purple-950/20 border-b border-purple-500/20 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-purple-300 font-bold uppercase">
              {t('scores.region_label', 'Region:', lang)}
            </span>
            {CAMPAIGN_STORIES.map((story) => (
              <button
                key={story.id}
                onClick={() => setSelectedRegionalStory(story.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedRegionalStory === story.id
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50 font-bold'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {t('story.' + story.id + '.title', story.title, lang)}
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard Table Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-white/40 font-mono text-sm">
              <div className="w-8 h-8 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
              <span>{t('scores.loading', 'Decrypting Federal Operative Dossiers...', lang)}</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-white/40 font-mono text-sm">
              <p>{t('scores.empty_query', 'No recorded fixers match the query.', lang)}</p>
              <p className="text-xs text-white/30 mt-1">
                {t(
                  'scores.empty_hint',
                  'Complete a campaign docket to log your name on the board.',
                  lang
                )}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const isTopThree = index < 3;
              const rankColor =
                index === 0
                  ? 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'
                  : index === 1
                  ? 'text-slate-300 border-slate-300/40 bg-slate-300/10'
                  : index === 2
                  ? 'text-amber-600 border-amber-600/40 bg-amber-600/10'
                  : 'text-white/40 border-white/10 bg-white/5';

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-all ${
                    isTopThree
                      ? 'bg-white/[0.04] border-white/20 hover:border-amber-400/50 shadow-sm'
                      : 'bg-black/30 border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* Left: Rank & Operative Identity */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:min-w-[200px]">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md border flex items-center justify-center font-mono font-black text-xs sm:text-sm shrink-0 ${rankColor}`}
                    >
                      {index === 0 ? '👑' : index + 1}
                    </div>

                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                      <img
                        src={
                          entry.playerAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.playerName}`
                        }
                        alt={entry.playerName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white font-mono truncate">
                          {entry.playerName}
                        </span>
                        {entry.isVerifiedCloud && (
                          <span
                            title={t('scores.verified_tooltip', 'Verified Cloud Fixer', lang)}
                            className="text-[10px] text-cyan-400 cursor-help"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-400/80 font-mono truncate">
                        {entry.rankTitle}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Resolution Docket Info */}
                  <div className="flex-1 min-w-[180px] hidden md:block">
                    <div className="text-xs text-white/90 font-medium truncate">
                      {entry.endingId
                        ? t(`ending.${entry.endingId}.title`, entry.endingTitle, lang)
                        : entry.endingTitle}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {entry.storyId
                        ? t(`story.${entry.storyId}.title`, entry.storyName, lang)
                        : entry.storyName}{' '}
                      •{' '}
                      {t('scores.cycles_survived', '{cycles} cycles survived', lang).replace(
                        '{cycles}',
                        String(entry.completionCycles)
                      )}
                    </div>
                  </div>

                  {/* Right: Metrics & High Score */}
                  <div className="flex items-center gap-4 sm:gap-6 font-mono shrink-0">
                    {/* Speedrun Time */}
                    <div className="text-right">
                      <div className="text-[10px] text-white/40 uppercase">
                        {t('scores.col_time', 'Time', lang)}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-cyan-400">
                        {entry.completionSeconds > 0
                          ? formatSpeedrunTime(entry.completionSeconds)
                          : '--:--'}
                      </div>
                    </div>

                    {/* Anthology Endings count */}
                    <div className="text-right">
                      <div className="text-[10px] text-white/40 uppercase">
                        {t('scores.col_endings', 'Endings', lang)}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-400">
                        {entry.endingsUnlockedCount}/25
                      </div>
                    </div>

                    {/* Overall Score */}
                    <div className="text-right min-w-[85px]">
                      <div className="text-[10px] text-white/40 uppercase">
                        {t('scores.col_score', 'Score', lang)}
                      </div>
                      <div className="text-sm sm:text-base font-black text-amber-300">
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/50">
          <div>
            {t(
              'scores.footer_showing',
              'Showing {count} registered dockets // Auto-sync active',
              lang
            ).replace('{count}', String(filteredEntries.length))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-400/70">
              {t(
                'scores.tip_lightning',
                '[TIP] Complete in under 03:00 to earn the Lightning Prowler bonus.',
                lang
              )}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold uppercase transition-colors"
            >
              {t('scores.close_btn', 'Close Dossier', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
