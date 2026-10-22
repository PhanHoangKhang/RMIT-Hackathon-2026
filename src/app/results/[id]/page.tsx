
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

const portfolioInfo: Record<string, { title: string; category: string }> = {
  "BR-001": { title: "E-commerce UX Redesign", category: "UX Design" },
  "BR-002": {
    title: "Sustainable Packaging Concept",
    category: "Product Design",
  },
  "BR-003": { title: "Accessibility Audit", category: "Research" },
};

const criteria = [
  { key: "problemUnderstanding", label: "Problem understanding" },
  { key: "solutionQuality", label: "Quality of solution" },
  { key: "execution", label: "Execution and craft" },
  { key: "communication", label: "Communication" },
] as const;

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { authenticated, login, isInitializing, token, secureFetch } =
    useTideCloak();

  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    if (!authenticated || !token || !id) return;

    setLoading(true);
    setError("");

    try {
      const url = new URL(
        `/api/portfolios/${encodeURIComponent(id)}/results`,
        window.location.origin,
      );

      const response = await secureFetch(url, { cache: "no-store" });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error || `Failed to load results (${response.status}).`,
        );
      }

      if (!result?.data) {
        throw new Error("Invalid results response.");
      }

      setResults(result.data as Results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load results.",
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
  }, [isInitializing, authenticated, token, fetchResults]);

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7]">
        <p className="text-sm text-[#65766f]">Restoring your session...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f7] p-5">
        <div className="rounded-2xl border border-[#dce7e2] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#193b35]">BlindReview</h1>
          <p className="mt-3 text-sm text-[#65766f]">
            Sign in to view portfolio results.
          </p>
          <button
            onClick={() => login()}
            className="mt-5 rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white"
          >
            Sign in with TideCloak
          </button>
        </div>
      </main>
    );
  }

  const portfolio = portfolioInfo[id];

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#193b35]">
      <header className="border-b border-[#e4ebe7] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d6353] text-xl text-white">
              B
            </span>
            BlindReview
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#1d7059] hover:underline"
          >
            Back to portfolios
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">
          REVIEW RESULTS
        </p>

        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          {portfolio?.title ?? "Portfolio results"}
        </h1>
        <p className="mt-2 text-sm text-[#65766f]">
          {portfolio?.category ?? "Portfolio"} · {id}
        </p>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-[#e1e9e4] bg-white p-8">
            Loading results...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
            <p role="alert" className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => void fetchResults()}
              className="mt-4 rounded-lg bg-[#1d6353] px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : results ? (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e1e9e4] bg-white p-6">
                <p className="text-sm text-[#65766f]">Average total score</p>
                <p className="mt-3 text-4xl font-semibold">
                  {results.averageTotalScore === null
                    ? "—"
                    : results.averageTotalScore.toFixed(2)}
                  <span className="ml-2 text-base font-normal text-[#89968f]">
                    / 20
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1e9e4] bg-white p-6">
                <p className="text-sm text-[#65766f]">Total reviews</p>
                <p className="mt-3 text-4xl font-semibold">
                  {results.reviewCount}
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Score by criterion</h2>
              <p className="mt-1 text-sm text-[#65766f]">
                Average score out of 5
              </p>

              <div className="mt-6 space-y-5">
                {criteria.map((criterion) => {
                  const score = results.averageScores[criterion.key];

                  return (
                    <div key={criterion.key}>
                      <div className="flex justify-between gap-4 text-sm">
                        <span>{criterion.label}</span>
                        <span className="font-semibold">
                          {score === null ? "—" : score.toFixed(2)}
                          <span className="font-normal text-[#89968f]"> / 5</span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ece8]">
                        <div
                          className="h-full rounded-full bg-[#1d6353]"
                          style={{ width: `${score === null ? 0 : (score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Reviewer feedback</h2>
                <span className="rounded-full bg-[#e7efeb] px-3 py-1.5 text-xs font-semibold text-[#386458]">
                  {results.feedback.length} reviews
                </span>
              </div>

              {results.feedback.length === 0 ? (
                <p className="mt-5 rounded-xl bg-[#f6f8f7] p-5 text-sm text-[#65766f]">
                  No reviews have been submitted for this portfolio yet.
                </p>
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
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
