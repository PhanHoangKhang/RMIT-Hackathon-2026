
import { withAuth } from "@/lib/auth/middleware";

const portfolios = [
  {
    id: "BR-001",
    title: "E-commerce UX Redesign",
    category: "UX Design",
    description:
      "Redesign an online shopping experience with a focus on usability and conversion.",
    brief:
      "Evaluate how effectively the proposed redesign improves the shopping journey, usability, and conversion experience.",
    skills: ["User Research", "Wireframing", "Prototyping"],
    status: "Awaiting review",
  },
  {
    id: "BR-002",
    title: "Sustainable Packaging Concept",
    category: "Product Design",
    description:
      "A sustainable packaging proposal balancing usability, cost and environmental impact.",
    brief:
      "Evaluate the balance between sustainability, packaging usability, manufacturing cost, and visual communication.",
    skills: ["Product Thinking", "Sustainability", "Visual Design"],
    status: "Awaiting review",
  },
  {
    id: "BR-003",
    title: "Accessibility Audit",
    category: "Research",
    description:
      "An accessibility assessment with prioritized recommendations for an inclusive digital product.",
    brief:
      "Evaluate the quality of the accessibility assessment, the evidence behind its findings, and the practicality of its recommendations.",
    skills: ["Accessibility", "Research", "Communication"],
    status: "In review",
  },
];

export const GET = withAuth(async (req, jwt) => {
  const id = req.nextUrl.pathname.split("/").pop();

  const portfolio = portfolios.find((item) => item.id === id);

  if (!portfolio) {
    return Response.json(
      { error: "Portfolio not found" },
      { status: 404 },
    );
  }

  return Response.json(
    {
      data: portfolio,
      meta: { requestedBy: jwt.sub },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
