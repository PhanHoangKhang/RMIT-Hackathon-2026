import { withAuth } from "@/lib/auth/middleware";
import { getPortfolioById } from "@/data/portfolios";
import { reviewStats, statusLabel } from "@/lib/reviewStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAuth(async (req, jwt) => {
  const id = req.nextUrl.pathname.split("/").filter(Boolean).at(-1);
  if (!id) {
    return Response.json({ error: "Portfolio ID is required" }, { status: 400 });
  }

  const portfolio = getPortfolioById(id);
  if (!portfolio) {
    return Response.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const { countById, reviewedByMe } = await reviewStats(jwt.sub);
  const reviewCount = countById.get(portfolio.id) ?? 0;

  return Response.json(
    {
      data: {
        ...portfolio,
        status: statusLabel(reviewCount),
        reviewCount,
        reviewedByMe: reviewedByMe.has(portfolio.id),
      },
      meta: { requestedBy: jwt.sub },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
