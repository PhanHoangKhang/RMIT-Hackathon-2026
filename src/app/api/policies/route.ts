import { withAuth, withRole } from "@/lib/auth/middleware";
import { readDb, updateDb } from "@/lib/store";
import { describePolicy, checkPolicy } from "@/lib/tide/policyCheck";

// GET /api/policies — both signed identity policies.
// Deliberate demo trade-off vs AP-RA07: they go to every signed-in user, because a Role policy only
// works for holders of that role, and letting reviewers/admin try it is what makes the ORKs (not our
// server) be the thing that refuses an early reveal. The only thing disclosed is which ROLE may read.
export const GET = withAuth(async () => {
  const db = readDb();
  const pick = (purpose: "write" | "read") => db.policies.find((p) => p.purpose === purpose)?.policyB64 ?? null;
  return Response.json({ write: pick("write"), read: pick("read") });
});

// POST /api/policies — a panel member stores a policy they just signed in the enclave.
// Body: { purpose: "write" | "read", policy: base64 }. The bytes are parsed and must match exactly
// what this app expects for that purpose (AP-RA08).
export const POST = withRole("panel-member", async (req, jwt) => {
  const body = await req.json();
  const purpose = body.purpose;
  if (purpose !== "write" && purpose !== "read") return Response.json({ error: "Bad purpose" }, { status: 400 });
  if (typeof body.policy !== "string") return Response.json({ error: "Missing policy" }, { status: 400 });

  let summary;
  try {
    summary = describePolicy(body.policy);
  } catch (e) {
    return Response.json({ error: `Policy does not parse: ${e instanceof Error ? e.message : e}` }, { status: 400 });
  }
  const problem = checkPolicy(purpose, summary);
  if (problem) return Response.json({ error: `Refused ${purpose} policy: ${problem}` }, { status: 400 });

  return updateDb((db) => {
    db.policies = db.policies.filter((p) => p.purpose !== purpose);
    // The multi-admin request that produced this policy is finished.
    db.pendingSignings = (db.pendingSignings ?? []).filter((s) => s.purpose !== purpose);
    db.policies.push({
      purpose,
      recordId: summary.recordId,
      subjectType: summary.subjectType,
      subjectId: summary.subjectId,
      roles: summary.roles,
      policyB64: body.policy,
      grantedBy: String(jwt.preferred_username ?? jwt.sub),
      createdAt: new Date().toISOString(),
    });
    return Response.json({ ok: true, summary }, { status: 201 });
  });
});
