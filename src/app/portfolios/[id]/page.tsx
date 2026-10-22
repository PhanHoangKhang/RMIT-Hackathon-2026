"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTideCloak } from "@tidecloak/nextjs";

interface PortfolioSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}
interface Portfolio {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  role: string;
  duration: string;
  projectType: string;
  status: string;
  skills: string[];
  brief: string;
  context: string[];
  problemStatement: string;
  objectives: string[];
  audience: string[];
  constraints: string[];
  process: PortfolioSection[];
  solution: PortfolioSection[];
  outcomes: PortfolioSection[];
  learnings: string[];
  reviewerPrompts: string[];
  metricsNote: string;
}

const criteria = [
  { id: "problemUnderstanding", title: "Problem understanding", description: "How well does the work identify and address the problem?" },
  { id: "solutionQuality", title: "Quality of solution", description: "Is the proposed solution effective and well reasoned?" },
  { id: "execution", title: "Execution and craft", description: "How well is the work executed?" },
  { id: "communication", title: "Communication", description: "Is the work clearly explained and presented?" },
] as const;
type CriterionId = (typeof criteria)[number]["id"];
type Scores = Partial<Record<CriterionId, number>>;

function ContentSection({ section }: { section: PortfolioSection }) {
  return (
    <section className="border-b border-[#edf1ee] py-6 last:border-0">
      <h3 className="text-lg font-semibold tracking-tight">{section.heading}</h3>
      {section.paragraphs?.map((paragraph, index) => <p key={index} className="mt-3 text-sm leading-7 text-[#65766f]">{paragraph}</p>)}
      {section.bullets && <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-[#65766f] list-disc">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-[#65766f] list-disc">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function PortfolioReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { authenticated, login, logout, getValueFromIdToken, token, isInitializing, secureFetch } = useTideCloak();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [feedback, setFeedback] = useState("");
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const fetchPortfolio = useCallback(async () => {
    if (!authenticated || !token || !id) return;
    setLoadingPortfolio(true);
    setError("");
    try {
      const apiUrl = new URL(`/api/portfolios/${encodeURIComponent(id)}`, window.location.origin);
      const res = await secureFetch(apiUrl, { cache: "no-store" });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || `Failed to load portfolio (HTTP ${res.status}).`);
      if (!result?.data) throw new Error("The API returned an invalid portfolio response.");
      setPortfolio(result.data as Portfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load portfolio.");
    } finally {
      setLoadingPortfolio(false);
    }
  }, [authenticated, token, id, secureFetch]);

  useEffect(() => {
    if (isInitializing) return;
    if (!authenticated || !token) { setLoadingPortfolio(false); return; }
    void fetchPortfolio();
  }, [isInitializing, authenticated, token, fetchPortfolio]);

  const setScore = (criterion: CriterionId, score: number) => setScores((previous) => ({ ...previous, [criterion]: score }));
  const totalScore = criteria.reduce((total, criterion) => total + (scores[criterion.id] ?? 0), 0);
  const completedCriteria = criteria.filter((criterion) => scores[criterion.id] !== undefined).length;

  const handleSubmit = async () => {
    if (!token || !portfolio) return;
    if (completedCriteria !== criteria.length) { setStatus("Please score all four criteria before submitting."); return; }
    if (!feedback.trim()) { setStatus("Please add written feedback before submitting."); return; }
    setSubmitting(true); setStatus(""); setError("");
    try {
      const apiUrl = new URL("/api/reviews", window.location.origin);
      const res = await secureFetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: portfolio.id, scores, feedback: feedback.trim() }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || `Failed to submit review (HTTP ${res.status}).`);
      setStatus("Review submitted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isInitializing) return <main className="grid min-h-screen place-items-center bg-[#f6f8f7]"><p className="text-sm text-[#65766f]">Restoring your session...</p></main>;

  if (!authenticated) {
    return <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-5"><div className="w-full max-w-md rounded-2xl border border-[#dce7e2] bg-white p-8 text-center"><h1 className="text-2xl font-bold text-[#193b35]">BlindReview</h1><p className="mt-3 text-sm text-[#65766f]">Sign in to review this portfolio.</p><button onClick={login} className="mt-6 w-full rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white hover:bg-[#174d41]">Sign in with TideCloak</button></div></main>;
  }

  const username = getValueFromIdToken("preferred_username");

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#193b35]">
      <header className="border-b border-[#e4ebe7] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d6353] text-xl text-white">B</span><span>BlindReview</span></Link>
          <div className="flex items-center gap-3"><span className="hidden max-w-40 truncate text-sm text-[#65766f] sm:block">{username || "Reviewer"}</span><button onClick={logout} className="rounded-lg border border-[#dce6e0] px-3 py-2 text-sm hover:bg-[#f6f8f7]">Logout</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/" className="text-sm font-medium text-[#1d7059] hover:underline">← Back to portfolios</Link>

        {loadingPortfolio ? <div className="mt-8 rounded-2xl border border-[#e1e9e4] bg-white p-8"><p className="text-sm text-[#65766f]">Loading portfolio...</p></div>
        : error && !portfolio ? <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6"><h1 className="text-lg font-semibold text-red-800">Could not load portfolio</h1><p className="mt-2 break-words text-sm text-red-700">{error}</p><button onClick={() => void fetchPortfolio()} className="mt-5 rounded-lg bg-[#1d6353] px-4 py-2 text-sm font-semibold text-white">Try again</button></div>
        : portfolio ? <>
          <section className="mt-7 overflow-hidden rounded-2xl border border-[#e1e9e4] bg-white">
            <div className="bg-[#173f35] px-6 py-8 text-white sm:px-9 sm:py-10">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold">{portfolio.category}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">{portfolio.id}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">{portfolio.projectType}</span>
              </div>
              <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#b6d8c8]">ANONYMOUS CASE STUDY</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">{portfolio.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-white/80">{portfolio.subtitle}</p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">{portfolio.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#e1e9e4] sm:grid-cols-4">
              {[["Role", portfolio.role], ["Duration", portfolio.duration], ["Category", portfolio.category], ["Status", portfolio.status]].map(([label, value]) => <div key={label} className="bg-white p-4 sm:p-5"><p className="text-xs text-[#89968f]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}
            </div>
            <div className="p-6 sm:p-9">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div><p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">PROJECT BRIEF</p><p className="mt-3 text-sm leading-7 text-[#526a60]">{portfolio.brief}</p></div>
                <aside className="rounded-xl bg-[#f6f8f7] p-5"><h2 className="text-sm font-semibold">Skills demonstrated</h2><div className="mt-3 flex flex-wrap gap-2">{portfolio.skills.map((skill) => <span key={skill} className="rounded-lg border border-[#e1e9e4] bg-white px-2.5 py-1.5 text-xs text-[#587066]">{skill}</span>)}</div></aside>
              </div>
              <div className="mt-6 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4"><p className="text-sm font-semibold text-[#245b47]">Blind review reminder</p><p className="mt-1 text-sm leading-6 text-[#60766c]">Evaluate the evidence, reasoning, and craft—not the candidate's identity. This is synthetic demo content; proposed outcomes are not presented as measured achievements.</p></div>
            </div>
          </section>

          <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">01 · UNDERSTAND</p>
                <h2 className="mt-2 text-2xl font-semibold">Context and problem</h2>
                <div className="mt-5 space-y-3">{portfolio.context.map((item, index) => <p key={index} className="text-sm leading-7 text-[#65766f]">{item}</p>)}</div>
                <div className="mt-5 rounded-xl bg-[#f6f8f7] p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#89968f]">Problem statement</p><p className="mt-2 text-base font-medium leading-7">{portfolio.problemStatement}</p></div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div><h3 className="font-semibold">Objectives</h3><BulletList items={portfolio.objectives} /></div>
                  <div><h3 className="font-semibold">Audience</h3><BulletList items={portfolio.audience} /></div>
                </div>
                <div className="mt-6"><h3 className="font-semibold">Constraints and assumptions</h3><BulletList items={portfolio.constraints} /></div>
              </section>

              <section className="rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">02 · EXPLORE</p>
                <h2 className="mt-2 text-2xl font-semibold">Process and methodology</h2>
                <p className="mt-2 text-sm leading-6 text-[#65766f]">Review whether the approach fits the problem, whether assumptions are visible, and whether the proposed validation can support the conclusions.</p>
                <div className="mt-3">{portfolio.process.map((section) => <ContentSection key={section.heading} section={section} />)}</div>
              </section>

              <section className="rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">03 · BUILD</p>
                <h2 className="mt-2 text-2xl font-semibold">Proposed solution</h2>
                <div className="mt-3">{portfolio.solution.map((section) => <ContentSection key={section.heading} section={section} />)}</div>
              </section>

              <section className="rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">04 · VALIDATE</p>
                <h2 className="mt-2 text-2xl font-semibold">Outcomes and evaluation</h2>
                <div className="mt-3">{portfolio.outcomes.map((section) => <ContentSection key={section.heading} section={section} />)}</div>
                <div className="mt-5 rounded-xl border border-[#f0dfb6] bg-[#fff9eb] p-4"><p className="text-sm font-semibold text-[#785b22]">Evidence and limitations</p><p className="mt-1 text-sm leading-6 text-[#796b4b]">{portfolio.metricsNote}</p></div>
              </section>

              <section className="rounded-2xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">05 · REFLECT</p>
                <h2 className="mt-2 text-2xl font-semibold">Learnings and next steps</h2>
                <BulletList items={portfolio.learnings} />
                <div className="mt-6 rounded-xl bg-[#f6f8f7] p-5"><h3 className="font-semibold">Questions to consider during review</h3><BulletList items={portfolio.reviewerPrompts} /></div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-[#e1e9e4] bg-white p-6 lg:sticky lg:top-6">
              <p className="text-xs font-bold tracking-[0.18em] text-[#c25e43]">REVIEW FORM</p>
              <h2 className="mt-2 text-xl font-semibold">Evaluate this submission</h2>
              <p className="mt-2 text-sm leading-6 text-[#65766f]">Score each criterion from 1 to 5. All four scores and written feedback are required.</p>
              <div className="mt-6 space-y-5">
                {criteria.map((criterion, index) => <div key={criterion.id} className="border-b border-[#edf1ee] pb-5 last:border-0"><div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eaf5ef] text-sm font-semibold text-[#267256]">{index + 1}</span><div><h3 className="text-sm font-semibold">{criterion.title}</h3><p className="mt-1 text-xs leading-5 text-[#75847e]">{criterion.description}</p></div></div><div className="mt-3 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((score) => { const selected = scores[criterion.id] === score; return <button key={score} type="button" aria-label={`${criterion.title}: ${score} out of 5`} aria-pressed={selected} onClick={() => setScore(criterion.id, score)} className={`grid h-10 w-10 place-items-center rounded-lg border text-sm font-semibold transition ${selected ? "border-[#1d6353] bg-[#1d6353] text-white" : "border-[#dce6e0] bg-white text-[#35584c] hover:border-[#1d6353]"}`}>{score}</button>; })}</div><p className="mt-2 text-[11px] text-[#89968f]">1 = Needs improvement · 5 = Excellent</p></div>)}
              </div>
              <div className="mt-2"><label htmlFor="feedback" className="text-sm font-semibold">Written feedback</label><p className="mt-1 text-xs leading-5 text-[#75847e]">Mention a specific strength and one actionable improvement.</p><textarea id="feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={6} maxLength={5000} placeholder="What is well reasoned? What evidence or detail is missing?" className="mt-3 w-full resize-y rounded-xl border border-[#dce6e0] bg-white p-3 text-sm leading-6 outline-none focus:border-[#1d6353] focus:ring-2 focus:ring-[#1d6353]/10" /><p className="mt-1 text-right text-xs text-[#89968f]">{feedback.length}/5000</p></div>
              <div className="mt-5 rounded-xl bg-[#f6f8f7] p-4"><div className="flex items-baseline justify-between"><p className="text-sm text-[#65766f]">Total score</p><p className="text-2xl font-semibold">{totalScore}<span className="text-sm text-[#89968f]"> / 20</span></p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe8e3]"><div className="h-full rounded-full bg-[#1d6353] transition-all" style={{ width: `${(totalScore / 20) * 100}%` }} /></div><div className="mt-3 flex justify-between text-xs"><span className="text-[#65766f]">Criteria scored</span><span className="font-semibold">{completedCriteria}/4</span></div></div>
              {error && <p role="alert" className="mt-4 break-words rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {status && <p role="status" className="mt-4 rounded-lg bg-[#eaf5ef] p-3 text-sm text-[#245b47]">{status}</p>}
              <button type="button" onClick={handleSubmit} disabled={submitting || completedCriteria !== criteria.length || !feedback.trim()} className="mt-5 w-full rounded-lg bg-[#1d6353] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174d41] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting..." : "Submit review"}</button>
              <p className="mt-3 text-xs leading-5 text-[#89968f]">The server must independently validate reviewer permissions, scores, and portfolio ID before saving a review.</p>
            </aside>
          </div>
        </> : null}
      </div>
    </main>
  );
}
