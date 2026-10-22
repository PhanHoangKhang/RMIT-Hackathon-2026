import { withAuth } from "@/lib/auth/middleware";
import { portfolios, toPortfolioSummary } from "@/data/portfolios";
import { isResultsViewer, reviewStats, statusLabel } from "@/lib/reviewStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (_req, jwt) => {
  const { countById, reviewedByMe } = await reviewStats(jwt.sub);
  const viewer = isResultsViewer(jwt);

  return Response.json(
    {
      data: portfolios.map((portfolio) => {
        const reviewCount = countById.get(portfolio.id) ?? 0;
        const mine = reviewedByMe.has(portfolio.id);
        return {
          ...toPortfolioSummary(portfolio),
          status: statusLabel(reviewCount),
          reviewCount,
          reviewedByMe: mine,
          canViewResults: viewer || mine,
        };
      }),
      meta: {
        total: portfolios.length,
        requestedBy: jwt.sub,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
