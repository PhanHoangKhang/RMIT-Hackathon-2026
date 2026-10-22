import type { JWTPayload } from "jose";
import { hasRole } from "@/lib/auth/tideJWT";
import { prisma } from "@/lib/prisma";

/** Admins and panel members may always see results. */
export function isResultsViewer(jwt: JWTPayload): boolean {
  return hasRole(jwt, "admin") || hasRole(jwt, "panel-member");
}

/** Review status shown on a portfolio card, derived from the reviews actually stored. */
export function statusLabel(reviewCount: number): string {
  if (reviewCount === 0) return "Awaiting review";
  return `In review · ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`;
}

/**
 * Review counts per portfolio, plus the set of portfolios this caller has reviewed.
 * Used to build the status label and to decide who may see results.
 */
export async function reviewStats(reviewerId: string | undefined) {
  const [counts, mine] = await Promise.all([
    prisma.review.groupBy({ by: ["portfolioId"], _count: { _all: true } }),
    reviewerId
      ? prisma.review.findMany({ where: { reviewerId }, select: { portfolioId: true } })
      : Promise.resolve([] as { portfolioId: string }[]),
  ]);
  const countById = new Map<string, number>(
    counts.map((c: { portfolioId: string; _count: { _all: number } }) => [c.portfolioId, c._count._all]),
  );
  const reviewedByMe = new Set<string>(mine.map((r: { portfolioId: string }) => r.portfolioId));
  return { countById, reviewedByMe };
}
