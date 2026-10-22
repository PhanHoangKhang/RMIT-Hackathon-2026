"use client";

import { useCallback, useEffect, useState } from "react";
import { signRelationshipPolicy, type RelationshipSubject, type RelationshipAccess } from "@/lib/tide/relationship";
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
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [s, a, p, crs] = await Promise.all([
      api<CycleState>("/api/cycle"),
      api<{ applications: ApplicationView[] }>("/api/applications"),
      api<{ read: string | null }>("/api/policies"),
      kc("/iga/change-requests?status=PENDING"),
    ]);
    setState(s);
    setApps(a.applications);
    setReadPolicy(p.read);
    setPending(Array.isArray(crs.body) ? crs.body : []);
  }, [api, kc]);

  useEffect(() => {
    if (me?.roles.includes("panel-member")) load().catch((e) => setMsg({ kind: "err", text: tideErrorText(e) }));
  }, [me, load]);

  const step = async (fn: () => Promise<string>) => {
    setBusy(true);
    try {
      setMsg({ kind: "ok", text: await fn() });
    } catch (e) {
      setMsg({ kind: "err", text: tideErrorText(e) });
    } finally {
      setBusy(false);
      load().catch(() => {});
    }
  };

  // Setup: sign one identity policy in the enclave. Needs the realm's admin policy bytes.
  const signPolicy = (p: (typeof POLICIES)[number]) =>
    step(async () => {
      const ap = await kc("/iga/role-policies/name/tide-realm-admin");
      const adminPolicyB64 = ap.body?.policy;
      if (!ap.ok || typeof adminPolicyB64 !== "string") throw new Error(`Could not read the admin policy (HTTP ${ap.status}).`);
      const signed = await signRelationshipPolicy(
        { vendorId: tc.getVendorId(), subject: p.subject, recordId: IDENTITY_RECORD_ID, access: p.access },
        b64.from(adminPolicyB64)
      );
      await api("/api/policies", { method: "POST", body: JSON.stringify({ purpose: p.purpose, policy: signed }) });
      return `Signed and stored the ${p.purpose} policy.`;
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
          <div className="mt-4 divide-y divide-[#edf1ee]">
            {POLICIES.map((p) => (
              <div key={p.purpose} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm"><b>{p.purpose}</b> · {p.what}</span>
                {state?.policies[p.purpose] ? (
                  <span className="text-sm font-semibold text-[#1d765b]">Signed ✓</span>
                ) : (
                  <button className={btn.primary} disabled={busy} onClick={() => signPolicy(p)}>Sign in enclave</button>
                )}
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
