import { withRole } from "@/lib/auth/middleware";
import { updateDb } from "@/lib/store";
import { countApprovals } from "@/lib/tide/policyCheck";

const idOf = (req: { nextUrl: URL }) => decodeURIComponent(req.nextUrl.pathname.split("/").pop() ?? "");

// PUT /api/policies/signing/[id] — a panel member adds their approval. Body: { request (base64) }.
// The new request must carry more approvals than the stored one, and each member approves once.
export const PUT = withRole("panel-member", async (req, jwt) => {
  const id = idOf(req);
  const body = await req.json();
  if (typeof body.request !== "string") return Response.json({ error: "Missing request" }, { status: 400 });
  let approvals: number;
  try {
    approvals = countApprovals(body.request);
  } catch (e) {
    return Response.json({ error: `Request does not parse: ${e instanceof Error ? e.message : e}` }, { status: 400 });
  }
  const me = String(jwt.preferred_username ?? jwt.sub);

  return updateDb((db) => {
    const pending = (db.pendingSignings ?? []).find((s) => s.id === id);
    if (!pending) return Response.json({ error: "No such signing request" }, { status: 404 });
    if (pending.approvedBy.includes(me)) return Response.json({ error: "You already approved this request" }, { status: 409 });
    if (approvals <= pending.approvals) {
      return Response.json({ error: `Request carries ${approvals} approval(s), not more than the stored ${pending.approvals}` }, { status: 400 });
    }
    pending.requestB64 = body.request;
    pending.approvals = approvals;
    pending.approvedBy.push(me);
    return Response.json({ pending });
  });
});

// DELETE /api/policies/signing/[id] — a panel member abandons a request (e.g. it expired).
export const DELETE = withRole("panel-member", async (req) => {
  const id = idOf(req);
  return updateDb((db) => {
    const before = (db.pendingSignings ?? []).length;
    db.pendingSignings = (db.pendingSignings ?? []).filter((s) => s.id !== id);
    if (db.pendingSignings.length === before) return Response.json({ error: "No such signing request" }, { status: 404 });
    return Response.json({ ok: true });
  });
});
