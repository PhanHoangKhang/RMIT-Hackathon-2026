"use client";

import { useCallback, useEffect, useState } from "react";
import { signRelationshipPolicy, type RelationshipSubject, type RelationshipAccess } from "@/lib/tide/relationship";
import { IdentityReveal } from "@/components/IdentityReveal";
import {
  useApi, useMe, Nav, Gate, Notice, RoleChips, IDENTITY_RECORD_ID, tideErrorText, b64, ui,
  type ApplicationView, type CycleState,
} from "@/lib/client";

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
  const { authenticated, isInitializing, login, api, kc } = tc;
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

  if (isInitializing) return <p>Loading…</p>;
  if (!authenticated) return <button onClick={login} style={ui.btn}>Log in with Tide</button>;

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
    <div style={ui.page}>
      <Nav me={me} />
      <Gate me={me} role="panel-member">
        <div style={ui.card}>
          <h2 style={ui.h2}>Your token</h2>
          <RoleChips roles={me?.roles ?? []} />
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 0 }}>
            _tide_decryptor {decryptorInToken ? "is" : "is NOT"} in your current token.
          </p>
        </div>

        <div style={ui.card}>
          <h2 style={ui.h2}>Setup · identity policies (RelationshipAttestation:1)</h2>
          {POLICIES.map((p) => {
            const have = state?.policies[p.purpose];
            return (
              <div key={p.purpose} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "0.4rem 0", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.9rem" }}><b>{p.purpose}</b> · {p.what}</span>
                {have ? <span style={{ color: "var(--ok)", fontSize: "0.85rem" }}>signed ✓</span> : (
                  <button style={ui.btn} disabled={busy} onClick={() => signPolicy(p)}>Sign in enclave</button>
                )}
              </div>
            );
          })}
        </div>

        <div style={ui.card}>
          <h2 style={ui.h2}>Stage 2 · Reveal (needs 2 of 3 panel members)</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0 }}>
            Scores locked: {locked ? `yes (${c?.lockedBy})` : "no"} · stage: {c?.stage ?? "…"}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button style={ui.btn} disabled={busy || !locked || !state?.policies.read || revealCrs.length > 0 || decryptorInToken} onClick={propose}>
              Propose reveal
            </button>
            <button style={ui.btn} disabled={busy || c?.stage === "reveal"} onClick={refreshAndAdvance}>
              Refresh my token &amp; advance stage
            </button>
          </div>
          {!locked && <Notice kind="info">The proposal opens once the admin locks scores (every reviewer has scored every portfolio).</Notice>}

          {revealCrs.map((cr) => (
            <div key={cr.id} style={{ ...ui.card, background: "var(--panel-2)", marginTop: "0.75rem" }}>
              <div style={{ fontSize: "0.9rem" }}>
                <b>{cr.actionType}</b> · add <code>_tide_decryptor</code> to <code>selection-panel</code>
              </div>
              <div style={ui.mono}>id {cr.id} · approvals {String(cr.authorizationCount ?? cr.authorizers?.length ?? "?")}/{String(cr.threshold ?? "?")}</div>
              <button style={{ ...ui.btn, marginTop: "0.5rem" }} disabled={busy} onClick={() => approve(cr)}>Approve in enclave</button>
            </div>
          ))}
          {otherCrs.length > 0 && (
            <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
              {otherCrs.length} other pending change request(s): {otherCrs.map((cr) => cr.actionType).join(", ")}
            </p>
          )}
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </div>

        <div style={ui.card}>
          <h2 style={ui.h2}>Applicants</h2>
          {apps.map((a) => (
            <div key={a.id} style={{ padding: "0.6rem 0", borderTop: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{a.label}</div>
              <IdentityReveal ciphertext={a.identityCiphertext} readPolicy={readPolicy} />
            </div>
          ))}
        </div>
      </Gate>
    </div>
  );
}
