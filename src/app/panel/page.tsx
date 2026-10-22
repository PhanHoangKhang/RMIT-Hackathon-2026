"use client";

import { useCallback, useEffect, useState } from "react";
import {
  startRelationshipPolicySigning,
  approveRelationshipPolicySigning,
  finishRelationshipPolicySigning,
  type RelationshipSubject,
  type RelationshipAccess,
} from "@/lib/tide/relationship";
import { IdentityReveal } from "@/components/IdentityReveal";
import { useApi, useMe, IDENTITY_RECORD_ID, tideErrorText, b64, type ApplicationView, type CycleState } from "@/lib/client";
import { Page, Gate, Card, Eyebrow, Notice, RoleChips, btn, mono } from "@/components/ui";

interface ChangeRequest {
  id: string;
  entityType: string;
  actionType: string;
  status: string;
  readyToCommit?: boolean;
  threshold?: number;
  authorizationCount?: number;
  authorizers?: unknown[];
  [k: string]: unknown;
}

interface PendingSigning {
  id: string;
  purpose: "write" | "read";
  policyB64: string;
  requestB64: string;
  approvals: number;
  approvedBy: string[];
  createdAt: string;
}

// An enclave step that never answers (window closed, pop-up blocked) would otherwise spin forever.
const ENCLAVE_TIMEOUT_MS = 180_000;
function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `No answer from the Tide enclave after ${ENCLAVE_TIMEOUT_MS / 60000} minutes. If a Tide window is open, finish there; otherwise allow pop-ups for this site and try again.`
            )
          ),
        ENCLAVE_TIMEOUT_MS
      )
    ),
  ]);
}

const POLICIES: { purpose: "write" | "read"; subject: RelationshipSubject; access: RelationshipAccess; what: string }[] = [
  { purpose: "write", subject: { type: "Role", id: "applicant" }, access: "write", what: "Applicants may ENCRYPT identity (drop box, cannot read back)" },
  { purpose: "read", subject: { type: "Role", id: "selection-panel" }, access: "read", what: "selection-panel may DECRYPT identity — inert until the role gains _tide_decryptor" },
];

