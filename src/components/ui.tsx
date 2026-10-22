"use client";

import Link from "next/link";
import { useTideCloak } from "@tidecloak/nextjs";
import type { Me } from "@/lib/client";

// Shared BlindReview chrome in the Tailwind palette of the home page:
// primary #1d6353, ink #193b35, muted #65766f, line #e1e9e4, soft green #eaf5ef, accent #c25e43.

export const btn = {
  primary:
    "rounded-lg bg-[#1d6353] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174d41] disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "rounded-lg bg-[#c25e43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a84d35] disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "rounded-lg border border-[#dce6e0] bg-white px-3 py-2 text-sm font-medium text-[#35584c] transition hover:bg-[#f6f8f7] disabled:cursor-not-allowed disabled:opacity-50",
};

export const field =
  "w-full rounded-xl border border-[#dce6e0] bg-white p-3 text-sm leading-6 outline-none focus:border-[#1d6353] focus:ring-2 focus:ring-[#1d6353]/10";

const ROLE_LINKS: [string, string, string][] = [
  ["applicant", "/apply", "Apply"],
  ["reviewer", "/review", "Review"],
  ["admin", "/admin", "Admin"],
  ["panel-member", "/panel", "Panel"],
];

export function roleLinks(roles: string[] = []) {
  return ROLE_LINKS.filter(([r]) => roles.includes(r)).map(([, href, label]) => ({ href, label }));
}

/** Loading / sign-in states, then header + seat banner + page body. */
export function Page({ me, children }: { me: Me | null; children: React.ReactNode }) {
  const { authenticated, isInitializing, login, logout } = useTideCloak();

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7]">
        <div className="flex items-center gap-3 text-sm text-[#65766f]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#dce7e2] border-t-[#1d6353]" />
          Loading session...
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#dce7e2] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1d6353] text-2xl font-bold text-white">B</div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#193b35]">BlindReview</h1>
          <p className="mt-2 text-sm leading-6 text-[#75847e]">Evaluate the work. Not the identity.</p>
          <button type="button" onClick={() => login()} className={`mt-7 w-full ${btn.primary} py-3`}>
            Sign in with TideCloak
          </button>
          <p className="mt-5 text-xs text-[#89968f]">Privacy-first portfolio evaluation</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#193b35]">
      <header className="sticky top-0 z-20 border-b border-[#e4ebe7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
          <Link href="/" className="flex shrink-0 items-center gap-3 text-lg font-bold tracking-tight sm:text-xl">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d6353] text-xl text-white">B</span>
            BlindReview
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {roleLinks(me?.roles).map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-[#1d7059] transition hover:bg-[#eaf5ef]">
                {l.label}
              </Link>
            ))}
            <span className="hidden max-w-40 truncate px-2 text-sm text-[#65766f] sm:block">{me?.username ?? "…"}</span>
            <button type="button" onClick={() => logout()} className={btn.ghost}>Logout</button>
          </nav>
        </div>
      </header>
      <SeatBanner />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">{children}</div>
    </main>
  );
}

/** Free-tier honesty note, shown on every signed-in page. */
export function SeatBanner() {
  return (
    <div className="border-b border-[#f0dcc4] bg-[#fdf6ec] px-5 py-2 text-center text-xs leading-5 text-[#8a6420]">
      Demo on Tide&apos;s free tier (5 accounts): admin, reviewer and applicant intake share one account
      (ops-admin). In production each role is a separate person. The 3 panel members are separate.
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#e1e9e4] bg-white p-6 shadow-sm sm:p-8 ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">{children}</p>;
}

export function Notice({ kind, children }: { kind: "ok" | "err" | "info"; children: React.ReactNode }) {
  const tone =
    kind === "ok"
      ? "border-[#c8e4d8] bg-[#eaf5ef] text-[#245b47]"
      : kind === "err"
        ? "border-[#f1cfc4] bg-[#fdf1ed] text-[#9a3f27]"
        : "border-[#dce6e0] bg-[#f6f8f7] text-[#35584c]";
  return <div className={`mt-4 break-words rounded-xl border p-4 text-sm leading-6 ${tone}`}>{children}</div>;
}

export function Chip({ children, tide }: { children: React.ReactNode; tide?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tide ? "bg-[#1d6353] text-white" : "bg-[#eaf5ef] text-[#267256]"}`}>
      {children}
    </span>
  );
}

export function RoleChips({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => <Chip key={r} tide={r.startsWith("_tide")}>{r}</Chip>)}
    </div>
  );
}

export function Gate({ me, role, children }: { me: Me | null; role: string; children: React.ReactNode }) {
  if (!me) return <p className="text-sm text-[#65766f]">Loading…</p>;
  if (!me.roles.includes(role)) {
    return <Notice kind="err">This page is for the <b>{role}</b> role. Your token does not carry it.</Notice>;
  }
  return <>{children}</>;
}

export const mono = "font-mono text-xs break-all text-[#75847e]";
