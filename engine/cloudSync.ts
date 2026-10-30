import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  LeaderboardEntry,
  LeaderboardTab,
  UserProfile,
  Achievement,
} from '../types/leaderboard';
import { CampaignProgression } from '../types/campaign';
import { loadUnlockedEndings } from './storage';
import { loadAchievements } from './achievements';

export { formatSpeedrunTime } from './scoringEngine';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://amomlgahljhqvsyqoxvy.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_v8xZV2YefXkEazB_i26i0g__WVcJEj9';

export const LOCAL_LEADERBOARD_KEY = 'mzansi_midnight_local_leaderboard_v1';
export const USER_PROFILE_KEY = 'mzansi_midnight_user_profile_v1';

// Safely initialize Supabase client
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Built-in South African Fixer Lore Benchmark entries.
 * Ensures the leaderboard has rich, authentic competitive targets from day one.
 */
export const BENCHMARK_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'bench_ghost_dlamini',
    playerName: 'Sipho "Ghost" Dlamini',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostDlamini',
    score: 34850,
    rankTitle: 'APEX MZANSI SOVEREIGN',
    storyId: 'story_5_octagon',
    storyName: 'The Sovereign Octagon',
    endingId: 'ending_octagon_constitutional_reckoning',
    endingTitle: 'Constitutional Reckoning',
    completionSeconds: 165, // 02:45 speedrun
    completionCycles: 2,
    endingsUnlockedCount: 25,
    keystonesCount: 4,
    composure: 98,
    cash: 7400,
    isVerifiedCloud: true,
    createdAt: '2026-10-24T18:40:00Z',
  },
  {
    id: 'bench_nomsa_khumalo',
    playerName: 'Advocate Nomsa Khumalo',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NomsaKhumalo',
    score: 31900,
    rankTitle: 'APEX MZANSI SOVEREIGN',
    storyId: 'story_2_highveld',
    storyName: 'Highveld-Chrome',
    endingId: 'ending_highveld_siu_vindication',
    endingTitle: 'SIU Clean Hands Vindication',
    completionSeconds: 192, // 03:12
    completionCycles: 3,
    endingsUnlockedCount: 23,
    keystonesCount: 4,
    composure: 92,
    cash: 5200,
    isVerifiedCloud: true,
    createdAt: '2026-10-25T11:20:00Z',
  },
  {
    id: 'bench_bra_bheki',
    playerName: 'Bheki "Wire" Sithole',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BraBheki',
    score: 29400,
    rankTitle: 'MASTER FIXER // GHOST PROTOCOL',
    storyId: 'story_1_ethekwini',
    storyName: 'eThekwini-Gold',
    endingId: 'ending_vigilante',
    endingTitle: 'Vigilante Docket Verdict',
    completionSeconds: 215, // 03:35
    completionCycles: 2,
    endingsUnlockedCount: 21,
    keystonesCount: 3,
    composure: 88,
    cash: 4800,
    isVerifiedCloud: true,
    createdAt: '2026-10-25T14:15:00Z',
  },
  {
    id: 'bench_kalahari_runner',
    playerName: 'Lerato "Kalahari" Van Wyk',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LeratoVanWyk',
    score: 27800,
    rankTitle: 'MASTER FIXER // GHOST PROTOCOL',
    storyId: 'story_3_namaqua',
    storyName: 'Namaqua-Diamond',
    endingId: 'ending_namaqua_naval_raid',
    endingTitle: 'Naval Boarding Raid',
    completionSeconds: 230, // 03:50
    completionCycles: 3,
    endingsUnlockedCount: 19,
    keystonesCount: 3,
    composure: 90,
    cash: 6200,
    isVerifiedCloud: true,
    createdAt: '2026-10-25T19:30:00Z',
  },
  {
    id: 'bench_cape_ghost',
    playerName: 'Tariq "Ghoema" Manuel',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TariqManuel',
    score: 25400,
    rankTitle: 'MASTER FIXER // GHOST PROTOCOL',
    storyId: 'story_4_cape',
    storyName: 'Cape-Nocturne',
    endingId: 'ending_cape_sovereign_seizure',
    endingTitle: 'Long Street Sovereign Seizure',
    completionSeconds: 258, // 04:18
    completionCycles: 3,
    endingsUnlockedCount: 16,
    keystonesCount: 3,
    composure: 84,
    cash: 5100,
    isVerifiedCloud: true,
    createdAt: '2026-10-26T04:10:00Z',
  },
  {
    id: 'bench_fatima_cassim',
    playerName: 'Dr. Fatima Cassim',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=FatimaCassim',
    score: 22600,
    rankTitle: 'SENIOR HIGHVELD BROKER',
    storyId: 'story_5_octagon',
    storyName: 'The Sovereign Octagon',
    endingId: 'ending_octagon_peoples_revolution',
    endingTitle: 'Mass Civic Revolution',
    completionSeconds: 284, // 04:44
    completionCycles: 4,
    endingsUnlockedCount: 14,
    keystonesCount: 2,
    composure: 78,
    cash: 3900,
    isVerifiedCloud: true,
    createdAt: '2026-10-26T09:45:00Z',
  },
  {
    id: 'bench_piet_strydom',
    playerName: 'Inspector Piet Strydom',
    playerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PietStrydom',
    score: 19800,
    rankTitle: 'SENIOR HIGHVELD BROKER',
    storyId: 'story_1_ethekwini',
    storyName: 'eThekwini-Gold',
    endingId: 'ending_whistleblower',
    endingTitle: 'Whistleblower Expose',
    completionSeconds: 320, // 05:20
    completionCycles: 4,
    endingsUnlockedCount: 10,
    keystonesCount: 1,
    composure: 72,
    cash: 2900,
    isVerifiedCloud: true,
    createdAt: '2026-10-26T12:00:00Z',
  },
];

