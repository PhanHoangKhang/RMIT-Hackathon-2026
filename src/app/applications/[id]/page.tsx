"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useApi, useMe, type ApplicationView, type CycleState } from "@/lib/client";
import { IdentityReveal } from "@/components/IdentityReveal";
import { Page } from "@/components/ui";

type Scores = Record<string, number>;

export default function PortfolioReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { api } = useApi();
  const me = useMe();

  const [portfolio, setPortfolio] = useState<ApplicationView | null>(null);
  const [state, setState] = useState<CycleState | null>(null);
  const [readPolicy, setReadPolicy] = useState<string | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [one, cycle, policies] = await Promise.all([
        api<{ application: ApplicationView; myScore: { scores: Scores; feedback: string } | null }>(
          `/api/applications/${encodeURIComponent(id)}`
        ),
        api<CycleState>("/api/cycle"),
        api<{ read: string | null }>("/api/policies"),
      ]);
      setPortfolio(one.application);
      setState(cycle);
      setReadPolicy(policies.read);
      if (one.myScore) {
        setScores(one.myScore.scores);
        setFeedback(one.myScore.feedback);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load portfolio.");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    if (me) void load();
  }, [me, load]);

  const criteria = state?.cycle.criteria ?? [];
  const locked = !!state?.cycle.scoresLockedAt;
  const canScore = !!me?.roles.includes("reviewer") && !locked;
  const max = criteria.reduce((t, c) => t + c.max, 0);
  const totalScore = criteria.reduce((t, c) => t + (scores[c.id] ?? 0), 0);
  const completed = criteria.filter((c) => scores[c.id] !== undefined).length;

  const handleSubmit = async () => {
    if (!portfolio) return;
    if (completed !== criteria.length) return setStatus(`Please score all ${criteria.length} criteria before submitting.`);
    if (!feedback.trim()) return setStatus("Please add written feedback before submitting.");
    setSubmitting(true);
    setStatus("");
    setError("");
    try {
      await api("/api/scores", {
        method: "POST",
        body: JSON.stringify({ applicationId: portfolio.id, scores, feedback: feedback.trim() }),
      });
      setStatus("Review submitted. You can update it until the admin locks scores.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page me={me}>
      <Link href="/review" className="text-sm font-medium text-[#1d7059] hover:underline">← Back to review queue</Link>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-[#e1e9e4] bg-white p-8">
          <p className="text-sm text-[#65766f]">Loading portfolio...</p>
        </div>
      ) : error && !portfolio ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-red-800">Could not load portfolio</h1>
          <p className="mt-2 break-words text-sm text-red-700">{error}</p>
          <button onClick={() => void load()} className="mt-5 rounded-lg bg-[#1d6353] px-4 py-2 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      ) : portfolio ? (
        <>
          <section className="mt-7 rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              {portfolio.category && (
                <span className="rounded-full bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#267256]">{portfolio.category}</span>
              )}
              <span className="rounded-full bg-[#f4f5f4] px-3 py-1.5 text-xs text-[#65766f]">{portfolio.label}</span>
              <span className="rounded-full bg-[#fdf3df] px-3 py-1.5 text-xs font-medium text-[#8a6420]">
                {locked ? "Scores locked" : "Open for review"}
              </span>
            </div>

            {portfolio.workSamples.map((s, i) => (
              <div key={i} className={i === 0 ? "" : "mt-8 border-t border-[#edf1ee] pt-6"}>
                <h1 className={`${i === 0 ? "mt-5 text-3xl sm:text-4xl" : "text-xl"} font-semibold tracking-tight`}>{s.title}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#65766f]">{s.description}</p>
              </div>
            ))}

            {portfolio.brief && (
              <div className="mt-6 rounded-xl bg-[#f6f8f7] p-5">
                <h2 className="text-sm font-semibold">Project brief</h2>
                <p className="mt-2 text-sm leading-6 text-[#65766f]">{portfolio.brief}</p>
              </div>
            )}

            {portfolio.skills.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {portfolio.skills.map((skill) => (
                    <span key={skill} className="rounded-lg border border-[#e4ebe6] bg-[#fafcfb] px-3 py-2 text-xs text-[#587066]">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4">
              <p className="text-sm font-semibold text-[#245b47]">Applicant identity</p>
              <p className="mb-3 mt-1 text-sm leading-6 text-[#60766c]">
                Encrypted by the applicant. Try to reveal it: before 2 of 3 panel members approve, the Tide network
                refuses everyone, including you.
              </p>
              <IdentityReveal ciphertext={portfolio.identityCiphertext} readPolicy={readPolicy} />
            </div>
          </section>

          {me?.roles.includes("reviewer") && (
            <section className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">REVIEW FORM</p>
                <h2 className="mt-2 text-2xl font-semibold">Evaluate this submission</h2>
                <p className="mt-2 text-sm leading-6 text-[#65766f]">
                  Score each criterion from 1 to 5. All {criteria.length} scores and written feedback are required.
                </p>

                <div className="mt-7 space-y-6">
                  {criteria.map((criterion, index) => (
                    <div key={criterion.id} className="border-b border-[#edf1ee] pb-6 last:border-0">
                      <div className="flex gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eaf5ef] text-sm font-semibold text-[#267256]">{index + 1}</span>
                        <div>
                          <h3 className="font-semibold">{criterion.label}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#75847e]">{criterion.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from({ length: criterion.max }, (_, i) => i + 1).map((score) => {
                          const selected = scores[criterion.id] === score;
                          return (
                            <button
                              key={score}
                              type="button"
                              aria-pressed={selected}
                              disabled={!canScore}
                              onClick={() => setScores((p) => ({ ...p, [criterion.id]: score }))}
                              className={`grid h-11 w-11 place-items-center rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                selected ? "border-[#1d6353] bg-[#1d6353] text-white" : "border-[#dce6e0] bg-white text-[#35584c] hover:border-[#1d6353]"
                              }`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-[#89968f]">1 = Needs improvement · 5 = Excellent</p>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <label htmlFor="feedback" className="text-sm font-semibold">Written feedback</label>
                  <p className="mt-1 text-sm text-[#75847e]">Explain strengths and suggest actionable improvements.</p>
                  <textarea
                    id="feedback"
                    value={feedback}
                    disabled={!canScore}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    maxLength={5000}
                    placeholder="What worked well? What could be improved?"
                    className="mt-3 w-full resize-y rounded-xl border border-[#dce6e0] bg-white p-4 text-sm leading-6 outline-none focus:border-[#1d6353] focus:ring-2 focus:ring-[#1d6353]/10 disabled:opacity-60"
                  />
                  <p className="mt-1 text-right text-xs text-[#89968f]">{feedback.length}/5000</p>
                </div>
              </div>

              <aside className="h-fit rounded-2xl border border-[#e1e9e4] bg-white p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-semibold">Review summary</h2>
                <div className="mt-5 rounded-xl bg-[#f6f8f7] p-5">
                  <p className="text-sm text-[#65766f]">Total score</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold">{totalScore}</span>
                    <span className="text-sm text-[#89968f]">/ {max}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe8e3]">
                    <div className="h-full rounded-full bg-[#1d6353] transition-all" style={{ width: `${max ? (totalScore / max) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#65766f]">Criteria scored</span>
                    <span className="font-semibold">{completed}/{criteria.length}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#65766f]">Feedback</span>
                    <span className="font-semibold">{feedback.trim() ? "Added" : "Required"}</span>
                  </div>
                </div>
                {error && <p role="alert" className="mt-5 break-words rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                {status && <p role="status" className="mt-5 rounded-lg bg-[#eaf5ef] p-3 text-sm text-[#245b47]">{status}</p>}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canScore || submitting || completed !== criteria.length || !feedback.trim()}
                  className="mt-6 w-full rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174d41] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {locked ? "Scores are locked" : submitting ? "Submitting..." : "Submit review"}
                </button>
                <p className="mt-3 text-xs leading-5 text-[#89968f]">
                  The server re-checks your reviewer role, every score and the feedback before saving.
                </p>
              </aside>
            </section>
          )}
        </>
      ) : null}
    </Page>
  );
}
