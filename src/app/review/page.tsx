"use client";

import { useCallback, useEffect, useState } from "react";
import { IdentityReveal } from "@/components/IdentityReveal";
import { useApi, useMe, Nav, Gate, Notice, ui, type ApplicationView, type CycleState } from "@/lib/client";

interface MyScore {
  applicationId: string;
  scores: Record<string, number>;
  comment: string;
}

export default function ReviewPage() {
  const { authenticated, isInitializing, login, api } = useApi();
  const me = useMe();
  const [state, setState] = useState<CycleState | null>(null);
  const [apps, setApps] = useState<ApplicationView[]>([]);
  const [mine, setMine] = useState<Record<string, MyScore>>({});
  const [readPolicy, setReadPolicy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, a, sc, p] = await Promise.all([
      api<CycleState>("/api/cycle"),
      api<{ applications: ApplicationView[] }>("/api/applications"),
      api<{ scores: MyScore[] }>("/api/scores"),
      api<{ read: string | null }>("/api/policies"),
    ]);
    setState(s);
    setApps(a.applications);
    setMine(Object.fromEntries(sc.scores.map((x) => [x.applicationId, x])));
    setReadPolicy(p.read);
  }, [api]);

  useEffect(() => {
    if (me?.roles.includes("reviewer")) load().catch(() => {});
  }, [me, load]);

  if (isInitializing) return <p>Loading…</p>;
  if (!authenticated) return <button onClick={login} style={ui.btn}>Log in with Tide</button>;

  const locked = !!state?.cycle.scoresLockedAt;
  return (
    <div style={ui.page}>
      <Nav me={me} />
      <Gate me={me} role="reviewer">
        <Notice kind="info">
          Stage 1 · Blind review. You see work and criteria only.
          {locked && <b> Scores are locked.</b>}
        </Notice>
        {apps.length === 0 && <p style={{ color: "var(--muted)" }}>No portfolios submitted yet.</p>}
        {apps.map((a) => (
          <div key={a.id} style={ui.card}>
            <h2 style={ui.h2}>{a.label}</h2>
            {a.workSamples.map((s, i) => (
              <p key={i} style={{ margin: "0 0 0.6rem" }}>
                <b>{s.title}</b><br /><span style={{ color: "var(--muted)" }}>{s.description}</span>
              </p>
            ))}
            {state && (
              <ScoreForm
                criteria={state.cycle.criteria}
                existing={mine[a.id]}
                locked={locked}
                onSave={async (scores, comment) => {
                  await api("/api/scores", { method: "POST", body: JSON.stringify({ applicationId: a.id, scores, comment }) });
                  await load();
                }}
              />
            )}
            <div style={{ marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px dashed var(--line)" }}>
              <IdentityReveal ciphertext={a.identityCiphertext} readPolicy={readPolicy} />
            </div>
          </div>
        ))}
      </Gate>
    </div>
  );
}

function ScoreForm({ criteria, existing, locked, onSave }: {
  criteria: CycleState["cycle"]["criteria"];
  existing?: MyScore;
  locked: boolean;
  onSave: (scores: Record<string, number>, comment: string) => Promise<void>;
}) {
  const [scores, setScores] = useState<Record<string, number>>(existing?.scores ?? {});
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {criteria.map((c) => (
          <label key={c.id} style={{ fontSize: "0.88rem" }}>
            {c.label}{" "}
            <select disabled={locked} value={scores[c.id] ?? ""} onChange={(e) => setScores({ ...scores, [c.id]: Number(e.target.value) })}
              style={{ ...ui.input, width: "auto", marginBottom: 0, padding: "0.3rem" }}>
              <option value="">–</option>
              {Array.from({ length: c.max }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        ))}
      </div>
      <textarea disabled={locked} style={{ ...ui.input, marginTop: "0.6rem", minHeight: 50 }} placeholder="Comment (optional)"
        value={comment} onChange={(e) => setComment(e.target.value)} />
      <button disabled={locked} style={ui.btn} onClick={async () => {
        try {
          await onSave(scores, comment);
          setMsg({ kind: "ok", text: "Score saved." });
        } catch (e) {
          setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
        }
      }}>{existing ? "Update score" : "Submit score"}</button>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    </div>
  );
}
