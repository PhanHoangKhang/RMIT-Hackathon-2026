"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi, useMe, type ApplicationView, type CycleState, type ScoreRow } from "@/lib/client";
import { Page, roleLinks } from "@/components/ui";

export default function HomePage() {
  const { api } = useApi();
  const me = useMe();
  const [state, setState] = useState<CycleState | null>(null);
  const [apps, setApps] = useState<ApplicationView[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!me) return;
    api<CycleState>("/api/cycle").then(setState).catch((e) => setError(e.message));
    api<{ applications: ApplicationView[] }>("/api/applications").then((r) => setApps(r.applications)).catch((e) => setError(e.message));
    // Only reviewers/admin/panel may read scores; anyone else just sees no status.
    api<{ scores: ScoreRow[] }>("/api/scores").then((r) => setScores(r.scores)).catch(() => setScores([]));
  }, [me, api]);

  const c = state?.cycle;
  const stageLabel = !c ? "…" : c.stage === "reveal" ? "STAGE 2 · REVEAL" : c.scoresLockedAt ? "STAGE 1 · SCORES LOCKED" : "STAGE 1 · BLIND REVIEW";
  const isReviewer = !!me?.roles.includes("reviewer");

  return (
    <Page me={me}>
      {/* Hero */}
      <section className="pb-2 pt-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c25e43]">{stageLabel}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Portfolio reviews</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#65766f] sm:text-base">
            Evaluate each submission against consistent criteria. Candidate identities stay hidden during the
            blind review stage.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4 sm:p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl text-[#1d765b]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#245b47]">
              {c?.stage === "reveal" ? "Reveal stage" : "Blind review stage"}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#60766c]">
              Applicant identity is encrypted in the applicant&apos;s browser. Only the Tide network can release it,
              and only after 2 of the 3 panel members approve the reveal. No admin, server or single reviewer can
              decrypt it alone.
            </p>
          </div>
        </div>

        {/* Role-based workspace links */}
        {me && roleLinks(me.roles).length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#75847e]">Your workspaces:</span>
            {roleLinks(me.roles).map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg border border-[#dce6e0] bg-white px-3 py-2 text-sm font-semibold text-[#1d7059] transition hover:bg-[#eaf5ef]">
                {l.label} →
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Portfolio list */}
      <section className="pb-8 pt-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Submissions</h2>
            <p className="mt-2 text-sm text-[#75847e]">Synthetic portfolios for the hackathon demo</p>
          </div>
          <span className="w-fit rounded-full bg-[#e7efeb] px-3 py-2 text-xs font-medium text-[#386458]">
            {apps.length} portfolio{apps.length === 1 ? "" : "s"}
          </span>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!error && apps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#dce6e0] bg-white p-8 text-center text-sm text-[#65766f]">
            No portfolios yet.
            {me?.roles.includes("applicant") && (
              <> <Link href="/apply" className="font-semibold text-[#1d7059] hover:underline">Submit one →</Link></>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((a) => {
            const mineScored = scores.some((s) => s.applicationId === a.id && s.mine);
            const count = scores.filter((s) => s.applicationId === a.id).length;
            const status = isReviewer ? (mineScored ? "Scored by you" : "Awaiting your score") : `${count} score${count === 1 ? "" : "s"}`;
            const lead = a.workSamples[0];
            return (
              <article key={a.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e1e9e4] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#65766f]">{a.category || "Portfolio"}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#eaf5ef] px-2.5 py-1.5 text-[11px] font-semibold text-[#267256]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                      <rect x="5" y="10" width="14" height="11" rx="2" />
                      <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    Anonymous
                  </span>
                </div>
                <p className="mt-7 text-xs font-medium tracking-widest text-[#9aa69f]">{a.label.toUpperCase()}</p>
                <h3 className="mt-2 text-xl font-semibold leading-snug">{lead?.title ?? a.label}</h3>
                <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[#65766f]">{lead?.description}</p>
                {a.skills.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {a.skills.map((s) => (
                      <span key={s} className="rounded-md border border-[#e4ebe6] bg-[#fafcfb] px-2.5 py-1.5 text-[11px] text-[#587066]">{s}</span>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#edf1ee] pt-5">
                  <span className="inline-flex min-w-0 items-center gap-2 text-xs text-[#74827b]">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${mineScored || (!isReviewer && count > 0) ? "bg-[#278c86]" : "bg-[#d6a14a]"}`} />
                    <span className="truncate">{status}</span>
                  </span>
                  <Link href={`/portfolios/${a.id}`} className="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-[#1d7059] transition hover:bg-[#eaf5ef]">
                    {isReviewer ? "Review" : "Open"} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#89968f]">Demo environment · All portfolio entries are synthetic.</p>
      </section>

      <footer className="border-t border-[#e4ebe7] pt-6">
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-[#89968f] sm:flex-row">
          <span>BlindReview</span>
          <span>Privacy-first portfolio evaluation · Hackathon prototype</span>
        </div>
      </footer>
    </Page>
  );
}
