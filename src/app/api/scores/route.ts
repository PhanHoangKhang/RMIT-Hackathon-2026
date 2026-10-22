import { withAuth, withRole } from "@/lib/auth/middleware";
import { hasRole } from "@/lib/auth/tideJWT";
import { readDb, updateDb, pseudonym } from "@/lib/store";

// GET /api/scores — reviewer: their own; admin / panel-member: all (reviewers shown only by index).
export const GET = withAuth(async (_req, jwt) => {
  const db = readDb();
  const all = hasRole(jwt, "admin") || hasRole(jwt, "panel-member");
  if (!all && !hasRole(jwt, "reviewer")) return Response.json({ error: "Forbidden" }, { status: 403 });
  const rows = all ? db.scores : db.scores.filter((s) => s.reviewerSub === jwt.sub);
  return Response.json({
    scores: rows.map((s) => ({
      applicationId: s.applicationId,
      label: pseudonym(s.applicationId),
      reviewer: `Reviewer ${db.reviewers.indexOf(s.reviewerSub) + 1}`,
      scores: s.scores,
      total: Object.values(s.scores).reduce((a, b) => a + b, 0),
      comment: s.comment,
      submittedAt: s.submittedAt,
    })),
  });
});

// POST /api/scores — reviewer scores one portfolio. Body: { applicationId, scores: {criterionId: n}, comment }
// Re-submitting overwrites until the admin locks scores; after that every write is refused.
export const POST = withRole("reviewer", async (req, jwt) => {
  const body = await req.json();
  return updateDb((db) => {
    if (db.cycle.scoresLockedAt) return Response.json({ error: "Scores are locked." }, { status: 409 });
    if (!db.applications.some((a) => a.id === body.applicationId)) {
      return Response.json({ error: "Unknown portfolio." }, { status: 404 });
    }
    const scores: Record<string, number> = {};
    for (const c of db.cycle.criteria) {
      const v = Number(body.scores?.[c.id]);
      if (!Number.isInteger(v) || v < 1 || v > c.max) {
        return Response.json({ error: `${c.label} must be a whole number from 1 to ${c.max}.` }, { status: 400 });
      }
      scores[c.id] = v;
    }
    if (!db.reviewers.includes(jwt.sub!)) db.reviewers.push(jwt.sub!);
    db.scores = db.scores.filter((s) => !(s.applicationId === body.applicationId && s.reviewerSub === jwt.sub));
    db.scores.push({
      applicationId: body.applicationId,
      reviewerSub: jwt.sub!,
      scores,
      comment: typeof body.comment === "string" ? body.comment.slice(0, 1000) : "",
      submittedAt: new Date().toISOString(),
    });
    return Response.json({ ok: true });
  });
});
