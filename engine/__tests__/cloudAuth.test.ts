import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSavedUserProfile,
  saveUserProfile,
  syncUserProfileWithAuth,
  updateOperativeCallsign,
  subscribeToUserProfile,
  USER_PROFILE_KEY,
} from '../cloudSync';
import { UserProfile } from '../../types/leaderboard';
import { User } from '@supabase/supabase-js';

describe('Cloud Auth & Session Recognition Engine', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
      },
      location: {
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
      },
      history: {
        replaceState: vi.fn(),
      },
    });
    vi.restoreAllMocks();
  });

  it('provides a default guest profile when local storage is empty', () => {
    const profile = getSavedUserProfile();
    expect(profile.isGuest).toBe(true);
    expect(profile.displayName).toBe('Fixer-Operative');
    expect(profile.email).toBe('');
    expect(profile.id).toMatch(/^guest_fixer_/);
  });

  it('saves user profile to local storage and notifies subscribers', () => {
    let received: UserProfile | null = null;
    const unsubscribe = subscribeToUserProfile((p) => {
      received = p;
    });

    const testProfile: UserProfile = {
      id: 'usr_test_123',
      email: 'investigator@hawks.gov.za',
      displayName: 'Captain Nandi',
      isGuest: false,
      totalRunsCompleted: 3,
      highestScore: 12500,
      fastestRunSeconds: 420,
      unlockedEndingsCount: 2,
    };

    saveUserProfile(testProfile);
    expect(received).toEqual(testProfile);

    const stored = JSON.parse(localStorageMock[USER_PROFILE_KEY] || '{}');
    expect(stored.displayName).toBe('Captain Nandi');
    expect(stored.isGuest).toBe(false);

    unsubscribe();
  });

  it('syncs profile with authenticated Google user, setting isGuest to false', async () => {
    const mockUser: User = {
      id: 'google_uid_999',
      app_metadata: {},
      user_metadata: {
        full_name: 'Sipho "Ghost" Dlamini',
        avatar_url: 'https://lh3.googleusercontent.com/test-avatar.jpg',
      },
      aud: 'authenticated',
      created_at: '2026-10-30T10:00:00Z',
      email: 'sipho.dlamini@mzansimidnight.za',
    };

    const synced = await syncUserProfileWithAuth(mockUser);
    expect(synced.isGuest).toBe(false);
    expect(synced.id).toBe('google_uid_999');
    expect(synced.email).toBe('sipho.dlamini@mzansimidnight.za');
    expect(synced.displayName).toBe('Sipho "Ghost" Dlamini');
    expect(synced.avatarUrl).toBe('https://lh3.googleusercontent.com/test-avatar.jpg');

    const loaded = getSavedUserProfile();
    expect(loaded.isGuest).toBe(false);
    expect(loaded.displayName).toBe('Sipho "Ghost" Dlamini');
  });

  it('preserves custom callsign when synced with Google user if already customized', async () => {
    const existing: UserProfile = {
      id: 'existing_id',
      email: '',
      displayName: 'Bra K Shadow Fox',
      isGuest: false,
      totalRunsCompleted: 5,
      highestScore: 20000,
      fastestRunSeconds: 300,
      unlockedEndingsCount: 4,
    };
    saveUserProfile(existing);

    const mockUser: User = {
      id: 'google_uid_777',
      app_metadata: {},
      user_metadata: {
        full_name: 'Kagiso Molefe',
      },
      aud: 'authenticated',
      created_at: '2026-10-30T10:00:00Z',
      email: 'kagiso@gmail.com',
    };

    const synced = await syncUserProfileWithAuth(mockUser);
    expect(synced.displayName).toBe('Bra K Shadow Fox');
    expect(synced.email).toBe('kagiso@gmail.com');
  });

  it('allows user to update operative callsign, persisting customCallsign and notifying listeners', async () => {
    let received: UserProfile | null = null;
    const unsubscribe = subscribeToUserProfile((p) => {
      received = p;
    });

    const updated = await updateOperativeCallsign('Soweto Vanguard');
    expect(updated.displayName).toBe('Soweto Vanguard');
    expect(updated.customCallsign).toBe('Soweto Vanguard');
    expect((received as UserProfile | null)?.displayName).toBe('Soweto Vanguard');

    const loaded = getSavedUserProfile();
    expect(loaded.displayName).toBe('Soweto Vanguard');
    expect(loaded.customCallsign).toBe('Soweto Vanguard');

    unsubscribe();
  });

  it('rejects empty or whitespace-only operative callsigns', async () => {
    await expect(updateOperativeCallsign('   ')).rejects.toThrow('Callsign cannot be empty.');
  });

  it('respects custom_callsign stored in Supabase user_metadata', async () => {
    const mockUser: User = {
      id: 'google_uid_meta',
      app_metadata: {},
      user_metadata: {
        full_name: 'Lungile Khanyile',
        custom_callsign: 'Apex Gqom Operator',
      },
      aud: 'authenticated',
      created_at: '2026-10-30T10:00:00Z',
      email: 'lungile@mzansi.co.za',
    };

    const synced = await syncUserProfileWithAuth(mockUser);
    expect(synced.displayName).toBe('Apex Gqom Operator');
    expect(synced.customCallsign).toBe('Apex Gqom Operator');
  });

  it('unsubscribes listeners cleanly without memory leaks', () => {
    let callCount = 0;
    const unsubscribe = subscribeToUserProfile(() => {
      callCount++;
    });

    // Initial registration invocation
    expect(callCount).toBe(1);

    saveUserProfile(getSavedUserProfile());
    expect(callCount).toBe(2);

    unsubscribe();
    saveUserProfile(getSavedUserProfile());
    expect(callCount).toBe(2); // No further increments after unsubscription
  });
});
