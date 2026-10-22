import { withAuth } from "@/lib/auth/middleware";
import { readDb, allScoresSubmitted } from "@/lib/store";

// GET /api/cycle — stage and progress. No identities, no reviewer ids.
export const GET = withAuth(async () => {
  const db = readDb();
  return Response.json({
    cycle: db.cycle,
    counts: {
      applications: db.applications.length,
      reviewers: db.reviewers.length,
      scores: db.scores.length,
    },
    allScoresSubmitted: allScoresSubmitted(db),
    policies: {
      write: db.policies.some((p) => p.purpose === "write"),
      read: db.policies.some((p) => p.purpose === "read"),
    },
  });
});
