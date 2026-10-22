import { withAuth, withRole } from "@/lib/auth/middleware";
import { hasRole } from "@/lib/auth/tideJWT";
import { randomUUID } from "crypto";
import { readDb, updateDb, pseudonym, applicationView, type WorkSample } from "@/lib/store";

// GET /api/applications
//   applicant: their own submission
//   reviewer / admin / panel-member: every portfolio, WITHOUT applicantSub
// identityCiphertext goes to every caller on purpose: it is useless without the ORKs' consent, and
// handing it out is what lets the demo show the network itself refusing an early reveal.
export const GET = withAuth(async (_req, jwt) => {
  const db = readDb();
  const staff = ["reviewer", "admin", "panel-member"].some((r) => hasRole(jwt, r));
  const visible = staff ? db.applications : db.applications.filter((a) => a.applicantSub === jwt.sub);
  return Response.json({ applications: visible.map(applicationView) });
});

// POST /api/applications — applicant submits work samples (plaintext) + identity (ciphertext only).
// Body: { category?, brief?, skills?: string[], workSamples: WorkSample[], identityCiphertext: string }
export const POST = withRole("applicant", async (req, jwt) => {
  const body = await req.json();
  const samples: WorkSample[] = Array.isArray(body.workSamples) ? body.workSamples : [];
  const clean = samples
    .filter((s) => s && typeof s.title === "string" && typeof s.description === "string")
    .map((s) => ({ title: s.title.slice(0, 120), description: s.description.slice(0, 2000) }))
    .filter((s) => s.title.trim());
  if (clean.length === 0) return Response.json({ error: "At least one work sample is required." }, { status: 400 });
  if (typeof body.identityCiphertext !== "string" || !body.identityCiphertext) {
    return Response.json({ error: "Missing identityCiphertext." }, { status: 400 });
  }
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const skills = Array.isArray(body.skills)
    ? body.skills.filter((s: unknown) => typeof s === "string").map((s: string) => s.slice(0, 40)).slice(0, 8)
    : [];

  return updateDb((db) => {
    if (db.cycle.scoresLockedAt) return Response.json({ error: "Submissions are closed." }, { status: 409 });
    if (db.applications.some((a) => a.applicantSub === jwt.sub)) {
      return Response.json({ error: "You have already submitted a portfolio." }, { status: 409 });
    }
    const application = {
      id: randomUUID(),
      applicantSub: jwt.sub!,
      category: text(body.category, 60),
      brief: text(body.brief, 1000),
      skills,
      workSamples: clean,
      identityCiphertext: body.identityCiphertext,
      createdAt: new Date().toISOString(),
    };
    db.applications.push(application);
    return Response.json({ id: application.id, label: pseudonym(application.id) }, { status: 201 });
  });
});
