"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTideCloak } from "@tidecloak/nextjs";

interface PortfolioSummary {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  role: string;
  duration: string;
  projectType: string;
  skills: string[];
  status: string;
  reviewCount?: number;
  reviewedByMe?: boolean;
  canViewResults?: boolean;
}

export default function HomePage() {
  const { authenticated, login, logout, getValueFromIdToken, isInitializing, token, secureFetch } =
    useTideCloak();
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPortfolios = useCallback(async () => {
    if (!authenticated || !token) return;
    setLoading(true);
    setError("");
    try {
      const url = new URL("/api/portfolios", window.location.origin);
      const response = await secureFetch(url, { cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `Could not load portfolios (${response.status}).`);
      if (!Array.isArray(result?.data)) throw new Error("The portfolio API returned an invalid response.");
      setPortfolios(result.data as PortfolioSummary[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load portfolios.");
    } finally {
      setLoading(false);
    }
  }, [authenticated, token, secureFetch]);

  useEffect(() => {
    if (isInitializing) return;
    if (!authenticated || !token) {
      setLoading(false);
      return;
    }
    void fetchPortfolios();
  }, [isInitializing, authenticated, token, fetchPortfolios]);

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
          <button type="button" onClick={() => login()} className="mt-7 w-full rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174d41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6353]">
            Sign in with TideCloak
          </button>
          <p className="mt-5 text-xs text-[#89968f]">Privacy-first portfolio evaluation</p>
        </div>
      </main>
    );
  }

  const username = getValueFromIdToken("preferred_username");

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#193b35]">
      <header className="sticky top-0 z-20 border-b border-[#e4ebe7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex shrink-0 items-center gap-3 text-lg font-bold tracking-tight text-[#193b35] sm:text-xl">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d6353] text-xl text-white">B</span>
            BlindReview
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-[#89968f]">Signed in as</p>
              <p className="max-w-40 truncate text-sm font-medium text-[#35584c]">{username || "Reviewer"}</p>
            </div>
            <button type="button" onClick={() => logout()} className="rounded-lg border border-[#dce6e0] bg-white px-3 py-2 text-sm font-medium text-[#35584c] transition hover:bg-[#f6f8f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6353] sm:px-4">Logout</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-16 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c25e43]">BLIND REVIEW · ROUND 1</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#193b35] sm:text-5xl lg:text-6xl">Portfolio reviews</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#65766f] sm:text-base">
            Explore each case study, understand the problem and design decisions, then evaluate the work against consistent criteria. Candidate identities remain separate from the portfolio content.
          </p>
        </div>
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4 sm:p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl text-[#1d765b]" aria-hidden="true">✓</div>
          <div>
            <p className="text-sm font-semibold text-[#245b47]">Blind review stage</p>
            <p className="mt-1 text-sm leading-6 text-[#60766c]">
              Portfolio entries are synthetic demo case studies. Review the evidence and design rationale; do not assume proposed metrics are real outcomes. This interface alone does not enforce a separate identity-access workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Submissions</h2>
            <p className="mt-2 text-sm text-[#75847e]">Case studies with context, process, solution, and evaluation criteria</p>
          </div>
          <span className="w-fit rounded-full bg-[#e7efeb] px-3 py-2 text-xs font-medium text-[#386458]">{portfolios.length} portfolios</span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#e1e9e4] bg-white p-8 text-sm text-[#65766f]">Loading portfolios...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <p role="alert" className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void fetchPortfolios()} className="mt-4 rounded-lg bg-[#1d6353] px-4 py-2 text-sm font-semibold text-white">Try again</button>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="rounded-2xl border border-[#e1e9e4] bg-white p-8 text-sm text-[#65766f]">No portfolio submissions found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {portfolios.map((portfolio) => (
              <article key={portfolio.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e1e9e4] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#65766f]">{portfolio.category}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#eaf5ef] px-2.5 py-1.5 text-[11px] font-semibold text-[#267256]">⌑ Anonymous</span>
                </div>
                <p className="mt-7 text-xs font-medium tracking-widest text-[#9aa69f]">{portfolio.id}</p>
                <h3 className="mt-2 text-xl font-semibold leading-snug">{portfolio.title}</h3>
                <p className="mt-2 text-sm font-medium text-[#35584c]">{portfolio.subtitle}</p>
                <p className="mt-3 text-sm leading-6 text-[#65766f]">{portfolio.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f6f8f7] p-3">
                  <div><p className="text-[11px] uppercase tracking-wide text-[#89968f]">Role</p><p className="mt-1 text-xs font-semibold">{portfolio.role}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wide text-[#89968f]">Duration</p><p className="mt-1 text-xs font-semibold">{portfolio.duration}</p></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {portfolio.skills.slice(0, 5).map((skill) => <span key={skill} className="rounded-md border border-[#e4ebe6] bg-[#fafcfb] px-2.5 py-1.5 text-[11px] text-[#587066]">{skill}</span>)}
                  {portfolio.skills.length > 5 && <span className="rounded-md bg-[#f4f5f4] px-2.5 py-1.5 text-[11px] text-[#587066]">+{portfolio.skills.length - 5} more</span>}
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-[#edf1ee] pt-5">
                  <span className="inline-flex items-center gap-2 text-xs text-[#74827b]"><span className={`h-2 w-2 shrink-0 rounded-full ${portfolio.reviewCount ? "bg-[#278c86]" : "bg-[#d6a14a]"}`} /><span className="whitespace-nowrap">{portfolio.status}</span>{portfolio.reviewedByMe && <span className="whitespace-nowrap rounded-full bg-[#eaf5ef] px-2 py-0.5 text-[11px] font-semibold text-[#267256]">You reviewed</span>}</span>
                  <div className="ml-auto flex items-center gap-1">
                    {portfolio.canViewResults && <Link href={`/results/${portfolio.id}`} className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-semibold text-[#65766f] hover:bg-[#f6f8f7]">Results</Link>}
                    <Link href={`/portfolios/${portfolio.id}`} className="whitespace-nowrap rounded-lg bg-[#1d6353] px-3 py-2 text-sm font-semibold text-white hover:bg-[#174d41]">Read case study →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="mt-6 text-center text-xs leading-5 text-[#89968f]">Demo environment · All portfolio entries and scenarios are synthetic.</p>
      </section>

      <footer className="border-t border-[#e4ebe7] bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-[#89968f] sm:flex-row">
          <span>BlindReview</span><span>Privacy-first portfolio evaluation · Hackathon prototype</span>
        </div>
      </footer>
    </main>
  );
}
