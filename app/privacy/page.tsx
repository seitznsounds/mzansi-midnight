import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy & POPIA Notice // Mzansi Midnight',
  description:
    'Official Privacy Policy and South African POPIA Information Notice for Mzansi Midnight (Web & Android).',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-zinc-200 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* TOP STATUS BAR */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              MZANSI MIDNIGHT // LEGAL DOCKET
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">POPIA (ACT 4 OF 2013)</span>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-mono text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>←</span>
            <span>Return to HQ</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* HERO TITLE SECTION */}
        <section className="space-y-4 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 font-mono text-xs">
            <span>LEGAL CLASSIFICATION</span>
            <span className="text-zinc-500">•</span>
            <span>OFFICIAL INFORMATION NOTICE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy &amp; POPIA Notice
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <div>
              <span className="text-zinc-500">EFFECTIVE DATE:</span>{' '}
              <span className="text-zinc-300">October 31, 2026</span>
            </div>
            <div>
              <span className="text-zinc-500">APPLICATION:</span>{' '}
              <span className="text-zinc-300">Mzansi Midnight (Web PWA &amp; Android)</span>
            </div>
            <div>
              <span className="text-zinc-500">PACKAGE ID:</span>{' '}
              <span className="text-zinc-300">za.co.mzansimidnight.app</span>
            </div>
            <div>
              <span className="text-zinc-500">RESPONSIBLE PARTY:</span>{' '}
              <span className="text-zinc-300">Seitz &amp; Sounds</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            This Privacy Policy explains how <strong>Mzansi Midnight</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) processes, protects, and respects your information when you interact with our South African noir role-playing game across the web, Progressive Web App (PWA), and native Android application. We are committed to transparency and compliance with South Africa&rsquo;s <strong>Protection of Personal Information Act, 2013 (Act No. 4 of 2013) (&ldquo;POPIA&rdquo;)</strong>, the <strong>General Data Protection Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;)</strong>, and Google Play Developer Policies.
          </p>
        </section>

        {/* QUICK SUMMARY BOX */}
        <section className="p-5 rounded-2xl bg-zinc-900/70 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            <span>★</span>
            <span>At a Glance: Our Privacy Commitments</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="flex items-start gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Guest-First &amp; Offline:</strong> Play the entire campaign offline without creating an account or providing personal details.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Zero Advertising or Trackers:</strong> No third-party ad networks, no data brokers, no Google AdSense, and no selling of data.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Optional Cloud Sync:</strong> Google OAuth and Supabase are only used if you explicitly choose to backup saves or rank on leaderboards.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Instant Data Purge:</strong> Delete all local dossiers with one click in Settings; request cloud erasure anytime via email.</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: RESPONSIBLE PARTY & CONTACT */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">01 //</span>
            <span>Responsible Party &amp; Information Officer</span>
          </h2>
          <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
            <p>
              In terms of Section 1 of POPIA, the <strong>Responsible Party</strong> determining the purpose and means of processing personal information is:
            </p>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-1.5 text-zinc-300">
              <div><strong className="text-amber-400">Organization / Developer:</strong> Seitz &amp; Sounds</div>
              <div><strong className="text-amber-400">Country:</strong> Republic of South Africa</div>
              <div><strong className="text-amber-400">Official Contact &amp; Information Desk:</strong> <a href="mailto:seitznsounds@gmail.com" className="text-cyan-400 underline hover:text-cyan-300">seitznsounds@gmail.com</a></div>
              <div><strong className="text-amber-400">Source Repository:</strong> <a href="https://github.com/seitznsounds/mzansi-midnight" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">github.com/seitznsounds/mzansi-midnight</a></div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INFORMATION WE PROCESS */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">02 //</span>
            <span>Information We Process &amp; How It Is Collected</span>
          </h2>

          <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h3 className="text-base font-semibold text-amber-300">A. Local Device Storage (Guest &amp; Offline Play)</h3>
            <p>
              When playing Mzansi Midnight as a guest, all data remains strictly on your device. We use browser <code className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-xs text-amber-300">localStorage</code> and internal device storage to store:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Save dossiers (tactical stats, composure, cash, evidence docket, active story progress, and choices).</li>
              <li>Campaign progression flags (unlocked stories, unlocked endings, keystones).</li>
              <li>Audio and visual preferences (ambient volume, sound effects volume, master mute, dice mode).</li>
              <li>Language preference (any of the 11 official South African languages).</li>
            </ul>
            <p className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <strong>Note:</strong> Local storage is never transmitted to our servers or third parties during guest play.
            </p>

            <h3 className="text-base font-semibold text-amber-300 pt-2">B. Cloud Profiles &amp; Authentication (Optional)</h3>
            <p>
              If you optionally authenticate via <strong>Google Sign-In</strong> to enable cross-device cloud backups or verified leaderboard rankings, the following information is processed via our backend provider, <strong>Supabase</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li><strong>Email Address:</strong> Transmitted via Google OAuth to verify identity and link your save dossiers.</li>
              <li><strong>User Identifier:</strong> A randomly generated UUID assigned by Supabase Auth.</li>
              <li><strong>Operative Callsign:</strong> A public display handle you choose (defaults to &ldquo;Fixer-Operative&rdquo;).</li>
              <li><strong>Avatar URL:</strong> A procedural bot avatar URL (via DiceBear) or your Google profile picture URL.</li>
            </ul>

            <h3 className="text-base font-semibold text-amber-300 pt-2">C. Competitive Leaderboard Records (Public by Design)</h3>
            <p>
              If you submit completed case records to the public high score board, the following non-confidential game statistics are stored in our Supabase database:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Operative Callsign and Avatar URL.</li>
              <li>Score, completion time in seconds (speedrun record), completion cycles, and ending achieved.</li>
              <li>Rank title and earned tactical commendation badges.</li>
            </ul>

            <h3 className="text-base font-semibold text-amber-300 pt-2">D. Hardware Features &amp; Device Permissions</h3>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li><strong>Web Audio API:</strong> Used exclusively for local procedural audio synthesis (rain loops, electrical hum, dice rolls). <em>We never record audio or request microphone permissions.</em></li>
              <li><strong>Haptic Feedback:</strong> Used via Capacitor Haptics on Android to provide subtle vibration feedback during critical game actions.</li>
              <li><strong>Service Worker:</strong> Used via <code className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-xs text-amber-300">sw.js</code> to cache offline assets so the game functions without an active network connection.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 3: PURPOSE & LEGAL BASIS */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">03 //</span>
            <span>Purpose &amp; Legal Basis for Processing (POPIA &amp; GDPR)</span>
          </h2>
          <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
            <p>Under Chapter 3 of POPIA and Article 6 of GDPR, we process personal information under the following legal bases:</p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-cyan-400 font-bold">1. Performance of Agreement:</span> Processing necessary to execute game features you request (cloud saves, progression sync).
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-cyan-400 font-bold">2. Consent:</span> Given when you explicitly choose to sign in with Google OAuth or submit scores to the public leaderboard.
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-cyan-400 font-bold">3. Legitimate Interest:</span> Securing leaderboard integrity against artificial manipulation and ensuring application stability.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: THIRD-PARTY SUB-PROCESSORS */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">04 //</span>
            <span>Third-Party Sub-Processors</span>
          </h2>
          <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
            <p>We work with trusted infrastructure providers that adhere to international security and privacy standards:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-amber-300 font-bold">Supabase Inc.</div>
                <div className="text-zinc-400">Cloud database &amp; authentication provider. SOC 2 Type II certified with TLS 1.3 encryption and Row-Level Security.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-amber-300 font-bold">Google Identity (OAuth 2.0)</div>
                <div className="text-zinc-400">Secure third-party authentication token verification. We never see or store your Google account password.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-amber-300 font-bold">DiceBear</div>
                <div className="text-zinc-400">Open-source avatar SVG generation service using pseudonymous seed parameters.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-amber-300 font-bold">Capacitor (Ionic)</div>
                <div className="text-zinc-400">Native bridge framework for local Android hardware features (Haptics, Splash Screen, Back Button).</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: DATA SUBJECT RIGHTS & DELETION */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">05 //</span>
            <span>Your Rights &amp; How to Delete Your Data</span>
          </h2>

          <div className="text-sm text-zinc-300 space-y-3 leading-relaxed">
            <p>
              Under <strong>Sections 23, 24, and 25 of POPIA</strong> and <strong>Articles 15&ndash;22 of GDPR</strong>, you have full authority over your personal information:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300 font-mono">Right of Access</div>
                <div className="text-zinc-400">You may request confirmation of whether we hold personal information concerning you, free of charge.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300 font-mono">Right to Correction</div>
                <div className="text-zinc-400">You may update your Operative Callsign directly in the User Profile modal at any time.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300 font-mono">Right to Erasure (Local)</div>
                <div className="text-zinc-400">Navigate to <strong>Settings &gt; 04 Dossier Storage Management</strong> and click <strong>[Purge All Saved Dossiers]</strong> to permanently wipe all local save files and cache.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300 font-mono">Right to Erasure (Cloud)</div>
                <div className="text-zinc-400">To delete your cloud profile and leaderboard records, email <a href="mailto:seitznsounds@gmail.com" className="text-cyan-400 underline">seitznsounds@gmail.com</a> with subject &ldquo;POPIA Data Deletion Request&rdquo;. We fulfill requests within 14 business days.</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CHILDREN'S PRIVACY */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">06 //</span>
            <span>Children&rsquo;s Privacy</span>
          </h2>
          <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
            <p>
              Mzansi Midnight is a noir cybernetic crime thriller addressing themes of municipal corruption, political intrigue, and syndicated crime. It is not marketed to or designed for children under 13 years of age (or under 18 without parental consent in South Africa in terms of Section 34 of POPIA).
            </p>
            <p className="text-zinc-400">
              We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information without parental consent, please contact us at <a href="mailto:seitznsounds@gmail.com" className="text-cyan-400 underline">seitznsounds@gmail.com</a> and we will expeditiously remove such data.
            </p>
          </div>
        </section>

        {/* SECTION 7: SECURITY & SAFEGUARDS */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">07 //</span>
            <span>Security Safeguards</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            We implement robust technical and organizational security measures to protect your information against loss, unauthorized access, destruction, or disclosure. All cloud communications are secured via TLS 1.3/HTTPS, and database interactions use Supabase Row-Level Security (RLS) policies ensuring users can only read and write their own authorized records.
          </p>
        </section>

        {/* SECTION 8: LODGING A COMPLAINT */}
        <section className="space-y-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
            <span className="text-amber-400">08 //</span>
            <span>Information Regulator (South Africa)</span>
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            If you are dissatisfied with our handling of your personal information, you have the right to lodge a complaint with the South African Information Regulator:
          </p>
          <div className="font-mono text-zinc-400 space-y-0.5">
            <div><strong>Website:</strong> <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">https://inforegulator.org.za</a></div>
            <div><strong>General Inquiries:</strong> enquiries@inforegulator.org.za</div>
            <div><strong>POPIA Complaints:</strong> POPIAComplaints@inforegulator.org.za</div>
          </div>
        </section>

        {/* FOOTER NAVIGATION */}
        <footer className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-400">
          <div>
            &copy; 2026 Seitz &amp; Sounds. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              ← Return to Game HQ
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

