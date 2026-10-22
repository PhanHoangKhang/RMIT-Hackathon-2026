"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi, useMe, type ApplicationView, type CycleState, type ScoreRow } from "@/lib/client";
import { Page, Gate, Card, Eyebrow, Notice } from "@/components/ui";

// Reviewer queue. Scoring happens on /portfolios/[id]; this page shows what is left to do.
export default function ReviewPage() {
  const { api } = useApi();
  const me = useMe();
  const [state, setState] = useState<CycleState | null>(null);
  const [apps, setApps] = useState<ApplicationView[]>([]);
  const [mine, setMine] = useState<ScoreRow[]>([]);

  useEffect(() => {
    if (!me?.roles.includes("reviewer")) return;
    Promise.all([
      api<CycleState>("/api/cycle"),
      api<{ applications: ApplicationView[] }>("/api/applications"),
      api<{ scores: ScoreRow[] }>("/api/scores"),
    ])
      .then(([s, a, sc]) => {
        setState(s);
        setApps(a.applications);
        setMine(sc.scores.filter((x) => x.mine));
      })
      .catch(() => {});
  }, [me, api]);

  const locked = !!state?.cycle.scoresLockedAt;
  const done = apps.filter((a) => mine.some((s) => s.applicationId === a.id)).length;

  return (
    <Page me={me}>
      <Gate me={me} role="reviewer">
        <Eyebrow>STAGE 1 · BLIND REVIEW</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your review queue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#65766f]">
          You see work and criteria only. {done} of {apps.length} portfolio{apps.length === 1 ? "" : "s"} scored.
        </p>
        {locked && <Notice kind="info">Scores are locked. Nothing can be changed now.</Notice>}

        <div className="mt-8 space-y-4">
          {apps.length === 0 && <Card><p className="text-sm text-[#65766f]">No portfolios submitted yet.</p></Card>}
          {apps.map((a) => {
            const s = mine.find((x) => x.applicationId === a.id);
            return (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4 !p-5">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-widest text-[#9aa69f]">{a.label.toUpperCase()}</p>
                  <p className="mt-1 font-semibold">{a.workSamples[0]?.title}</p>
                  <p className="mt-1 text-sm text-[#75847e]">{s ? `Your total: ${s.total}` : "Not scored yet"}</p>
                </div>
                <Link href={`/portfolios/${a.id}`} className="rounded-lg bg-[#1d6353] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174d41]">
                  {s ? (locked ? "View" : "Update score") : "Score"} →
                </Link>
              </Card>
            );
          })}
        </div>
      </Gate>
    </Page>
  );
}
