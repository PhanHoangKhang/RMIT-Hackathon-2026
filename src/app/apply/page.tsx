"use client";

import { useCallback, useEffect, useState } from "react";
import { encryptForRecord } from "@/lib/tide/relationship";
import { useApi, useMe, IDENTITY_RECORD_ID, tideErrorText, type ApplicationView } from "@/lib/client";
import { Page, Gate, Card, Eyebrow, Notice, btn, field, mono } from "@/components/ui";

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

function syntheticIdentity() {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  return { name, email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@synthetic.invalid`, university: pick(UNIS) };
}

interface Draft {
  category: string;
  brief: string;
  skills: string;
  samples: { title: string; description: string }[];
}

const EMPTY: Draft = { category: "", brief: "", skills: "", samples: [{ title: "", description: "" }] };

export default function ApplyPage() {
  const { api } = useApi();
  const me = useMe();
  const [mine, setMine] = useState<ApplicationView[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [identity, setIdentity] = useState({ name: "", email: "", university: "" });
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await api<{ applications: ApplicationView[] }>("/api/applications");
    setMine(r.applications);
  }, [api]);

  useEffect(() => {
    if (me?.roles.includes("applicant")) load().catch(() => {});
  }, [me, load]);

  const fillSample = () => {
    setIdentity(syntheticIdentity());
    setDraft({
      category: "Civic Tech",
      brief: "Evaluate how well the work turns open data into something a community can act on.",
      skills: "Data pipelines, Field research, Accessibility",
      samples: [
        { title: "Flood-risk map for informal settlements", description: "Open-data pipeline that merges rainfall forecasts with community-reported drainage blockages; field-tested with two neighbourhood groups." },
        { title: "Accessible bus-timetable app", description: "Screen-reader-first timetable with haptic arrival alerts. 1.2k weekly users after a term-long pilot." },
      ],
    });
  };

  /** Encrypt identity under the write-only policy in this browser, then store ciphertext + work. */
  const submitOne = async (d: Draft, who: { name: string; email: string; university: string }, write: string) => {
    const payload = JSON.stringify({ ...who, photo: avatar(who.name) });
    // One item, one tag (the record id). The applicant role carries _tide_encryptor and the write
    // policy grants only ["_tide_encryptor"]: applicants can write identity but never read it back.
    const identityCiphertext = await encryptForRecord(payload, IDENTITY_RECORD_ID, write);
    await api("/api/applications", {
      method: "POST",
      body: JSON.stringify({
        category: d.category,
        brief: d.brief,
        skills: d.skills.split(",").map((s) => s.trim()).filter(Boolean),
        workSamples: d.samples,
        identityCiphertext,
      }),
    });
  };

  const writePolicy = async () => {
    const { write } = await api<{ write: string | null }>("/api/policies");
    if (!write) throw new Error("Submissions open once a panel member signs the write policy (Panel page).");
    return write;
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (!identity.name.trim() || !identity.email.trim() || !identity.university.trim()) throw new Error("Fill in every identity field.");
      setStatus({ kind: "info", text: "Encrypting identity via the Tide network…" });
      await submitOne(draft, identity, await writePolicy());
      await load();
      setDraft(EMPTY);
      setIdentity({ name: "", email: "", university: "" });
      setStatus({ kind: "ok", text: "Submitted. The identity left this browser only as ciphertext." });
    } catch (e) {
      setStatus({ kind: "err", text: tideErrorText(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page me={me}>
      <Gate me={me} role="applicant">
        <Eyebrow>APPLICANT INTAKE</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Submit a portfolio</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#65766f]">
          Work samples are readable by reviewers. Identity fields are encrypted in this browser under a
          write-only Tide policy, so not even the submitter can read them back.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Work <span className="font-normal text-[#75847e]">(readable by reviewers)</span></h2>
              <button type="button" onClick={fillSample} className={btn.ghost}>Fill synthetic sample</button>
            </div>
            <div className="mt-5 space-y-3">
              <input className={field} placeholder="Category (e.g. Product Design)" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              <textarea className={field} rows={2} placeholder="Brief for reviewers" value={draft.brief} onChange={(e) => setDraft({ ...draft, brief: e.target.value })} />
              <input className={field} placeholder="Skills, comma separated" value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} />
              {draft.samples.map((s, i) => (
                <div key={i} className="space-y-2 rounded-xl bg-[#f6f8f7] p-3">
                  <input className={field} placeholder={`Work sample ${i + 1} title`} value={s.title}
                    onChange={(e) => setDraft({ ...draft, samples: draft.samples.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                  <textarea className={field} rows={3} placeholder="What you made and why it matters" value={s.description}
                    onChange={(e) => setDraft({ ...draft, samples: draft.samples.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} />
                </div>
              ))}
              <button type="button" onClick={() => setDraft({ ...draft, samples: [...draft.samples, { title: "", description: "" }] })} className={btn.ghost}>
                + Add work sample
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Identity <span className="font-normal text-[#75847e]">(encrypted in your browser)</span></h2>
            <div className="mt-5 space-y-3">
              {(["name", "email", "university"] as const).map((k) => (
                <div key={k}>
                  <label className="mb-1 block text-xs font-medium capitalize text-[#75847e]">{k}</label>
                  <input className={field} value={identity[k]} onChange={(e) => setIdentity({ ...identity, [k]: e.target.value })} />
                </div>
              ))}
              {identity.name && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar(identity.name)} alt="" width={56} height={56} className="rounded-xl" />
              )}
              <p className="text-xs text-[#89968f]">Photo: a generated initials avatar (synthetic).</p>
              <button type="button" onClick={submit} disabled={busy} className={btn.primary}>{busy ? "Working…" : "Encrypt & submit"}</button>
            </div>
          </Card>
        </div>

        {status && <Notice kind={status.kind}>{status.text}</Notice>}

        {mine.length > 0 && (
          <Card className="mt-8">
            <h2 className="text-lg font-semibold">Submitted ({mine.length})</h2>
            <div className="mt-4 divide-y divide-[#edf1ee]">
              {mine.map((a) => (
                <div key={a.id} className="py-3">
                  <p className="font-medium">{a.label} · {a.workSamples[0]?.title}</p>
                  <p className={`mt-1 ${mono}`}>identity as stored: {a.identityCiphertext.slice(0, 96)}…</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Gate>
    </Page>
  );
}
