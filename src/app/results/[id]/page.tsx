
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTideCloak } from "@tidecloak/nextjs";

interface Results {
  portfolioId: string;
  reviewCount: number;
  averageTotalScore: number | null;
  averageScores: {
    problemUnderstanding: number | null;
    solutionQuality: number | null;
    execution: number | null;
    communication: number | null;
  };
  feedback: {
    id: string;
    comment: string;
    createdAt: string;
  }[];
}

const portfolioInfo: Record<
  string,
  { title: string; category: string }
> = {
  "BR-001": {
    title: "E-commerce UX Redesign",
    category: "UX Design",
  },
  "BR-002": {
    title: "Sustainable Packaging Concept",
    category: "Product Design",
  },
  "BR-003": {
    title: "Accessibility Audit",
    category: "Research",
  },
};

const criteria = [
  { key: "problemUnderstanding", label: "Problem understanding" },
  { key: "solutionQuality", label: "Quality of solution" },
  { key: "execution", label: "Execution and craft" },
  { key: "communication", label: "Communication" },
] as const;

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    authenticated,
    login,
    logout,
    getValueFromIdToken,
    isInitializing,
    token,
    secureFetch,
  } = useTideCloak();

  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    if (!authenticated || !token || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = new URL(
        `/api/portfolios/${encodeURIComponent(id)}/results`,
        window.location.origin,
      );

      const response = await secureFetch(url, {
        cache: "no-store",
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          body?.error ??
            `Failed to load results (HTTP ${response.status}).`,
        );
      }

      if (!body?.data) {
        throw new Error(
          "Invalid API response: expected a data object.",
        );
      }

      const data = body.data;
      const scores = data.averageScores;

      if (
        typeof data.reviewCount !== "number" ||
        !scores ||
        !Array.isArray(data.feedback)
      ) {
        throw new Error(
          "The results API response does not match the expected format.",
        );
      }

      const nullableNumber = (
        value: unknown,
      ): number | null =>
        typeof value === "number" && Number.isFinite(value)
          ? value
          : null;

      setResults({
        portfolioId: String(data.portfolioId ?? id),
        reviewCount: data.reviewCount,
        averageTotalScore: nullableNumber(
          data.averageTotalScore,
        ),
        averageScores: {
          problemUnderstanding: nullableNumber(
            scores.problemUnderstanding,
          ),
          solutionQuality: nullableNumber(
            scores.solutionQuality,
          ),
          execution: nullableNumber(scores.execution),
          communication: nullableNumber(
            scores.communication,
          ),
        },
        feedback: data.feedback.map(
          (item: Results["feedback"][number]) => ({
            id: String(item.id),
            comment: String(item.comment ?? ""),
            createdAt: String(item.createdAt ?? ""),
          }),
        ),
      });
    } catch (err) {
      setResults(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load results. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [authenticated, token, id, secureFetch]);

  useEffect(() => {
    if (isInitializing) return;

    if (!authenticated || !token) {
      setLoading(false);
      return;
    }

    void fetchResults();
  }, [
    isInitializing,
    authenticated,
    token,
    fetchResults,
  ]);

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7]">
        <p className="text-sm text-[#65766f]">
          Restoring your session...
        </p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7] p-5">
        <div className="w-full max-w-md rounded-2xl border border-[#dce7e2] bg-white p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#1d6353] text-xl font-bold text-white">
            B
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#193b35]">
            BlindReview
          </h1>

          <p className="mt-3 text-sm text-[#65766f]">
            Sign in to view portfolio results.
          </p>

          <button
            type="button"
            onClick={() => login()}
            className="mt-5 w-full rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174d41]"
          >
            Sign in with TideCloak
          </button>
        </div>
      </main>
    );
  }

  const portfolio = portfolioInfo[id];
  const username = getValueFromIdToken("preferred_username");

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#193b35]">
      <header className="border-b border-[#e4ebe7] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 font-bold"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d6353] text-xl text-white">
              B
            </span>
            <span>BlindReview</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-[#65766f] sm:block">
              {username || "Reviewer"}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[#dce6e0] px-3 py-2 text-sm hover:bg-[#f6f8f7]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/"
          className="text-sm font-medium text-[#1d7059] hover:underline"
        >
          ← Back to portfolios
        </Link>

        <section className="mt-7 overflow-hidden rounded-2xl border border-[#e1e9e4] bg-white">
          <div className="bg-[#173f35] px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold">
                {portfolio?.category ?? "Portfolio"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                {id}
              </span>
            </div>

            <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#b6d8c8]">
              REVIEW RESULTS
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
              {portfolio?.title ?? "Portfolio results"}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/80">
              Review scores and written feedback for this portfolio.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 p-6 sm:p-9">
            <Link
              href={`/portfolios/${encodeURIComponent(id)}`}
              className="rounded-lg border border-[#dce6e0] bg-white px-4 py-2.5 text-sm font-semibold text-[#35584c] transition hover:bg-[#f0f5f2]"
            >
              Read case study
            </Link>

            <button
              type="button"
              onClick={() => void fetchResults()}
              disabled={loading}
              className="rounded-lg bg-[#1d6353] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174d41] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh results"}
            </button>
          </div>
        </section>

        {loading ? (
          <div
            className="mt-8 rounded-2xl border border-[#e1e9e4] bg-white p-8"
            role="status"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dce7e2] border-t-[#1d6353]" />
              <p className="text-sm text-[#65766f]">
                Loading review results...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load results
            </h2>

            <p
              role="alert"
              className="mt-2 break-words text-sm leading-6 text-red-700"
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => void fetchResults()}
              className="mt-4 rounded-lg bg-[#1d6353] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174d41]"
            >
              Try again
            </button>
          </div>
        ) : results ? (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e1e9e4] bg-white p-6">
                <p className="text-sm text-[#65766f]">
                  Average total score
                </p>

                <p className="mt-3 text-4xl font-semibold">
                  {results.averageTotalScore === null
                    ? "—"
                    : results.averageTotalScore.toFixed(2)}

                  <span className="ml-2 text-base font-normal text-[#89968f]">
                    / 20
                  </span>
                </p>

                <p className="mt-2 text-xs text-[#89968f]">
                  Average across all submitted reviews
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1e9e4] bg-white p-6">
                <p className="text-sm text-[#65766f]">
                  Total reviews
                </p>

                <p className="mt-3 text-4xl font-semibold">
                  {results.reviewCount}
                </p>

                <p className="mt-2 text-xs text-[#89968f]">
                  Submitted for this portfolio
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">
                Score by criterion
              </h2>

              <p className="mt-1 text-sm text-[#65766f]">
                Average score out of 5
              </p>

              {results.reviewCount === 0 ? (
                <p className="mt-5 rounded-xl bg-[#f6f8f7] p-5 text-sm leading-6 text-[#65766f]">
                  Scores will appear here after the first review
                  has been submitted.
                </p>
              ) : (
                <div className="mt-6 space-y-6">
                  {criteria.map((criterion) => {
                    const score =
                      results.averageScores[criterion.key];

                    const percentage =
                      score === null
                        ? 0
                        : Math.min(
                            100,
                            Math.max(0, (score / 5) * 100),
                          );

                    return (
                      <div key={criterion.key}>
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-medium">
                            {criterion.label}
                          </span>

                          <span className="shrink-0 font-semibold tabular-nums">
                            {score === null
                              ? "—"
                              : score.toFixed(2)}

                            <span className="font-normal text-[#89968f]">
                              {" "}/ 5
                            </span>
                          </span>
                        </div>

                        <div
                          className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ece8]"
                          role="progressbar"
                          aria-label={criterion.label}
                          aria-valuemin={0}
                          aria-valuemax={5}
                          aria-valuenow={score ?? 0}
                        >
                          <div
                            className="h-full rounded-full bg-[#1d6353] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    Reviewer feedback
                  </h2>

                  <p className="mt-1 text-sm text-[#65766f]">
                    Written comments submitted by reviewers
                  </p>
                </div>

                <span className="rounded-full bg-[#e7efeb] px-3 py-1.5 text-xs font-semibold text-[#386458]">
                  {results.feedback.length}{" "}
                  {results.feedback.length === 1
                    ? "review"
                    : "reviews"}
                </span>
              </div>

              {results.feedback.length === 0 ? (
                <div className="mt-5 rounded-xl bg-[#f6f8f7] p-5">
                  <p className="text-sm font-medium text-[#35584c]">
                    No feedback yet
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#65766f]">
                    Be the first to review this portfolio and
                    share constructive feedback.
                  </p>

                  <Link
                    href={`/portfolios/${encodeURIComponent(id)}`}
                    className="mt-4 inline-flex rounded-lg bg-[#1d6353] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174d41]"
                  >
                    Write a review
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {results.feedback.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-[#e4ebe6] bg-[#fafcfb] p-5"
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#35584c]">
                        {item.comment}
                      </p>

                      <p className="mt-3 text-xs text-[#89968f]">
                        {formatDate(item.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#e1e9e4] bg-white p-8">
            <p className="text-sm text-[#65766f]">
              No results are available for this portfolio.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
