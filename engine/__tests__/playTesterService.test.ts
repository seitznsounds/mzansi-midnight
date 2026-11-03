import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isValidEmail,
  getRegisteredTester,
  saveLocalRegisteredTester,
  clearRegisteredTester,
  registerPlayTester,
  PLAY_STORE_APP_URL,
  PLAY_STORE_OPT_IN_URL,
  PLAY_STORE_PACKAGE_ID,
  PLAY_STORE_TESTER_LIST_NAME,
  GOOGLE_GROUP_WEB_URL,
  GOOGLE_GROUP_EMAIL,
  GOOGLE_GROUP_SUBSCRIBE_MAILTO,
  GOOGLE_PLAY_REQUIREMENT_NOTICE,
  LOCAL_PLAY_TESTER_KEY,
} from '../testerService';

describe('Google Play Tester Service & Visita Testers Management', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    const mockStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
    };
    vi.stubGlobal('window', {
      localStorage: mockStorage,
    });
    vi.stubGlobal('localStorage', mockStorage);
    vi.clearAllMocks();
  });

  describe('Configuration & Google Play Policy Notice', () => {
    it('targets the canonical package ID and Google Play Store URL', () => {
      expect(PLAY_STORE_PACKAGE_ID).toBe('za.co.mzansimidnight.app');
      expect(PLAY_STORE_APP_URL).toBe(
        'https://play.google.com/store/apps/details?id=za.co.mzansimidnight.app&hl=en'
      );
      expect(PLAY_STORE_OPT_IN_URL).toBe(
        'https://play.google.com/apps/testing/za.co.mzansimidnight.app'
      );
      expect(PLAY_STORE_TESTER_LIST_NAME).toBe('Visita Testers');
      expect(GOOGLE_GROUP_WEB_URL).toBe(
        'https://groups.google.com/g/visita-app-testers'
      );
      expect(GOOGLE_GROUP_EMAIL).toBe('visita-app-testers@googlegroups.com');
      expect(GOOGLE_GROUP_SUBSCRIBE_MAILTO).toContain(
        'visita-app-testers+subscribe@googlegroups.com'
      );
    });

    it('contains explicit stipulations for Google Play closed testing requirements', () => {
      expect(GOOGLE_PLAY_REQUIREMENT_NOTICE.fullDescription).toContain('closed testing');
      expect(GOOGLE_PLAY_REQUIREMENT_NOTICE.fullDescription).toContain('14 continuous days');
      expect(GOOGLE_PLAY_REQUIREMENT_NOTICE.warning).toContain('Item not found');
      expect(GOOGLE_PLAY_REQUIREMENT_NOTICE.actionRequired).toContain('Visita Testers');
    });
  });

  describe('Email Format Validation', () => {
    it('accepts valid RFC 5322 email patterns', () => {
      expect(isValidEmail('operative@gmail.com')).toBe(true);
      expect(isValidEmail('fixer.agent+playtest@domain.co.za')).toBe(true);
      expect(isValidEmail('visita_tester_99@sub.domain.org')).toBe(true);
    });

    it('rejects invalid or blank email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('missingatsign.com')).toBe(false);
      expect(isValidEmail('missingdot@domain')).toBe(false);
    });
  });

  describe('Local Storage Persistence', () => {
    it('saves and retrieves registered tester record', () => {
      expect(getRegisteredTester()).toBeNull();

      const record = saveLocalRegisteredTester('hawk_agent@mzansi.co.za', 'Visita Testers', true);
      expect(record.email).toBe('hawk_agent@mzansi.co.za');
      expect(record.listName).toBe('Visita Testers');
      expect(record.syncedToCloud).toBe(true);

      const loaded = getRegisteredTester();
      expect(loaded).not.toBeNull();
      expect(loaded?.email).toBe('hawk_agent@mzansi.co.za');
      expect(loaded?.listName).toBe('Visita Testers');
    });

    it('clears tester registration on demand', () => {
      saveLocalRegisteredTester('test@domain.com');
      expect(getRegisteredTester()).not.toBeNull();

      clearRegisteredTester();
      expect(getRegisteredTester()).toBeNull();
      expect(localStorage.getItem(LOCAL_PLAY_TESTER_KEY)).toBeNull();
    });
  });

  describe('registerPlayTester Workflow', () => {
    it('rejects invalid email submission with actionable error message', async () => {
      const res = await registerPlayTester('not-an-email');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Please enter a valid Google Play email address');
      expect(getRegisteredTester()).toBeNull();
    });

    it('successfully enrolls a new tester into Visita Testers list', async () => {
      const email = 'new_tester@gmail.com';
      const res = await registerPlayTester(email);

      expect(res.success).toBe(true);
      expect(res.playStoreUrl).toBe(PLAY_STORE_APP_URL);
      expect(res.optInUrl).toBe(PLAY_STORE_OPT_IN_URL);
      expect(res.message).toContain('Visita Testers');

      const cached = getRegisteredTester();
      expect(cached).not.toBeNull();
      expect(cached?.email).toBe('new_tester@gmail.com');
      expect(cached?.listName).toBe('Visita Testers');
    });

    it('returns alreadyRegistered status on subsequent submission of same email', async () => {
      const email = 'existing_operative@gmail.com';
      await registerPlayTester(email);

      const secondAttempt = await registerPlayTester(email);
      expect(secondAttempt.success).toBe(true);
      expect(secondAttempt.alreadyRegistered).toBe(true);
      expect(secondAttempt.message).toContain('already registered');
    });
  });
});