export default function PanelPage() {
  const tc = useApi();
  const { api, kc } = tc;
  const me = useMe();
  const [state, setState] = useState<CycleState | null>(null);
  const [apps, setApps] = useState<ApplicationView[]>([]);
  const [readPolicy, setReadPolicy] = useState<string | null>(null);
  const [pending, setPending] = useState<ChangeRequest[]>([]);
  const [signings, setSignings] = useState<PendingSigning[]>([]);
  const [adminThreshold, setAdminThreshold] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [s, a, p, crs, sg, ap] = await Promise.all([
      api<CycleState>("/api/cycle"),
      api<{ applications: ApplicationView[] }>("/api/applications"),
      api<{ read: string | null }>("/api/policies"),
      kc("/iga/change-requests?status=PENDING"),
      api<{ pending: PendingSigning[] }>("/api/policies/signing"),
      kc("/iga/role-policies/name/tide-realm-admin"),
    ]);
    setState(s);
    setApps(a.applications);
    setReadPolicy(p.read);
    setPending(Array.isArray(crs.body) ? crs.body : []);
    setSignings(sg.pending);
    setAdminThreshold(typeof ap.body?.threshold === "number" ? ap.body.threshold : null);
  }, [api, kc]);

  useEffect(() => {
    if (me?.roles.includes("panel-member")) load().catch((e) => setMsg({ kind: "err", text: tideErrorText(e) }));
  }, [me, load]);

  const step = async (fn: () => Promise<string>) => {
    setBusy(true);
    try {
      setMsg({ kind: "ok", text: await withTimeout(fn()) });
    } catch (e) {
      setMsg({ kind: "err", text: tideErrorText(e) });
    } finally {
      setBusy(false);
      load().catch(() => {});
    }
  };

  const adminPolicy = async () => {
    const ap = await kc("/iga/role-policies/name/tide-realm-admin");
    const adminPolicyB64 = ap.body?.policy;
    if (!ap.ok || typeof adminPolicyB64 !== "string") throw new Error(`Could not read the admin policy (HTTP ${ap.status}).`);
    return { bytes: b64.from(adminPolicyB64), threshold: typeof ap.body?.threshold === "number" ? (ap.body.threshold as number) : 1 };
  };

  // Last step, once approvals meet the realm admin threshold: the network signs and we store it.
  const finish = async (purpose: "write" | "read", draft: { policyB64: string; requestB64: string; approvals: number }) => {
    const { bytes } = await adminPolicy();
    const signed = await finishRelationshipPolicySigning(draft, bytes);
    await api("/api/policies", { method: "POST", body: JSON.stringify({ purpose, policy: signed }) });
    return `Quorum met (${draft.approvals} approvals). The network signed the ${purpose} policy and it is stored.`;
  };

  // Setup, first panel member: build the identity policy, add your approval in the enclave, then park
  // the request so other panel members can add theirs (the realm admin threshold is 2 of 3).
  const startSigning = (p: (typeof POLICIES)[number]) =>
    step(async () => {
      const { threshold } = await adminPolicy();
      const draft = await startRelationshipPolicySigning({ vendorId: tc.getVendorId(), subject: p.subject, recordId: IDENTITY_RECORD_ID, access: p.access });
      if (draft.approvals >= threshold) return finish(p.purpose, draft);
      await api("/api/policies/signing", {
        method: "POST",
        body: JSON.stringify({ purpose: p.purpose, policy: draft.policyB64, request: draft.requestB64 }),
      });
      return `Your approval is recorded (${draft.approvals}/${threshold}). Another panel member must approve the ${p.purpose} policy.`;
    });

  // Another panel member: add your approval to the parked request, and finish if that meets the threshold.
  const approveSigning = (sg: PendingSigning) =>
    step(async () => {
      const { threshold } = await adminPolicy();
      const next = await approveRelationshipPolicySigning(sg.requestB64);
      await api(`/api/policies/signing/${sg.id}`, { method: "PUT", body: JSON.stringify({ request: next.requestB64 }) });
      if (next.approvals < threshold) return `Approval recorded (${next.approvals}/${threshold}). Waiting for another panel member.`;
      return finish(sg.purpose, { policyB64: sg.policyB64, requestB64: next.requestB64, approvals: next.approvals });
    });

  // Retry only the network signing, if it failed after the quorum was reached.
  const finishSigning = (sg: PendingSigning) => step(() => finish(sg.purpose, sg));

  const discardSigning = (sg: PendingSigning) =>
    step(async () => {
      await api(`/api/policies/signing/${sg.id}`, { method: "DELETE" });
      return `Discarded the pending ${sg.purpose} policy request.`;
    });

  // Stage 2 proposal: ONE governed change — add _tide_decryptor to the selection-panel composite.
  // TideCloak turns it into a PENDING ADD_COMPOSITE change request; nothing changes until 2 of 3 approve.
  const propose = () =>
    step(async () => {
      const role = await kc("/roles/_tide_decryptor");
      if (!role.ok) throw new Error(`Could not read _tide_decryptor (HTTP ${role.status}).`);
      const res = await kc("/roles/selection-panel/composites", { method: "POST", body: JSON.stringify([role.body]) });
      if (!res.ok) throw new Error(`TideCloak refused the proposal: HTTP ${res.status} ${JSON.stringify(res.body)}`);
      return `Proposed (HTTP ${res.status}). A change request is now pending: it needs 2 of 3 panel approvals.`;
    });

  // Approve in Tide MultiAdmin mode: /approve hands back a requestModel, the enclave signs it,
  // and the signed model goes back to the same /approve. TideCloak commits at quorum by itself.
  const approve = (cr: ChangeRequest) =>
    step(async () => {
      const first = await kc(`/iga/change-requests/${cr.id}/approve`, { method: "POST", body: "{}" });
      if (!first.ok) throw new Error(`approve: HTTP ${first.status} ${JSON.stringify(first.body)}`);
      let reply = first.body;
      if (reply?.mode === "needs-approval") {
        const [result] = await tc.approveTideRequests([{ id: reply.changeRequestId ?? cr.id, request: b64.from(reply.requestModel) }]);
        if (!result?.approved) throw new Error(result?.denied ? "You denied it in the enclave." : "Enclave approval did not complete.");
        const second = await kc(`/iga/change-requests/${cr.id}/approve`, {
          method: "POST",
          body: JSON.stringify({ requestModel: b64.to(result.approved.request) }),
        });
        if (!second.ok) throw new Error(`approve (signed): HTTP ${second.status} ${JSON.stringify(second.body)}`);
        reply = second.body;
      }
      const count = reply?.authCount ?? reply?.authorizationCount;
      return reply?.committed
        ? `Approved — quorum met (${count ?? "?"}/${reply?.threshold ?? "?"}) and COMMITTED. Refresh your token below.`
        : `Approval recorded (${count ?? "?"}/${reply?.threshold ?? "?"}). Waiting for another panel member.`;
    });

  const refreshAndAdvance = () =>
    step(async () => {
      await tc.forceRefreshToken();
      await api("/api/cycle/advance", { method: "POST" });
      return "Your new threshold-signed token carries _tide_decryptor. Stage advanced to Reveal.";
    });

  const c = state?.cycle;
  const locked = !!c?.scoresLockedAt;
  const revealCrs = pending.filter((cr) => cr.actionType === "ADD_COMPOSITE" || cr.entityType === "COMPOSITE_ROLE");
  const otherCrs = pending.filter((cr) => !revealCrs.includes(cr));
  const decryptorInToken = tc.hasRealmRole("_tide_decryptor");

  return (
    <Page me={me}>
      <Gate me={me} role="panel-member">
        <Eyebrow>SELECTION PANEL · 2 OF 3 QUORUM</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Panel</h1>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Your token</h2>
          <div className="mt-3"><RoleChips roles={me?.roles ?? []} /></div>
          <p className="mt-3 text-sm text-[#65766f]">
            <code>_tide_decryptor</code> {decryptorInToken ? "is" : "is NOT"} in your current token.
          </p>
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Setup · identity policies <span className="font-normal text-[#75847e]">(RelationshipAttestation:1)</span></h2>
          <p className="mt-1 text-sm text-[#65766f]">
            Each policy needs {adminThreshold ?? "?"} panel approval{adminThreshold === 1 ? "" : "s"} (the realm admin threshold) before the network signs it.
          </p>
          <div className="mt-4 divide-y divide-[#edf1ee]">
            {POLICIES.map((p) => (
              <div key={p.purpose} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm"><b>{p.purpose}</b> · {p.what}</span>
                <PolicyAction
                  signed={!!state?.policies[p.purpose]}
                  signing={signings.find((sg) => sg.purpose === p.purpose)}
                  threshold={adminThreshold}
                  me={me?.username ?? null}
                  busy={busy}
                  onStart={() => startSigning(p)}
                  onApprove={approveSigning}
                  onFinish={finishSigning}
                  onDiscard={discardSigning}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Stage 2 · Reveal <span className="font-normal text-[#75847e]">(needs 2 of 3 panel members)</span></h2>
          <p className="mt-2 text-sm text-[#65766f]">Scores locked: {locked ? `yes (${c?.lockedBy})` : "no"} · stage: {c?.stage ?? "…"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={btn.primary} disabled={busy || !locked || !state?.policies.read || revealCrs.length > 0 || decryptorInToken} onClick={propose}>
              Propose reveal
            </button>
            <button className={btn.primary} disabled={busy || c?.stage === "reveal"} onClick={refreshAndAdvance}>
              Refresh my token &amp; advance stage
            </button>
          </div>
          {!locked && <Notice kind="info">The proposal opens once the admin locks scores (every reviewer has scored every portfolio).</Notice>}

          {revealCrs.map((cr) => (
            <div key={cr.id} className="mt-4 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4">
              <p className="text-sm"><b>{cr.actionType}</b> · add <code>_tide_decryptor</code> to <code>selection-panel</code></p>
              <p className={`mt-1 ${mono}`}>id {cr.id} · approvals {String(cr.authorizationCount ?? cr.authorizers?.length ?? "?")}/{String(cr.threshold ?? "?")}</p>
              <button className={`mt-3 ${btn.primary}`} disabled={busy} onClick={() => approve(cr)}>Approve in enclave</button>
            </div>
          ))}
          {otherCrs.length > 0 && (
            <p className="mt-3 text-xs text-[#89968f]">
              {otherCrs.length} other pending change request(s): {otherCrs.map((cr) => cr.actionType).join(", ")}
            </p>
          )}
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Applicants</h2>
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

function PolicyAction(props: {
  signed: boolean;
  signing: PendingSigning | undefined;
  threshold: number | null;
  me: string | null;
  busy: boolean;
  onStart: () => void;
  onApprove: (sg: PendingSigning) => void;
  onFinish: (sg: PendingSigning) => void;
  onDiscard: (sg: PendingSigning) => void;
}) {
  const { signed, signing: sg, threshold, me, busy } = props;
  if (signed) return <span className="text-sm font-semibold text-[#1d765b]">Signed ✓</span>;
  if (!sg) {
    return (
      <button className={btn.primary} disabled={busy} onClick={props.onStart}>
        Start signing (adds your approval)
      </button>
    );
  }
  const mine = !!me && sg.approvedBy.includes(me);
  const ready = threshold !== null && sg.approvals >= threshold;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`${mono} rounded-lg bg-[#fdf3df] px-2 py-1 text-[#8a6420]`}>
        approvals {sg.approvals}/{threshold ?? "?"} · {sg.approvedBy.join(", ")}
      </span>
      {ready ? (
        <button className={btn.primary} disabled={busy} onClick={() => props.onFinish(sg)}>Finish signing</button>
      ) : mine ? (
        <span className="text-xs text-[#75847e]">Waiting for another panel member</span>
      ) : (
        <button className={btn.primary} disabled={busy} onClick={() => props.onApprove(sg)}>Approve in enclave</button>
      )}
      <button className={btn.ghost} disabled={busy} onClick={() => props.onDiscard(sg)}>Discard</button>
    </div>
  );
}
