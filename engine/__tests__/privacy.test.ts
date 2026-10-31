import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Privacy Policy & POPIA Statutory Compliance', () => {
  const rootDir = process.cwd();
  const privacyPagePath = path.join(rootDir, 'app', 'privacy', 'page.tsx');
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  it('declares valid Next.js page metadata with POPIA classification', () => {
    expect(privacyContent).toContain("title: 'Privacy Policy & POPIA Notice // Mzansi Midnight'");
    expect(privacyContent).toContain('Official Privacy Policy and South African POPIA Information Notice');
  });

  it('identifies the responsible party and contact details under POPIA Section 1', () => {
    expect(privacyContent).toMatch(/Seitz (&amp;|&) Sounds/);
    expect(privacyContent).toContain('seitznsounds@gmail.com');
    expect(privacyContent).toContain('za.co.mzansimidnight.app');
  });

  it('specifies the Protection of Personal Information Act (Act 4 of 2013) and GDPR', () => {
    expect(privacyContent).toContain('Act No. 4 of 2013');
    expect(privacyContent).toContain('POPIA');
    expect(privacyContent).toContain('GDPR');
  });

  it('distinguishes between offline local storage and cloud sync', () => {
    expect(privacyContent).toContain('localStorage');
    expect(privacyContent).toContain('Supabase');
    expect(privacyContent).toContain('Google Sign-In');
    expect(privacyContent).toContain('Leaderboard');
  });

  it('guarantees zero third-party advertising or trackers', () => {
    expect(privacyContent).toContain('No third-party ad networks');
    expect(privacyContent).toContain('no selling of data');
  });

  it('provides explicit data erasure instructions for local and cloud data', () => {
    expect(privacyContent).toContain('Purge All Saved Dossiers');
    expect(privacyContent).toContain('POPIA Data Deletion Request');
  });

  it('lists South African Information Regulator contact details for statutory appeals', () => {
    expect(privacyContent).toContain('inforegulator.org.za');
    expect(privacyContent).toContain('POPIAComplaints@inforegulator.org.za');
  });

  it('is linked directly from key user interface components', () => {
    const titleScreen = fs.readFileSync(path.join(rootDir, 'components', 'TitleIntroScreen.tsx'), 'utf8');
    const settingsModal = fs.readFileSync(path.join(rootDir, 'components', 'SettingsModal.tsx'), 'utf8');
    const userProfileModal = fs.readFileSync(path.join(rootDir, 'components', 'UserProfileModal.tsx'), 'utf8');

    expect(titleScreen).toContain('href="/privacy"');
    expect(settingsModal).toContain('href="/privacy"');
    expect(userProfileModal).toContain('href="/privacy"');
  });
});
