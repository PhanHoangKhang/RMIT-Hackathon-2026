"use client";

import { useCallback, useEffect, useState } from "react";
import { IdentityReveal } from "@/components/IdentityReveal";
import { useApi, useMe, Nav, Gate, Notice, ui, type ApplicationView, type CycleState } from "@/lib/client";

interface ScoreRow {
  label: string;
  reviewer: string;
  total: number;
}

export default function AdminPage() {
  const { authenticated, isInitializing, login, api, kc } = useApi();
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

  if (isInitializing) return <p>Loading…</p>;
  if (!authenticated) return <button onClick={login} style={ui.btn}>Log in with Tide</button>;

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
    <div style={ui.page}>
      <Nav me={me} />
      <Gate me={me} role="admin">
        {c && state && (
          <div style={ui.card}>
            <h2 style={ui.h2}>{c.name} · stage: {c.stage}</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 0 }}>
              {state.counts.applications} portfolios · {state.counts.reviewers} reviewer(s) · {state.counts.scores} score(s) ·
              all scored: {state.allScoresSubmitted ? "yes" : "no"} · locked: {c.scoresLockedAt ? `yes (${c.lockedBy})` : "no"}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button style={ui.btn} disabled={!!c.scoresLockedAt}
                onClick={() => run(async () => { await api("/api/cycle/lock", { method: "POST" }); return "Scores locked."; })}>
                Lock scores
              </button>
              <button style={ui.btnDanger}
                onClick={() => run(async () => { await api("/api/cycle/advance", { method: "POST" }); return "Stage advanced."; })}>
                Advance to reveal (as admin)
              </button>
              <button style={ui.btnDanger} onClick={forceViaTideCloak}>Force the grant in TideCloak</button>
            </div>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </div>
        )}

        <div style={ui.card}>
          <h2 style={ui.h2}>Scores</h2>
          {scores.length === 0 ? <p style={{ color: "var(--muted)" }}>None yet.</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead><tr><th align="left">Portfolio</th><th align="left">Reviewer</th><th align="right">Total</th></tr></thead>
              <tbody>{scores.map((s, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--line)" }}><td>{s.label}</td><td>{s.reviewer}</td><td align="right">{s.total}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>

        {apps.map((a) => (
          <div key={a.id} style={ui.card}>
            <h2 style={ui.h2}>{a.label}</h2>
            <IdentityReveal ciphertext={a.identityCiphertext} readPolicy={readPolicy} />
          </div>
        ))}
      </Gate>
    </div>
  );
}
