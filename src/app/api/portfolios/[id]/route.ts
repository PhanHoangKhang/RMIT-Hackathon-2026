import { withAuth } from "@/lib/auth/middleware";
import { getPortfolioById } from "@/data/portfolios";

export const GET = withAuth(async (req, jwt) => {
  const id = req.nextUrl.pathname.split("/").filter(Boolean).at(-1);
  if (!id) {
    return Response.json({ error: "Portfolio ID is required" }, { status: 400 });
  }

  const portfolio = getPortfolioById(id);
  if (!portfolio) {
    return Response.json({ error: "Portfolio not found" }, { status: 404 });
  }

  return Response.json(
    { data: portfolio, meta: { requestedBy: jwt.sub } },
    { headers: { "Cache-Control": "no-store" } },
  );
});
