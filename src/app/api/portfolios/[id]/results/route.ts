
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PORTFOLIO_IDS = new Set(["BR-001", "BR-002", "BR-003"]);

export const GET = withAuth(async (req) => {
  const id = req.nextUrl.pathname.split("/").filter(Boolean).at(-2);

  if (!id || !PORTFOLIO_IDS.has(id)) {
    return Response.json(
      { error: "Portfolio not found." },
      { status: 404 },
    );
  }

  try {
    const [aggregate, reviews] = await Promise.all([
      prisma.review.aggregate({
        where: { portfolioId: id },
        _count: { _all: true },
        _avg: {
          totalScore: true,
          problemUnderstanding: true,
          solutionQuality: true,
          execution: true,
          communication: true,
        },
      }),
      prisma.review.findMany({
        where: { portfolioId: id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          feedback: true,
          createdAt: true,
        },
      }),
    ]);

    const average = (value: number | null) =>
      value === null ? null : Number(value.toFixed(2));

    return Response.json(
      {
        data: {
          portfolioId: id,
          reviewCount: aggregate._count._all,
          averageTotalScore: average(aggregate._avg.totalScore),
          averageScores: {
            problemUnderstanding: average(
              aggregate._avg.problemUnderstanding,
            ),
            solutionQuality: average(aggregate._avg.solutionQuality),
            execution: average(aggregate._avg.execution),
            communication: average(aggregate._avg.communication),
          },
          feedback: reviews.map((review) => ({
            id: review.id,
            comment: review.feedback,
            createdAt: review.createdAt,
          })),
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Failed to fetch portfolio results:", error);

    return Response.json(
      { error: "Could not load portfolio results." },
      { status: 500 },
    );
  }
});
