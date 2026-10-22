import { withAuth } from "@/lib/auth/middleware";
import { portfolios, toPortfolioSummary } from "@/data/portfolios";

export const GET = withAuth(async (_req, jwt) => {
  return Response.json(
    {
      data: portfolios.map(toPortfolioSummary),
      meta: {
        total: portfolios.length,
        requestedBy: jwt.sub,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
