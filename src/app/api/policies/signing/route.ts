import { randomUUID } from "crypto";
import { withRole } from "@/lib/auth/middleware";
import { readDb, updateDb } from "@/lib/store";
import { describePolicy, checkPolicy, countApprovals } from "@/lib/tide/policyCheck";

// Multi-admin policy signing. With a 2-of-3 realm admin threshold one panel member's approval is not
// enough, so the request is parked here between approvals. It holds dokens and approval signatures,
// no secret: the server can store and relay it but cannot add an approval (that needs an enclave).

// GET /api/policies/signing — every request still collecting approvals.
export const GET = withRole("panel-member", async () => {
  const db = readDb();
  return Response.json({ pending: db.pendingSignings ?? [] });
});

// POST /api/policies/signing — a panel member starts one, already carrying their own approval.
// Body: { purpose, policy (unsigned, base64), request (base64) }.
export const POST = withRole("panel-member", async (req, jwt) => {
  const body = await req.json();
  const purpose = body.purpose;
  if (purpose !== "write" && purpose !== "read") return Response.json({ error: "Bad purpose" }, { status: 400 });
  if (typeof body.policy !== "string" || typeof body.request !== "string") {
    return Response.json({ error: "Missing policy or request" }, { status: 400 });
  }

  let problem: string | null;
  let approvals: number;
  try {
    problem = checkPolicy(purpose, describePolicy(body.policy), false);
    approvals = countApprovals(body.request);
  } catch (e) {
    return Response.json({ error: `Does not parse: ${e instanceof Error ? e.message : e}` }, { status: 400 });
  }
  if (problem) return Response.json({ error: `Refused ${purpose} policy: ${problem}` }, { status: 400 });
  if (approvals < 1) return Response.json({ error: "The request carries no approval" }, { status: 400 });

  return updateDb((db) => {
    db.pendingSignings ??= [];
    if (db.pendingSignings.some((s) => s.purpose === purpose)) {
      return Response.json({ error: `A ${purpose} policy is already collecting approvals` }, { status: 409 });
    }
    const pending = {
      id: randomUUID(),
      purpose,
      policyB64: body.policy,
      requestB64: body.request,
      approvals,
      approvedBy: [String(jwt.preferred_username ?? jwt.sub)],
      createdAt: new Date().toISOString(),
    };
    db.pendingSignings.push(pending);
    return Response.json({ pending }, { status: 201 });
  });
});
