import { withRole } from "@/lib/auth/middleware";
import { updateDb, allScoresSubmitted } from "@/lib/store";

// POST /api/cycle/lock — admin locks scores once every reviewer has scored every portfolio.
// Locking is the app-level precondition for proposing the reveal. It reveals nothing by itself.
export const POST = withRole("admin", async (_req, jwt) => {
  return updateDb((db) => {
    if (db.cycle.scoresLockedAt) return Response.json({ cycle: db.cycle });
    if (!allScoresSubmitted(db)) {
      return Response.json({ error: "Not every reviewer has scored every portfolio yet." }, { status: 409 });
    }
    db.cycle.scoresLockedAt = new Date().toISOString();
    db.cycle.lockedBy = String(jwt.preferred_username ?? jwt.sub);
    return Response.json({ cycle: db.cycle });
  });
});
