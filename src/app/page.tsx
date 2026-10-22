
"use client";

import Link from "next/link";
import { useTideCloak } from "@tidecloak/nextjs";

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

export default function HomePage() {
  const {
    authenticated,
    login,
    logout,
    getValueFromIdToken,
    isInitializing,
  } = useTideCloak();

  // Wait until TideCloak has restored the session before
  // deciding whether to display the login screen or dashboard.
  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7]">
        <div className="flex items-center gap-3 text-sm text-[#65766f]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#dce7e2] border-t-[#1d6353]" />
          Loading session...
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#dce7e2] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1d6353] text-2xl font-bold text-white">
            B
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#193b35]">
            BlindReview
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#75847e]">
            Evaluate the work. Not the identity.
          </p>

          <button
            type="button"
            onClick={() => login()}
            className="mt-7 w-full rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174d41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6353]"
          >
            Sign in with TideCloak
          </button>

          <p className="mt-5 text-xs text-[#89968f]">
            Privacy-first portfolio evaluation
          </p>
        </div>
      </main>
    );
  }

  const username = getValueFromIdToken("preferred_username");

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#193b35]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e4ebe7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 text-lg font-bold tracking-tight text-[#193b35] sm:text-xl"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d6353] text-xl text-white">
              B
            </span>
            BlindReview
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-[#89968f]">Signed in as</p>
              <p className="max-w-40 truncate text-sm font-medium text-[#35584c]">
                {username || "Reviewer"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg border border-[#dce6e0] bg-white px-3 py-2 text-sm font-medium text-[#35584c] transition hover:bg-[#f6f8f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6353] sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-16 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c25e43]">
            BLIND REVIEW · ROUND 1
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#193b35] sm:text-5xl lg:text-6xl">
            Portfolio reviews
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#65766f] sm:text-base">
            Evaluate each submission against consistent criteria. Candidate
            identities should remain hidden during the blind review stage.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4 sm:p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl text-[#1d765b]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12 2 2 4-4"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#245b47]">
              Blind review stage
            </p>
            <p className="mt-1 text-sm leading-6 text-[#60766c]">
              Reviewers see anonymized portfolio information in this prototype.
              Identity access requires a separate authorization and encryption
              workflow; this interface alone does not enforce that protection.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio list */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#193b35]">
              Submissions
            </h2>
            <p className="mt-2 text-sm text-[#75847e]">
              Synthetic portfolios for the hackathon demo
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#e7efeb] px-3 py-2 text-xs font-medium text-[#386458]">
            {portfolios.length} portfolios
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <article
              key={portfolio.id}
              className="flex min-w-0 flex-col rounded-2xl border border-[#e1e9e4] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#65766f]">
                  {portfolio.category}
                </span>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#eaf5ef] px-2.5 py-1.5 text-[11px] font-semibold text-[#267256]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path
                      strokeLinecap="round"
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                    />
                  </svg>
                  Anonymous
                </span>
              </div>

              <p className="mt-7 text-xs font-medium tracking-widest text-[#9aa69f]">
                {portfolio.id}
              </p>

              <h3 className="mt-2 text-xl font-semibold leading-snug text-[#193b35]">
                {portfolio.title}
              </h3>

              <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[#65766f]">
                {portfolio.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {portfolio.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-[#e4ebe6] bg-[#fafcfb] px-2.5 py-1.5 text-[11px] text-[#587066]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#edf1ee] pt-5">
                <span className="inline-flex min-w-0 items-center gap-2 text-xs text-[#74827b]">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      portfolio.status === "In review"
                        ? "bg-[#278c86]"
                        : "bg-[#d6a14a]"
                    }`}
                  />
                  <span className="truncate">{portfolio.status}</span>
                </span>

                <Link
                  href={`/portfolios/${portfolio.id}`}
                  className="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-[#1d7059] transition hover:bg-[#eaf5ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6353]"
                >
                  Review <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#89968f]">
          Demo environment · All portfolio entries are synthetic.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e4ebe7] bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-[#89968f] sm:flex-row">
          <span>BlindReview</span>
          <span>
            Privacy-first portfolio evaluation · Hackathon prototype
          </span>
        </div>
      </footer>
    </main>
  );
}