/**
 * Authentication Helper Functions & Subscription System
 */
type ProfileListener = (profile: UserProfile) => void;
const profileListeners = new Set<ProfileListener>();

/**
 * Subscribe to real-time User Profile changes (auth state, callsign edits, cloud sync).
 * Immediately invokes callback with current cached profile upon registration.
 */
export function subscribeToUserProfile(listener: ProfileListener): () => void {
  profileListeners.add(listener);
  try {
    listener(getSavedUserProfile());
  } catch {
    // Ignore initial invocation error
  }
  return () => {
    profileListeners.delete(listener);
  };
}

/**
 * Broadcast updated profile to all active listeners in React components.
 */
export function notifyUserProfileListeners(profile: UserProfile): void {
  profileListeners.forEach((listener) => {
    try {
      listener(profile);
    } catch (e) {
      console.error('[Auth] Error notifying profile listener:', e);
    }
  });
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    if (typeof window === 'undefined') return { error: null };
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    return { error: error ? new Error(error.message) : null };
  } catch (err: any) {
    return { error: err };
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    // Also clear cached profile and notify all screens to revert to guest dossier
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_PROFILE_KEY);
      const guestProfile = getSavedUserProfile();
      notifyUserProfileListeners(guestProfile);
    }
    return { error: error ? new Error(error.message) : null };
  } catch (err: any) {
    return { error: err };
  }
}

