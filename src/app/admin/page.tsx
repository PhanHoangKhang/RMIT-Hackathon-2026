"use client";

import { useCallback, useEffect, useState } from "react";
import { IdentityReveal } from "@/components/IdentityReveal";
import { useApi, useMe, type ApplicationView, type CycleState, type ScoreRow } from "@/lib/client";
import { Page, Gate, Card, Eyebrow, Notice, btn } from "@/components/ui";

export default function AdminPage() {
  const { api, kc } = useApi();
  const me = useMe();
  const [state, setState] = useState<CycleState | null>(null);
  const [apps, setApps] = useState<ApplicationView[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [readPolicy, setReadPolicy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);

  const load = useCallback(async () => {
    const [s, a, sc, p] = await Promise.all([
      api<CycleState>("/api/cycle"),
      api<{ applications: ApplicationView[] }>("/api/applications"),
      api<{ scores: ScoreRow[] }>("/api/scores"),
      api<{ read: string | null }>("/api/policies"),
    ]);
    setState(s);
    setApps(a.applications);
    setScores(sc.scores);
    setReadPolicy(p.read);
  }, [api]);

  useEffect(() => {
    if (me?.roles.includes("admin")) load().catch(() => {});
  }, [me, load]);

  const run = async (fn: () => Promise<string>) => {
    try {
      setMsg({ kind: "ok", text: await fn() });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    }
    load().catch(() => {});
  };

  // Go around our app entirely and ask TideCloak to add _tide_decryptor to selection-panel.
  // ops-admin is not a tide-realm-admin, so TideCloak itself refuses (403) — no change request exists.
  const forceViaTideCloak = () =>
    run(async () => {
      const role = await kc("/roles/_tide_decryptor");
      const res = await kc("/roles/selection-panel/composites", {
        method: "POST",
        body: JSON.stringify(role.ok ? [role.body] : [{ name: "_tide_decryptor" }]),
      });
      if (res.ok) return `Unexpected: TideCloak answered ${res.status}. Check that ops-admin holds no realm-management roles.`;
      throw new Error(`TideCloak refused the direct grant: HTTP ${res.status}. ops-admin is not one of the realm admins whose quorum governs this role.`);
    });

  const c = state?.cycle;
  return (
    <Page me={me}>
      <Gate me={me} role="admin">
        <Eyebrow>ADMIN</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{c?.name ?? "Cycle"}</h1>

        {c && state && (
          <Card className="mt-6">
            <div className="grid gap-4 text-sm sm:grid-cols-4">
              {[
                ["Stage", c.stage === "reveal" ? "Reveal" : "Blind review"],
                ["Portfolios", state.counts.applications],
                ["All scored", state.allScoresSubmitted ? "Yes" : "No"],
                ["Scores locked", c.scoresLockedAt ? `Yes (${c.lockedBy})` : "No"],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-xl bg-[#f6f8f7] p-4">
                  <p className="text-xs text-[#75847e]">{k}</p>
                  <p className="mt-1 font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className={btn.primary} disabled={!!c.scoresLockedAt}
                onClick={() => run(async () => { await api("/api/cycle/lock", { method: "POST" }); return "Scores locked."; })}>
                Lock scores
              </button>
              <button className={btn.danger}
                onClick={() => run(async () => { await api("/api/cycle/advance", { method: "POST" }); return "Stage advanced."; })}>
                Advance to reveal (as admin)
              </button>
              <button className={btn.danger} onClick={forceViaTideCloak}>Force the grant in TideCloak</button>
            </div>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </Card>
        )}

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Scores</h2>
          {scores.length === 0 ? (
            <p className="mt-3 text-sm text-[#65766f]">None yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-[#75847e]">
                  <tr><th className="py-2 pr-4 font-medium">Portfolio</th><th className="py-2 pr-4 font-medium">Reviewer</th><th className="py-2 text-right font-medium">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ee]">
                  {scores.map((s, i) => (
                    <tr key={i}><td className="py-2 pr-4">{s.label}</td><td className="py-2 pr-4">{s.reviewer}</td><td className="py-2 text-right font-semibold">{s.total}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Applicant identities</h2>
          <p className="mt-1 text-sm text-[#65766f]">Same button for every role. The Tide network decides.</p>
          <div className="mt-4 divide-y divide-[#edf1ee]">
            {apps.map((a) => (
              <div key={a.id} className="py-4">
                <p className="mb-2 font-medium">{a.label}</p>
                <IdentityReveal ciphertext={a.identityCiphertext} readPolicy={readPolicy} />
              </div>
            ))}
          </div>
        </Card>
      </Gate>
    </Page>
  );
}
