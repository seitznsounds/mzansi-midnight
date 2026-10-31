import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-mono text-center">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">404 // CLASSIFIED SECTOR</h1>
      <p className="text-zinc-400 mb-6 text-sm max-w-md">
        The requested tactical frequency or docket does not exist. Transmission dropped.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs tracking-wider uppercase transition-colors"
      >
        Return to HQ
      </Link>
    </div>
  );
}
