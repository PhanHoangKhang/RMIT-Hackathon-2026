import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// Filesystem store, same pattern as the template's vault route: survives Next.js dev hot reload.
// Holds ciphertext and signed policies only. The server never sees identity plaintext.
const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "db.json");

export const CYCLE_ID = "cycle-2026";
// The ONE tag every identity item carries. RelationshipAttestation:1 refuses any other tag.
export const IDENTITY_RECORD_ID = `identity-${CYCLE_ID}`;

export type Stage = "blind" | "reveal";

export interface Criterion {
  id: string;
  label: string;
  description: string;
  max: number;
}

export interface WorkSample {
  title: string;
  description: string;
}

export interface Application {
  id: string;
  applicantSub: string; // never returned to reviewers
  category: string;
  brief: string;
  skills: string[];
  workSamples: WorkSample[];
  identityCiphertext: string;
  createdAt: string;
}

export interface Score {
  applicationId: string;
  reviewerSub: string;
  scores: Record<string, number>;
  feedback: string;
  submittedAt: string;
}

export interface StoredPolicy {
  purpose: "write" | "read";
  recordId: string;
  subjectType: string;
  subjectId: string;
  roles: string;
  policyB64: string;
  grantedBy: string;
  createdAt: string;
}

export interface Cycle {
  id: string;
  name: string;
  stage: Stage;
  scoresLockedAt: string | null;
  lockedBy: string | null;
  revealedAt: string | null;
  revealedBy: string | null;
  criteria: Criterion[];
}

export interface Db {
  cycle: Cycle;
  reviewers: string[]; // subs of every reviewer who has signed in; all must score every portfolio
  applications: Application[];
  scores: Score[];
  policies: StoredPolicy[];
}

function seed(): Db {
  return {
    cycle: {
      id: CYCLE_ID,
      name: "Unlocked Scholarship 2026",
      stage: "blind",
      scoresLockedAt: null,
      lockedBy: null,
      revealedAt: null,
      revealedBy: null,
      // Same four criteria the portfolio review form shows; written feedback is also required.
      criteria: [
        { id: "problemUnderstanding", label: "Problem understanding", description: "How well does the work identify and address the problem?", max: 5 },
        { id: "solutionQuality", label: "Quality of solution", description: "Is the proposed solution effective and well reasoned?", max: 5 },
        { id: "execution", label: "Execution and craft", description: "How well is the work executed?", max: 5 },
        { id: "communication", label: "Communication", description: "Is the work clearly explained and presented?", max: 5 },
      ],
    },
    reviewers: [],
    applications: [],
    scores: [],
    policies: [],
  };
}

export function readDb(): Db {
  if (!existsSync(DB_FILE)) return seed();
  return JSON.parse(readFileSync(DB_FILE, "utf-8"));
}

export function writeDb(db: Db): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function updateDb<T>(fn: (db: Db) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

/** Every portfolio scored by every reviewer who has signed in (and at least one of each). */
export function allScoresSubmitted(db: Db): boolean {
  if (db.applications.length === 0 || db.reviewers.length === 0) return false;
  return db.applications.every((a) =>
    db.reviewers.every((r) => db.scores.some((s) => s.applicationId === a.id && s.reviewerSub === r))
  );
}

/** Short neutral label so reviewers can talk about a portfolio without any identity signal. */
export function pseudonym(applicationId: string): string {
  return `Portfolio ${applicationId.slice(0, 4).toUpperCase()}`;
}

/** The only shape an application leaves the server in: pseudonym label, no applicantSub. */
export function applicationView(a: Application) {
  return {
    id: a.id,
    label: pseudonym(a.id),
    category: a.category,
    brief: a.brief,
    skills: a.skills,
    workSamples: a.workSamples,
    identityCiphertext: a.identityCiphertext,
    createdAt: a.createdAt,
  };
}
