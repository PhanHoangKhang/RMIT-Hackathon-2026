"use client";

import { useEffect, useState } from "react";
import { encryptForRecord } from "@/lib/tide/relationship";
import { useApi, useMe, Nav, Gate, Notice, IDENTITY_RECORD_ID, tideErrorText, ui, type ApplicationView } from "@/lib/client";

// Synthetic data only. No real names, emails or photos are needed for the demo.
const FIRST = ["Linh", "Arjun", "Maya", "Tomás", "Aiko", "Kwame", "Sofia", "Minh"];
const LAST = ["Tran", "Iyer", "Okafor", "Reyes", "Sato", "Mensah", "Novak", "Pham"];
const UNIS = ["Northbridge Institute of Technology", "Lakeside University", "Southern Coast College", "Meridian School of Design"];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function avatar(name: string): string {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const hue = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="16" fill="hsl(${hue},55%,45%)"/><text x="48" y="60" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function ApplyPage() {
  const { authenticated, isInitializing, login, api } = useApi();
  const me = useMe();
  const [mine, setMine] = useState<ApplicationView | null>(null);
  const [samples, setSamples] = useState([{ title: "", description: "" }]);
  const [identity, setIdentity] = useState({ name: "", email: "", university: "" });
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me?.roles.includes("applicant")) {
      api<{ applications: ApplicationView[] }>("/api/applications").then((r) => setMine(r.applications[0] ?? null));
    }
  }, [me, api]);

  if (isInitializing) return <p>Loading…</p>;
  if (!authenticated) return <button onClick={login} style={ui.btn}>Log in with Tide</button>;

  const fillSample = () => {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");
    setIdentity({ name, email: `${slug}@synthetic.invalid`, university: pick(UNIS) });
    setSamples([
      { title: "Flood-risk map for informal settlements", description: "Open-data pipeline that merges rainfall forecasts with community-reported drainage blockages; field-tested with two neighbourhood groups." },
      { title: "Accessible bus-timetable app", description: "Screen-reader-first timetable with haptic arrival alerts. 1.2k weekly users after a term-long pilot." },
    ]);
  };

  const submit = async () => {
    setBusy(true);
    setStatus({ kind: "info", text: "Fetching the write-only policy…" });
    try {
      const { write } = await api<{ write: string | null }>("/api/policies");
      if (!write) throw new Error("Submissions open once a panel member signs the write policy (Panel page).");
      if (!identity.name.trim() || !identity.email.trim() || !identity.university.trim()) throw new Error("Fill in every identity field.");

      setStatus({ kind: "info", text: "Encrypting identity via the Tide network…" });
      const payload = JSON.stringify({ ...identity, photo: avatar(identity.name) });
      // One item, one tag (the record id). Applicants hold _tide_encryptor via the applicant role and
      // the write policy grants only ["_tide_encryptor"], so they can write but never read this back.
      const identityCiphertext = await encryptForRecord(payload, IDENTITY_RECORD_ID, write);

      setStatus({ kind: "info", text: "Submitting…" });
      await api("/api/applications", { method: "POST", body: JSON.stringify({ workSamples: samples, identityCiphertext }) });
      const r = await api<{ applications: ApplicationView[] }>("/api/applications");
      setMine(r.applications[0] ?? null);
      setStatus({ kind: "ok", text: "Submitted. Your identity left this browser only as ciphertext." });
    } catch (e) {
      setStatus({ kind: "err", text: tideErrorText(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={ui.page}>
      <Nav me={me} />
      <Gate me={me} role="applicant">
        {mine ? (
          <div style={ui.card}>
            <h2 style={ui.h2}>Submitted as {mine.label}</h2>
            {mine.workSamples.map((s, i) => (
              <p key={i}><b>{s.title}</b><br /><span style={{ color: "var(--muted)" }}>{s.description}</span></p>
            ))}
            <div style={ui.label}>Identity, as the server stores it:</div>
            <div style={ui.mono}>{mine.identityCiphertext.slice(0, 160)}…</div>
            <Notice kind="info">Even you cannot decrypt this: the write policy is a drop box (encrypt only).</Notice>
          </div>
        ) : (
          <>
            <div style={ui.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <h2 style={ui.h2}>Work samples <span style={{ color: "var(--muted)", fontWeight: 400 }}>(readable by reviewers)</span></h2>
                <button onClick={fillSample} style={ui.btnGhost}>Fill synthetic sample</button>
              </div>
              {samples.map((s, i) => (
                <div key={i}>
                  <input style={ui.input} placeholder="Title" value={s.title}
                    onChange={(e) => setSamples(samples.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                  <textarea style={{ ...ui.input, minHeight: 70 }} placeholder="What you made and why it matters" value={s.description}
                    onChange={(e) => setSamples(samples.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
                </div>
              ))}
              <button onClick={() => setSamples([...samples, { title: "", description: "" }])} style={ui.btnGhost}>+ Add sample</button>
            </div>
            <div style={ui.card}>
              <h2 style={ui.h2}>Identity <span style={{ color: "var(--muted)", fontWeight: 400 }}>(encrypted in your browser)</span></h2>
              {(["name", "email", "university"] as const).map((k) => (
                <div key={k}>
                  <label style={ui.label}>{k}</label>
                  <input style={ui.input} value={identity[k]} onChange={(e) => setIdentity({ ...identity, [k]: e.target.value })} />
                </div>
              ))}
              {identity.name && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar(identity.name)} alt="" width={56} height={56} style={{ borderRadius: 10 }} />
              )}
              <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Photo: a generated initials avatar (synthetic).</p>
              <button onClick={submit} disabled={busy} style={ui.btn}>{busy ? "Working…" : "Encrypt & submit"}</button>
            </div>
          </>
        )}
        {status && <Notice kind={status.kind}>{status.text}</Notice>}
      </Gate>
    </div>
  );
}
