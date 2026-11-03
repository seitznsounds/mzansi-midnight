'use client';

import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/settings';
import { t } from '../engine/i18n';
import { soundscape } from '../engine/soundscape';
import {
  PLAY_STORE_APP_URL,
  PLAY_STORE_OPT_IN_URL,
  PLAY_STORE_PACKAGE_ID,
  PLAY_STORE_TESTER_LIST_NAME,
  GOOGLE_PLAY_REQUIREMENT_NOTICE,
  getRegisteredTester,
  registerPlayTester,
  clearRegisteredTester,
  RegisteredTesterRecord,
} from '../engine/testerService';

interface GooglePlayTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  lang?: SupportedLanguage;
}

export const GooglePlayTesterModal: React.FC<GooglePlayTesterModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  lang = 'en',
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [registeredRecord, setRegisteredRecord] = useState<RegisteredTesterRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showDirectLinksAnyway, setShowDirectLinksAnyway] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const cached = getRegisteredTester();
    setRegisteredRecord(cached);

    if (cached) {
      setEmailInput(cached.email);
    } else if (defaultEmail) {
      setEmailInput(defaultEmail);
    }

    setFeedback({ type: null, message: '' });
    setShowDirectLinksAnyway(false);
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playDieSelect();

    if (!emailInput.trim()) {
      setFeedback({
        type: 'error',
        message: t(
          'playstore.error_empty',
          'Please enter the email address used for your Google Play Store account.',
          lang
        ),
      });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: null, message: '' });

    try {
      const res = await registerPlayTester(emailInput, PLAY_STORE_TESTER_LIST_NAME);

      if (res.success) {
        soundscape.playOutcome('clean');
        const updated = getRegisteredTester();
        setRegisteredRecord(updated);
        setFeedback({
          type: 'success',
          message: res.message,
        });
      } else {
        soundscape.playOutcome('failure');
        setFeedback({
          type: 'error',
          message: res.message,
        });
      }
    } catch (err: any) {
      soundscape.playOutcome('failure');
      setFeedback({
        type: 'error',
        message: err?.message || 'Network error enrolling tester.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRegistration = () => {
    soundscape.playDieSelect();
    clearRegisteredTester();
    setRegisteredRecord(null);
    setFeedback({
      type: 'info',
      message: 'Registration reset. You can now enroll a different email address.',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-sans"
      onClick={() => {
        soundscape.playDieSelect();
        onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-[92dvh] flex flex-col rounded-2xl border-2 border-emerald-500/60 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 uppercase tracking-widest font-bold">
              ANDROID DOWNLOAD // GOOGLE PLAY STORE
            </span>
          </div>
          <button
            onClick={() => {
              soundscape.playDieSelect();
              onClose();
            }}
            className="text-zinc-400 hover:text-white uppercase cursor-pointer"
          >
            [Close ✕]
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs text-zinc-300">
          {/* BANNER WITH GOOGLE PLAY BADGE */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-cyan-950/40 border border-emerald-500/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center shrink-0 text-2xl shadow-md">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 fill-emerald-400"
                aria-label="Google Play"
              >
                <path d="M3.609 1.814L13.793 12 3.61 22.186c-.365-.32-.61-.83-.61-1.442V3.256c0-.612.245-1.122.61-1.442zm11.235 11.236l2.36 2.36-12.062 6.892 9.702-9.252zm0-2.099L5.143 1.701l12.06 6.892-2.359 2.358zm1.096 1.05l4.675 2.671c.85.486.85 1.282 0 1.768l-4.675 2.67-2.09-2.09 2.09-2.019z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                Native Standalone Android Build
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Mzansi Midnight: The Sovereign Quintet
              </h2>
              <div className="text-[11px] font-mono text-zinc-400">
                Package: <code className="text-emerald-300">{PLAY_STORE_PACKAGE_ID}</code>
              </div>
            </div>
          </div>

          {/* CRUCIAL GOOGLE POLICY NOTICE */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-2 font-sans">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              <span>⚠️</span>
              <span>{t('playstore.google_req_tag', 'MANDATORY GOOGLE PLAY REQUIREMENT', lang)}</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              <strong>Google strictly requires</strong> all new applications to complete an extensive closed testing phase (minimum 20 testers opted in for at least 14 continuous days) before Google permits a general production release on the public Play Store.
            </p>
            <div className="p-2.5 rounded-lg bg-black/50 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300">Important:</strong> If you open the Play Store URL without your email on the authorized testers list, Google Play will display an <em>&ldquo;Item not found&rdquo;</em> error.
            </div>
          </div>

          {/* REGISTRATION FORM OR CONFIRMATION */}
          {registeredRecord ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/50 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                  <span>✓</span>
                  <span>ENROLLED ON {registeredRecord.listName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetRegistration}
                  className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div className="text-sm text-white font-sans bg-black/60 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                <span className="truncate">{registeredRecord.email}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Authorized Tester
                </span>
              </div>

              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                Your email has been enrolled into the <strong>{PLAY_STORE_TESTER_LIST_NAME}</strong> track. You can now access the Google Play listing or opt-in via web:
              </p>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={PLAY_STORE_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                >
                  <span>▶</span>
                  <span>Open in Google Play</span>
                  <span className="text-xs">↗</span>
                </a>

                <a
                  href={PLAY_STORE_OPT_IN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/50 uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>🌐</span>
                  <span>Web Testing Opt-In</span>
                  <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-zinc-300 font-semibold">
                  Enter Your Google Play Account Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="operative@gmail.com"
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
                  >
                    {isLoading ? 'Enrolling...' : 'Join Testers'}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">
                  * Must be the email address you use on Google Play on your Android device.
                </p>
              </div>

              {/* FEEDBACK BANNER */}
              {feedback.message && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed font-mono ${
                    feedback.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : feedback.type === 'error'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {/* DIRECT LINK BYPASS TOGGLE */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Already an authorized tester?</span>
                <button
                  type="button"
                  onClick={() => setShowDirectLinksAnyway(!showDirectLinksAnyway)}
                  className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  {showDirectLinksAnyway ? 'Hide Direct Links' : 'Show Direct Links →'}
                </button>
              </div>

              {showDirectLinksAnyway && (
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 space-y-2 animate-in fade-in duration-150">
                  <div className="text-[10px] font-mono text-zinc-400">
                    If you are already enrolled in the Visita Testers list, you can open the URLs directly:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={PLAY_STORE_APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 text-[11px] font-mono flex items-center gap-1.5"
                    >
                      <span>Play Store App Link</span>
                      <span>↗</span>
                    </a>
                    <a
                      href={PLAY_STORE_OPT_IN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 text-[11px] font-mono flex items-center gap-1.5"
                    >
                      <span>Web Testing Opt-In</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* 3 VALUE HIGHLIGHTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px]">
              <div className="text-emerald-400 font-mono font-bold">100% Offline</div>
              <div className="text-zinc-400 mt-0.5 leading-tight">
                Entire game runs locally on your phone with zero network dependency.
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px]">
              <div className="text-cyan-400 font-mono font-bold">Hardware Haptics</div>
              <div className="text-zinc-400 mt-0.5 leading-tight">
                Vibration feedback on dice rolls, alarms, and tension spikes.
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px]">
              <div className="text-amber-400 font-mono font-bold">POPIA Compliant</div>
              <div className="text-zinc-400 mt-0.5 leading-tight">
                Your email is solely used for Google Play tester access. Zero spam.
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <span className="text-zinc-500">Track: Visita Testers</span>
          <button
            onClick={() => {
              soundscape.playDieSelect();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white cursor-pointer font-semibold uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
