
import { withAuth } from "@/lib/auth/middleware";

const portfolios = [
  {
    id: "BR-001",
    title: "E-commerce UX Redesign",
    category: "UX Design",
    description:
      "Redesign an online shopping experience with a focus on usability and conversion.",
    skills: ["User Research", "Wireframing", "Prototyping"],
    status: "Awaiting review",
  },
  {
    id: "BR-002",
    title: "Sustainable Packaging Concept",
    category: "Product Design",
    description:
      "A sustainable packaging proposal balancing usability, cost and environmental impact.",
    skills: ["Product Thinking", "Sustainability", "Visual Design"],
    status: "Awaiting review",
  },
  {
    id: "BR-003",
    title: "Accessibility Audit",
    category: "Research",
    description:
      "An accessibility assessment with prioritized recommendations for an inclusive digital product.",
    skills: ["Accessibility", "Research", "Communication"],
    status: "In review",
  },
];

export const GET = withAuth(async (_req, jwt) => {
  return Response.json(
    {
      data: portfolios,
      meta: {
        total: portfolios.length,
        requestedBy: jwt.sub,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
});
