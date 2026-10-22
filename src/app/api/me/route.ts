import { withAuth } from "@/lib/auth/middleware";
import { hasRole } from "@/lib/auth/tideJWT";
import { updateDb } from "@/lib/store";

const APP_ROLES = ["applicant", "reviewer", "admin", "panel-member", "selection-panel", "_tide_encryptor", "_tide_decryptor"];

// GET /api/me — the caller's app roles, as the VERIFIED token carries them.
// Also registers reviewers, so "all scores submitted" knows whose scores to wait for.
export const GET = withAuth(async (_req, jwt) => {
  const roles = APP_ROLES.filter((r) => hasRole(jwt, r));
  if (roles.includes("reviewer")) {
    updateDb((db) => {
      if (!db.reviewers.includes(jwt.sub!)) db.reviewers.push(jwt.sub!);
    });
  }
  return Response.json({ sub: jwt.sub, username: jwt.preferred_username ?? null, roles });
});
