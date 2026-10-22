
import { Prisma } from "@prisma/client";

import { withRole } from "@/lib/auth/middleware";
import { getPortfolioById } from "@/data/portfolios";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";


const SCORE_KEYS = [
  "problemUnderstanding",
  "solutionQuality",
  "execution",
  "communication",
] as const;

type ScoreKey = (typeof SCORE_KEYS)[number];

// Only accounts with the reviewer role may submit scores (403 otherwise).
export const POST = withRole("reviewer", async (req, jwt) => {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const input = body as Record<string, unknown>;
  const { portfolioId, scores, feedback } = input;

  if (
    typeof portfolioId !== "string" ||
    !getPortfolioById(portfolioId)
  ) {
    return Response.json(
      { error: "Invalid portfolio ID." },
      { status: 400 },
    );
  }

  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    return Response.json(
      { error: "Scores must be an object." },
      { status: 400 },
    );
  }

  const submittedScores = scores as Record<string, unknown>;
  const keys = Object.keys(submittedScores);

  if (
    keys.length !== SCORE_KEYS.length ||
    !SCORE_KEYS.every((key) =>
      Object.prototype.hasOwnProperty.call(submittedScores, key),
    )
  ) {
    return Response.json(
      { error: "Exactly four scoring criteria are required." },
      { status: 400 },
    );
  }

  for (const key of SCORE_KEYS) {
    const score = submittedScores[key];

    if (
      typeof score !== "number" ||
      !Number.isInteger(score) ||
      score < 1 ||
      score > 5
    ) {
      return Response.json(
        { error: `Score "${key}" must be an integer from 1 to 5.` },
        { status: 400 },
      );
    }
  }

  if (
    typeof feedback !== "string" ||
    !feedback.trim() ||
    feedback.trim().length > 5000
  ) {
    return Response.json(
      { error: "Feedback must contain 1–5000 characters." },
      { status: 400 },
    );
  }

  if (typeof jwt.sub !== "string" || !jwt.sub) {
    return Response.json(
      { error: "Authenticated reviewer identity is missing." },
      { status: 401 },
    );
  }

  const validatedScores = Object.fromEntries(
    SCORE_KEYS.map((key) => [key, submittedScores[key]]),
  ) as Record<ScoreKey, number>;

  const totalScore = SCORE_KEYS.reduce(
    (sum, key) => sum + validatedScores[key],
    0,
  );

  try {
    const review = await prisma.review.create({
      data: {
        portfolioId,
        reviewerId: jwt.sub,
        problemUnderstanding: validatedScores.problemUnderstanding,
        solutionQuality: validatedScores.solutionQuality,
        execution: validatedScores.execution,
        communication: validatedScores.communication,
        totalScore,
        feedback: feedback.trim(),
      },
      select: {
        id: true,
        portfolioId: true,
        totalScore: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        message: "Review submitted successfully.",
        data: review,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    // PostgreSQL unique constraint violation via Prisma.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "You have already reviewed this portfolio." },
        { status: 409 },
      );
    }

    console.error("Failed to save review:", error);

    return Response.json(
      { error: "Could not save review. Please try again." },
      { status: 500 },
    );
  }
});