export async function getSupabaseUser(): Promise<User | null> {
  try {
    // Fast path: inspect local active session first without network delay
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      return sessionData.session.user;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * User Profile & Local Identity Management
 */
export function getSavedUserProfile(): UserProfile {
  const defaultProfile: UserProfile = {
    id: 'guest_fixer_' + Math.random().toString(36).substring(2, 8),
    email: '',
    displayName: 'Fixer-Operative',
    isGuest: true,
    totalRunsCompleted: 0,
    highestScore: 0,
    fastestRunSeconds: 0,
    unlockedEndingsCount: 0,
  };

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const raw = window.localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    notifyUserProfileListeners(profile);
  } catch {
    // Ignore storage errors
  }
}

export async function syncUserProfileWithAuth(explicitUser?: User | null): Promise<UserProfile> {
  const localProfile = getSavedUserProfile();
  const user = explicitUser !== undefined ? explicitUser : await getSupabaseUser();

  if (user) {
    const googleName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Fixer-Operative';
    const avatar =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`;

    const updated: UserProfile = {
      ...localProfile,
      id: user.id,
      email: user.email || '',
      displayName:
        localProfile.isGuest || localProfile.displayName === 'Fixer-Operative'
          ? googleName
          : localProfile.displayName,
      avatarUrl: avatar,
      isGuest: false,
    };
    saveUserProfile(updated);
    return updated;
  }

  return localProfile;
}

/**
 * Detects and handles OAuth redirect parameters (PKCE `code` or implicit tokens)
 * in the window URL, exchanges the code for a verified session, cleans the browser URL bar,
 * and synchronizes the local user profile.
 */
export async function handleAuthRedirect(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;

  try {
    const currentUrl = new URL(window.location.href);
    const code = currentUrl.searchParams.get('code');
    const errorParam =
      currentUrl.searchParams.get('error') ||
      (window.location.hash.includes('error=') ? 'oauth_error' : null);
    const hasHashTokens =
      window.location.hash &&
      (window.location.hash.includes('access_token=') ||
        window.location.hash.includes('refresh_token='));

    // Handle provider errors (e.g. user cancelled login)
    if (errorParam) {
      const errorDesc =
        currentUrl.searchParams.get('error_description') ||
        'Authentication was cancelled or failed.';
      console.warn('[Auth] OAuth redirect error:', errorParam, errorDesc);

      // Clean error params from address bar
      currentUrl.searchParams.delete('error');
      currentUrl.searchParams.delete('error_code');
      currentUrl.searchParams.delete('error_description');
      const cleanUrl =
        currentUrl.pathname +
        (currentUrl.search ? currentUrl.search : '') +
        (window.location.hash.includes('error=') ? '' : currentUrl.hash);
      window.history.replaceState({}, document.title, cleanUrl);
      return null;
    }

    // 1. PKCE Code Exchange flow
    if (code) {
      console.log('[Auth] Detected OAuth code in URL. Exchanging for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      // Clean the OAuth code and state from URL immediately to prevent reused code errors
      currentUrl.searchParams.delete('code');
      currentUrl.searchParams.delete('state');
      const cleanUrl =
        currentUrl.pathname + (currentUrl.search ? currentUrl.search : '') + currentUrl.hash;
      window.history.replaceState({}, document.title, cleanUrl);

      if (error) {
        console.error('[Auth] Failed to exchange code for session:', error.message);
      } else if (data?.session?.user) {
        console.log('[Auth] Session established successfully for:', data.session.user.email);
        const synced = await syncUserProfileWithAuth(data.session.user);
        return synced;
      }
    }
    // 2. Hash Fragment Token flow
    else if (hasHashTokens) {
      console.log('[Auth] Detected OAuth tokens in hash fragment. Parsing session...');
      const { data } = await supabase.auth.getSession();

      // Clean hash from URL
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      if (data?.session?.user) {
        const synced = await syncUserProfileWithAuth(data.session.user);
        return synced;
      }
    }

    // Check if session exists in storage
    const { data: currentSession } = await supabase.auth.getSession();
    if (currentSession?.session?.user) {
      const synced = await syncUserProfileWithAuth(currentSession.session.user);
      return synced;
    }

    return null;
  } catch (err) {
    console.error('[Auth] Error processing auth redirect:', err);
    return null;
  }
}

let isAuthListenerInitialized = false;

/**
 * Initializes global Supabase Auth listener and handles OAuth redirects.
 * Safe to call multiple times (idempotent).
 */
export function setupAuthListener(): void {
  if (typeof window === 'undefined' || isAuthListenerInitialized) return;
  isAuthListenerInitialized = true;

  // Process any pending OAuth URL redirect on page load
  handleAuthRedirect();

  // Listen to Supabase Auth lifecycle events
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (
      event === 'SIGNED_IN' ||
      event === 'INITIAL_SESSION' ||
      event === 'TOKEN_REFRESHED' ||
      event === 'USER_UPDATED'
    ) {
      if (session?.user) {
        await syncUserProfileWithAuth(session.user);
      }
    } else if (event === 'SIGNED_OUT') {
      const defaultGuest = getSavedUserProfile();
      notifyUserProfileListeners(defaultGuest);
    }
  });
}

/**
 * Local Leaderboard Storage
 */
export function getLocalLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLeaderboardEntries(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage errors
  }
}

/**
 * High Score Submission (Local + Cloud Supabase)
 */
export async function submitHighScore(
  entryData: Omit<LeaderboardEntry, 'id' | 'createdAt' | 'isVerifiedCloud'>
): Promise<{ success: boolean; entry: LeaderboardEntry; isCloud: boolean }> {
  const now = new Date().toISOString();
  const id = 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const newEntry: LeaderboardEntry = {
    ...entryData,
    id,
    createdAt: now,
    isVerifiedCloud: false,
  };

  // 1. Always save to local storage immediately
  const localEntries = getLocalLeaderboardEntries();
  const updatedLocal = [newEntry, ...localEntries].slice(0, 50); // Keep top 50 local
  saveLocalLeaderboardEntries(updatedLocal);

  // Update user profile statistics
  const profile = getSavedUserProfile();
  const newFastest =
    profile.fastestRunSeconds <= 0
      ? newEntry.completionSeconds
      : Math.min(profile.fastestRunSeconds, newEntry.completionSeconds);
  const newHighest = Math.max(profile.highestScore, newEntry.score);

  saveUserProfile({
    ...profile,
    totalRunsCompleted: profile.totalRunsCompleted + 1,
    highestScore: newHighest,
    fastestRunSeconds: newFastest,
    unlockedEndingsCount: Math.max(profile.unlockedEndingsCount, newEntry.endingsUnlockedCount),
  });

  // 2. Attempt remote Supabase insertion
  let isCloud = false;
  try {
    const { error } = await supabase.from('mzansi_leaderboard').insert([
      {
        player_name: newEntry.playerName,
        player_avatar: newEntry.playerAvatar,
        user_id: newEntry.userId,
        score: newEntry.score,
        rank_title: newEntry.rankTitle,
        story_id: newEntry.storyId,
        story_name: newEntry.storyName,
        ending_id: newEntry.endingId,
        ending_title: newEntry.endingTitle,
        completion_seconds: newEntry.completionSeconds,
        completion_cycles: newEntry.completionCycles,
        endings_unlocked_count: newEntry.endingsUnlockedCount,
        keystones_count: newEntry.keystonesCount,
        composure: newEntry.composure,
        cash: newEntry.cash,
        created_at: now,
      },
    ]);

    if (!error) {
      isCloud = true;
      newEntry.isVerifiedCloud = true;
    }
  } catch (err) {
    // If table doesn't exist yet or offline, local persistence succeeded
    console.warn('Supabase cloud leaderboard sync skipped or offline:', err);
  }

  return { success: true, entry: newEntry, isCloud };
}

/**
 * Fetch Leaderboard with Filtering and Sorting
 */
export async function fetchLeaderboard(
  tab: LeaderboardTab = 'apex',
  regionalStoryId?: string
): Promise<LeaderboardEntry[]> {
  let remoteEntries: LeaderboardEntry[] = [];

  // Try fetching from Supabase table
  try {
    let query = supabase.from('mzansi_leaderboard').select('*');

    if (tab === 'apex') {
      query = query.order('score', { ascending: false });
    } else if (tab === 'speedrun') {
      query = query
        .gt('completion_seconds', 0)
        .order('completion_seconds', { ascending: true });
    } else if (tab === 'completionist') {
      query = query
        .order('endings_unlocked_count', { ascending: false })
        .order('score', { ascending: false });
    } else if (tab === 'regional' && regionalStoryId) {
      query = query.eq('story_id', regionalStoryId).order('score', { ascending: false });
    } else {
      query = query.order('score', { ascending: false });
    }

    const { data, error } = await query.limit(50);

    if (!error && data && data.length > 0) {
      remoteEntries = data.map((row: any) => ({
        id: String(row.id),
        userId: row.user_id,
        playerName: row.player_name,
        playerAvatar: row.player_avatar,
        score: row.score,
        rankTitle: row.rank_title,
        storyId: row.story_id,
        storyName: row.story_name,
        endingId: row.ending_id,
        endingTitle: row.ending_title,
        completionSeconds: row.completion_seconds,
        completionCycles: row.completion_cycles,
        endingsUnlockedCount: row.endings_unlocked_count,
        keystonesCount: row.keystones_count,
        composure: row.composure,
        cash: row.cash,
        isVerifiedCloud: true,
        createdAt: row.created_at,
      }));
    }
  } catch (err) {
    console.warn('Leaderboard remote fetch unavailable, using local & benchmarks:', err);
  }

  // Merge: remote entries + local entries + benchmarks
  const localEntries = getLocalLeaderboardEntries();
  const allEntries = [...remoteEntries, ...localEntries, ...BENCHMARK_LEADERBOARD_ENTRIES];

  // De-duplicate by ID
  const seenIds = new Set<string>();
  const uniqueEntries: LeaderboardEntry[] = [];
  for (const entry of allEntries) {
    if (!seenIds.has(entry.id)) {
      seenIds.add(entry.id);
      uniqueEntries.push(entry);
    }
  }

  // Filter & Sort
  let filtered = uniqueEntries;
  if (tab === 'regional') {
    const targetStory = regionalStoryId || 'story_1_ethekwini';
    filtered = uniqueEntries.filter((e) => e.storyId === targetStory);
    return filtered.sort((a, b) => b.score - a.score);
  }

  if (tab === 'speedrun') {
    return filtered
      .filter((e) => e.completionSeconds > 0)
      .sort((a, b) => a.completionSeconds - b.completionSeconds);
  }

  if (tab === 'completionist') {
    return filtered.sort((a, b) => {
      if (b.endingsUnlockedCount !== a.endingsUnlockedCount) {
        return b.endingsUnlockedCount - a.endingsUnlockedCount;
      }
      return b.score - a.score;
    });
  }

  // Default 'apex': Sort by Score
  return filtered.sort((a, b) => b.score - a.score);
}

/**
 * Full Cloud Progress Backup and Restore
 */
export async function backupProgressToCloud(params: {
  progression: CampaignProgression;
  profile: UserProfile;
}): Promise<{ success: boolean; message: string }> {
  const user = await getSupabaseUser();
  if (!user) {
    return {
      success: false,
      message: 'Sign in with Google to enable cloud synchronization.',
    };
  }

  const unlockedEndings = loadUnlockedEndings();
  const achievements = loadAchievements();
  const now = new Date().toISOString();

  try {
    const { error } = await supabase.from('mzansi_user_saves').upsert(
      [
        {
          user_id: user.id,
          email: user.email,
          display_name: params.profile.displayName,
          progression_json: params.progression,
          unlocked_endings_json: unlockedEndings,
          achievements_json: achievements,
          updated_at: now,
        },
      ],
      { onConflict: 'user_id' }
    );

    if (error) {
      return { success: false, message: `Cloud backup failed: ${error.message}` };
    }

    saveUserProfile({
      ...params.profile,
      lastSyncedAt: now,
    });

    return {
      success: true,
      message: 'Campaign progress, all 25 endings, and achievements synced to cloud!',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sync encountered a network error.' };
  }
}

export async function restoreProgressFromCloud(): Promise<{
  success: boolean;
  message: string;
  data?: {
    progression: CampaignProgression;
    unlockedEndings: any;
    achievements: Achievement[];
  };
}> {
  const user = await getSupabaseUser();
  if (!user) {
    return {
      success: false,
      message: 'Sign in with Google to restore your saved cloud progress.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('mzansi_user_saves')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return {
        success: false,
        message: 'No cloud save file found for this Google account.',
      };
    }

    return {
      success: true,
      message: 'Progress successfully retrieved from cloud!',
      data: {
        progression: data.progression_json,
        unlockedEndings: data.unlocked_endings_json,
        achievements: data.achievements_json || [],
      },
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to cloud backup.' };
  }
}
