'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, Achievement } from '../types/leaderboard';
import { SupportedLanguage } from '../types/settings';
import { t } from '../engine/i18n';
import { CampaignProgression } from '../types/campaign';
import {
  signInWithGoogle,
  signOutUser,
  syncUserProfileWithAuth,
  saveUserProfile,
  subscribeToUserProfile,
  updateOperativeCallsign,
  getSavedUserProfile,
  backupProgressToCloud,
  restoreProgressFromCloud,
} from '../engine/cloudSync';
import { formatSpeedrunTime } from '../engine/scoringEngine';
import { loadAchievements } from '../engine/achievements';
import { loadCampaignProgression, saveCampaignProgression } from '../engine/campaignStorage';
import { loadUnlockedEndings } from '../engine/storage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
  onRestoreSuccess?: () => void;
  lang?: SupportedLanguage;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  onRestoreSuccess,
  lang = 'en',
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => ({
    id: 'guest',
    email: '',
    displayName: 'Fixer-Operative',
    isGuest: true,
    totalRunsCompleted: 0,
    highestScore: 0,
    fastestRunSeconds: 0,
    unlockedEndingsCount: 0,
  }));
  const [callsignInput, setCallsignInput] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  }>({ type: null, message: '' });

  // Subscribe to real-time profile updates (without blowing away active input draft)
  useEffect(() => {
    const unsubscribe = subscribeToUserProfile((p) => {
      setProfile(p);
    });
    return () => unsubscribe();
  }, []);

  // Initialize profile and draft callsign input strictly when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const currentProfile = getSavedUserProfile();
    setProfile(currentProfile);
    setCallsignInput(currentProfile.displayName);
    setAchievements(loadAchievements());
    setSyncStatus({ type: null, message: '' });

    // Background auth sync without clobbering callsignInput draft
    syncUserProfileWithAuth().then((synced) => {
      setProfile(synced);
      if (onProfileUpdated) onProfileUpdated(synced);
    });
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGoogleLogin = async () => {
    setSyncStatus({
      type: 'loading',
      message: t('profile.msg_connecting', 'Connecting to Google OAuth...', lang),
    });
    const { error } = await signInWithGoogle();
    if (error) {
      setSyncStatus({ type: 'error', message: error.message });
    }
  };

  const handleSignOut = async () => {
    setSyncStatus({
      type: 'loading',
      message: t('profile.msg_terminating', 'Terminating session...', lang),
    });
    await signOutUser();
    const updated = await syncUserProfileWithAuth();
    setProfile(updated);
    setCallsignInput(updated.displayName);
    if (onProfileUpdated) onProfileUpdated(updated);
    setSyncStatus({
      type: 'success',
      message: t('profile.msg_signed_out', 'Signed out to guest dossier.', lang),
    });
  };

  const handleSaveCallsign = async () => {
    const trimmed = callsignInput.trim();
    if (!trimmed) return;

    setSyncStatus({
      type: 'loading',
      message: t('profile.msg_saving_handle', 'Updating operative handle...', lang),
    });

    try {
      const updated = await updateOperativeCallsign(trimmed);
      setProfile(updated);
      setCallsignInput(updated.displayName);
      if (onProfileUpdated) onProfileUpdated(updated);
      setSyncStatus({
        type: 'success',
        message: t('profile.msg_callsign_updated', 'Callsign updated successfully.', lang),
      });
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err?.message || 'Failed to update handle.',
      });
    }
  };

  const handleBackupToCloud = async () => {
    setSyncStatus({
      type: 'loading',
      message: t('profile.msg_encrypting_sync', 'Encrypting and syncing save file...', lang),
    });
    const progression = loadCampaignProgression();
    const res = await backupProgressToCloud({ progression, profile });
    if (res.success) {
      setSyncStatus({ type: 'success', message: res.message });
      setProfile((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
      }));
    } else {
      setSyncStatus({ type: 'error', message: res.message });
    }
  };

  const handleRestoreFromCloud = async () => {
    setSyncStatus({
      type: 'loading',
      message: t('profile.msg_querying_cloud', 'Querying cloud save file...', lang),
    });
    const res = await restoreProgressFromCloud();
    if (res.success && res.data) {
      // Restore progression
      saveCampaignProgression(res.data.progression);

      // Restore unlocked endings to localStorage
      if (typeof window !== 'undefined' && res.data.unlockedEndings) {
        window.localStorage.setItem(
          'mzansi_midnight_endings_v1',
          JSON.stringify(res.data.unlockedEndings)
        );
      }

      setSyncStatus({
        type: 'success',
        message: t(
          'profile.msg_restored',
          'Cloud dossier successfully restored to active game state.',
          lang
        ),
      });

      if (onRestoreSuccess) onRestoreSuccess();
    } else {
      setSyncStatus({ type: 'error', message: res.message });
    }
  };

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[92dvh] flex flex-col bg-[#0b0f14] border-2 border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-950/40 overflow-hidden font-mono">
        {/* Top Decorative Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-600 via-sky-400 to-cyan-700" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h2
                id="profile-title"
                className="text-lg font-black tracking-wider uppercase text-cyan-300"
              >
                {t('profile.vault_title', 'Operative Profile & Cloud Vault', lang)}
              </h2>
              <p className="text-xs text-white/50">
                {t(
                  'profile.subtitle',
                  'Google Authentication // Cloud Save Sync // Fixer Accolades',
                  lang
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 flex items-center justify-center text-white/70 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Status Alert Banner */}
          {syncStatus.type && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : syncStatus.type === 'error'
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
              }`}
            >
              <span>{syncStatus.message}</span>
              <button
                onClick={() => setSyncStatus({ type: null, message: '' })}
                className="text-white/40 hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* User Auth Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-black/50 border-2 border-cyan-400/60 shadow-lg shadow-cyan-950/50 shrink-0">
                <img
                  src={
                    profile.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.displayName}`
                  }
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white">
                    {profile.displayName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      profile.isGuest
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {profile.isGuest
                      ? t('profile.guest_badge', 'Guest Operative', lang)
                      : t('profile.verified_badge', 'Google Verified', lang)}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  {profile.email ||
                    t(
                      'profile.local_dossier',
                      'Local Dossier (Sign in to back up progress)',
                      lang
                    )}
                </div>
                {profile.lastSyncedAt && (
                  <div className="text-[10px] text-cyan-400/70 mt-1">
                    {t('profile.last_sync', 'Last Cloud Sync: {time}', lang).replace(
                      '{time}',
                      new Date(profile.lastSyncedAt).toLocaleString()
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="shrink-0 w-full sm:w-auto">
              {profile.isGuest ? (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md shadow-white/10"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t('auth.sign_in_google', 'Sign in with Google', lang)}</span>
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase transition-colors"
                >
                  {t('auth.sign_out', 'Sign Out', lang)}
                </button>
              )}
            </div>
          </div>

          {/* Callsign Editor */}
          <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-white/50 uppercase tracking-widest block">
                  {t('profile.callsign_label', 'Operative Callsign', lang)}
                </label>
                {profile.customCallsign && (
                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold">
                    ★ {t('profile.custom_badge', 'Custom Handle', lang)}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={callsignInput}
                onChange={(e) => setCallsignInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveCallsign();
                  }
                }}
                maxLength={30}
                placeholder={t('profile.callsign_placeholder', 'Enter operative handle...', lang)}
                className="w-full px-3 py-1.5 bg-black/70 border border-white/20 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <button
              onClick={handleSaveCallsign}
              disabled={!callsignInput.trim() || callsignInput.trim() === profile.displayName}
              className={`w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded text-xs font-bold uppercase self-stretch sm:self-end transition-colors cursor-pointer text-center ${
                !callsignInput.trim() || callsignInput.trim() === profile.displayName
                  ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              }`}
            >
              {t('profile.update_handle_btn', 'Update Handle', lang)}
            </button>
          </div>

          {/* Career Stats Grid */}
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
              {t('profile.career_stats', 'Career Fixer Statistics', lang)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-black/30 border border-white/10 text-center">
                <div className="text-[10px] text-white/40 uppercase">
                  {t('profile.stat_dockets', 'Dockets Resolved', lang)}
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {profile.totalRunsCompleted}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/10 text-center">
                <div className="text-[10px] text-white/40 uppercase">
                  {t('profile.stat_apex_score', 'Apex High Score', lang)}
                </div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {profile.highestScore > 0 ? profile.highestScore.toLocaleString() : '---'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/10 text-center">
                <div className="text-[10px] text-white/40 uppercase">
                  {t('profile.stat_fastest_run', 'Fastest Run', lang)}
                </div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">
                  {profile.fastestRunSeconds > 0
                    ? formatSpeedrunTime(profile.fastestRunSeconds)
                    : '--:--'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/10 text-center">
                <div className="text-[10px] text-white/40 uppercase">
                  {t('profile.stat_endings_unlocked', 'Endings Unlocked', lang)}
                </div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {Object.keys(loadUnlockedEndings()).length}/25
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Sync Action Vault */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  {t('profile.cloud_sync_title', 'Cloud State Synchronization', lang)}
                </div>
                <div className="text-[11px] text-white/50">
                  {t(
                    'profile.cloud_sync_desc',
                    'Save all campaign unlocked chapters, 25 endings, and achievements to the cloud.',
                    lang
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={handleBackupToCloud}
                disabled={profile.isGuest}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  profile.isGuest
                    ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                }`}
              >
                <span>☁️</span>
                <span>{t('profile.backup_btn', 'Backup Save to Cloud', lang)}</span>
              </button>

              <button
                onClick={handleRestoreFromCloud}
                disabled={profile.isGuest}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  profile.isGuest
                    ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                }`}
              >
                <span>📥</span>
                <span>{t('profile.restore_btn', 'Restore from Cloud', lang)}</span>
              </button>
            </div>

            {profile.isGuest && (
              <p className="text-[10px] text-amber-300/80 pt-1">
                {t(
                  'profile.guest_note',
                  '* Sign in with Google above to unlock cross-device cloud sync and protected leaderboard verification.',
                  lang
                )}
              </p>
            )}

            <div className="pt-2 text-[10px] text-white/40 flex items-center justify-between border-t border-white/5">
              <span>Cloud data is encrypted &amp; governed by POPIA.</span>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-1 flex items-center gap-0.5"
              >
                <span>Privacy Notice</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Achievements Accolades Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-white/40 uppercase tracking-widest">
                {t(
                  'profile.accolades_header',
                  'Career Accolades ({count}/{total})',
                  lang
                )
                  .replace('{count}', String(unlockedCount))
                  .replace('{total}', String(achievements.length))}
              </div>
              <div className="text-xs text-amber-400 font-bold">
                {t('profile.complete_pct', '{pct}% Complete', lang).replace(
                  '{pct}',
                  String(Math.round((unlockedCount / achievements.length) * 100))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${
                    ach.unlocked
                      ? 'bg-amber-500/[0.06] border-amber-500/30'
                      : 'bg-black/40 border-white/5 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg shrink-0 ${
                      ach.unlocked
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/20'
                    }`}
                  >
                    {ach.unlocked ? ach.icon : '🔒'}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          ach.unlocked ? 'text-amber-200' : 'text-white/40'
                        }`}
                      >
                        {t(`ach.${ach.id}.title`, ach.title, lang)}
                      </span>
                      {ach.unlocked && (
                        <span className="text-[9px] text-emerald-400 shrink-0 font-bold">
                          {t('profile.done_badge', 'DONE', lang)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {t(`ach.${ach.id}.desc`, ach.description, lang)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-white/50">
          <div>
            {t('profile.registry_id', 'Operative Registry ID: {id}...', lang).replace(
              '{id}',
              profile.id.substring(0, 12)
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase transition-colors"
          >
            {t('profile.close_vault_btn', 'Close Vault', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
