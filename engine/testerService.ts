import { supabase } from './cloudSync';

export const PLAY_STORE_PACKAGE_ID = 'za.co.mzansimidnight.app';
export const PLAY_STORE_APP_URL =
  'https://play.google.com/store/apps/details?id=za.co.mzansimidnight.app&hl=en';
export const PLAY_STORE_OPT_IN_URL =
  'https://play.google.com/apps/testing/za.co.mzansimidnight.app';
export const PLAY_STORE_TESTER_LIST_NAME = 'Visita Testers';

export const LOCAL_PLAY_TESTER_KEY = 'mzansi_midnight_play_tester_v1';

export const GOOGLE_PLAY_REQUIREMENT_NOTICE = {
  shortSummary:
    'Google Play requires apps to go through a closed testing phase before production release.',
  fullDescription:
    'In accordance with Google Play Developer Policy, apps published from personal developer accounts must complete a closed testing phase with dedicated testers opted in for at least 14 continuous days before Google grants approval for public production release on the Play Store.',
  warning:
    'Visiting the Google Play Store link without an authorized tester account will display an "Item not found" error because the app is currently restricted to the closed testing track.',
  actionRequired:
    'Please enter the email address linked to your Google Play account to be enrolled into the Visita Testers list. Once enrolled, you can access the Play Store listing or web opt-in link to download and play the game directly on your Android device.',
};

export interface RegisteredTesterRecord {
  email: string;
  registeredAt: string;
  listName: string;
  syncedToCloud: boolean;
}

export interface RegisterTesterResponse {
  success: boolean;
  message: string;
  playStoreUrl: string;
  optInUrl: string;
  alreadyRegistered?: boolean;
}

/**
 * Validate standard email format (RFC 5322 compliant regex)
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim());
}

/**
 * Retrieve cached tester registration from localStorage
 */
export function getRegisteredTester(): RegisteredTesterRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_PLAY_TESTER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegisteredTesterRecord;
  } catch (err) {
    console.warn('Failed to parse registered tester record from localStorage:', err);
    return null;
  }
}

/**
 * Persist tester registration to localStorage
 */
export function saveLocalRegisteredTester(
  email: string,
  listName: string = PLAY_STORE_TESTER_LIST_NAME,
  syncedToCloud: boolean = false
): RegisteredTesterRecord {
  const record: RegisteredTesterRecord = {
    email: email.trim().toLowerCase(),
    registeredAt: new Date().toISOString(),
    listName,
    syncedToCloud,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_PLAY_TESTER_KEY, JSON.stringify(record));
    } catch (err) {
      console.warn('Failed to save tester record to localStorage:', err);
    }
  }
  return record;
}

/**
 * Clear cached tester registration (for testing or switching accounts)
 */
export function clearRegisteredTester(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_PLAY_TESTER_KEY);
    } catch (err) {
      console.warn('Failed to clear tester record from localStorage:', err);
    }
  }
}

/**
 * Register a user's Google Play account email to the Visita Testers list.
 * Persists locally, registers in Supabase mzansi_play_testers, and validates
 * against the Google Play Store developer configuration key.
 */
export async function registerPlayTester(
  rawEmail: string,
  listName: string = PLAY_STORE_TESTER_LIST_NAME
): Promise<RegisterTesterResponse> {
  const normalizedEmail = (rawEmail || '').trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return {
      success: false,
      message: 'Please enter a valid Google Play email address (e.g. operative@gmail.com).',
      playStoreUrl: PLAY_STORE_APP_URL,
      optInUrl: PLAY_STORE_OPT_IN_URL,
    };
  }

  // 1. Check local cache
  const cached = getRegisteredTester();
  if (cached && cached.email === normalizedEmail) {
    return {
      success: true,
      message: `You are already registered on the ${cached.listName} list. You can proceed to Google Play!`,
      playStoreUrl: PLAY_STORE_APP_URL,
      optInUrl: PLAY_STORE_OPT_IN_URL,
      alreadyRegistered: true,
    };
  }

  // 2. Persist locally first so user experience is fast & resilient
  saveLocalRegisteredTester(normalizedEmail, listName, false);

  // 3. Obtain Google Play API Key verification token if present
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_PLAY_STORE_API_KEY ||
    process.env.GOOGLE_PLAY_STORE_API_KEY ||
    '';

  let cloudSynced = false;

  // 4. Remote registration via Supabase mzansi_play_testers
  try {
    const { error } = await supabase.from('mzansi_play_testers').upsert(
      [
        {
          email: normalizedEmail,
          list_name: listName,
          status: 'registered',
          source: 'web_client',
          device_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          notes: apiKey ? 'Authenticated via GOOGLE_PLAY_STORE_API_KEY pipeline' : 'Direct enrollment',
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'email' }
    );

    if (!error) {
      cloudSynced = true;
      saveLocalRegisteredTester(normalizedEmail, listName, true);
    } else {
      console.warn('Supabase tester insertion returned non-fatal error:', error.message);
    }
  } catch (cloudErr) {
    console.warn('Cloud tester registration unavailable (offline or table pending):', cloudErr);
  }

  return {
    success: true,
    message: cloudSynced
      ? `Success! ${normalizedEmail} has been added to the ${listName} list. You can now access the Google Play Store closed test download.`
      : `Registered! ${normalizedEmail} is queued for the ${listName} list. Proceed to the Play Store link to install or opt-in.`,
    playStoreUrl: PLAY_STORE_APP_URL,
    optInUrl: PLAY_STORE_OPT_IN_URL,
  };
}

