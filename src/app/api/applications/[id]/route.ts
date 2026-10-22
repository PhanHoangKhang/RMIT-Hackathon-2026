import { withAuth } from "@/lib/auth/middleware";
import { hasRole } from "@/lib/auth/tideJWT";
import { readDb, applicationView } from "@/lib/store";

// GET /api/applications/:id — one portfolio, pseudonymous, plus the caller's own score if any.
// Same visibility rule as the list: staff see every portfolio, an applicant only their own.
export const GET = withAuth(async (req, jwt) => {
  const id = decodeURIComponent(req.nextUrl.pathname.split("/").pop() ?? "");
  const db = readDb();
  const app = db.applications.find((a) => a.id === id);
  const staff = ["reviewer", "admin", "panel-member"].some((r) => hasRole(jwt, r));
  if (!app || (!staff && app.applicantSub !== jwt.sub)) {
    return Response.json({ error: "Portfolio not found" }, { status: 404 });
  }
  const mine = db.scores.find((s) => s.applicationId === id && s.reviewerSub === jwt.sub);
  return Response.json(
    {
      application: applicationView(app),
      myScore: mine ? { scores: mine.scores, feedback: mine.feedback, submittedAt: mine.submittedAt } : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});
