"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { RatingBadge } from "@/components/ui/Badge";
import { FileUpload } from "@/components/ui/FileUpload";
import { MermaidDiagram } from "@/components/ui/MermaidDiagram";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  question: string;
  dueDate: string | null;
  status: string;
}

const STATUS_OPTIONS = ["NOT_STARTED", "PLANNING", "DRAFT_READY", "REVIEWED", "COMPLETED"];

export function WorkspaceClient({
  assignment,
  initialExplain,
  initialPlan,
  initialReview,
  initialViva
}: {
  assignment: Assignment;
  initialExplain: { content: any; depth?: string } | null;
  initialPlan: { content: any } | null;
  initialReview: any | null;
  initialViva: { content: any } | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(assignment.status);
  const [dueDate, setDueDate] = useState(assignment.dueDate ? assignment.dueDate.slice(0, 10) : "");

  async function updateStatus(next: string) {
    setStatus(next);
    await fetch(`/api/assignments/${assignment.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next })
    });
    router.refresh();
  }

  async function updateDueDate(next: string) {
    setDueDate(next);
    await fetch(`/api/assignments/${assignment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: next || null })
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink dark:text-paper">{assignment.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-ink/60 dark:text-paper/60">
            <span>{assignment.subject}</span>
            <span>·</span>
            <label className="flex items-center gap-1.5 text-xs font-mono">
              Due
              <input
                type="date"
                value={dueDate}
                onChange={(e) => updateDueDate(e.target.value)}
                className="rounded border border-ink/15 dark:border-paper/20 bg-transparent px-1.5 py-0.5 text-xs outline-none focus:border-amber"
              />
            </label>
          </div>
        </div>
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-1.5 font-mono text-xs"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <Stepper status={status} />
      </div>

      <Card className="mt-8">
        <Tabs
          tabs={[
            { id: "explain", label: "01 · Explain", content: <ExplainTab assignment={assignment} initial={initialExplain} /> },
            { id: "plan", label: "02 · Plan", content: <PlanTab assignment={assignment} initial={initialPlan} /> },
            { id: "review", label: "03 · Review", content: <ReviewTab assignment={assignment} initial={initialReview} /> },
            { id: "viva", label: "04 · Viva", content: <VivaTab assignment={assignment} initial={initialViva} /> }
          ]}
        />
      </Card>
    </div>
  );
}

function GenerateBar({
  hasResult,
  loading,
  onGenerate,
  emptyLabel
}: {
  hasResult: boolean;
  loading: boolean;
  onGenerate: () => void;
  emptyLabel: string;
}) {
  if (loading) return <Loader label="Generating…" />;
  if (!hasResult) {
    return (
      <EmptyState
        title={emptyLabel}
        action={<Button onClick={onGenerate}>Generate</Button>}
      />
    );
  }
  return (
    <div className="flex justify-end">
      <Button variant="ghost" onClick={onGenerate}>
        ↻ Regenerate
      </Button>
    </div>
  );
}

const EXPLAIN_DEPTH_OPTIONS: { value: "quick" | "standard" | "deep-dive"; label: string }[] = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "deep-dive", label: "Deep Dive" },
];

function ExplainTab({ assignment, initial }: { assignment: Assignment; initial: { content: any; depth?: string } | null }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<"quick" | "standard" | "deep-dive">(
    (initial?.depth as "quick" | "standard" | "deep-dive") ?? "standard"
  );

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/assignments/${assignment.id}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depth }),
    });
    setLoading(false);
    if (!res.ok) return setError((await res.json()).error ?? "Failed to generate.");
    setData(await res.json());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">Depth</span>
        <div className="flex gap-1">
          {EXPLAIN_DEPTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDepth(opt.value)}
              disabled={loading}
              className={`rounded px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                depth === opt.value
                  ? "bg-amber text-ink dark:bg-amber-light"
                  : "bg-ink/5 text-ink/60 hover:bg-ink/10 dark:bg-paper/10 dark:text-paper/60 dark:hover:bg-paper/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <GenerateBar hasResult={!!data} loading={loading} onGenerate={generate} emptyLabel="No explanation yet — generate one to see what your teacher is really asking." />
      {error && <p className="text-xs text-pen-rose">{error}</p>}
      {data && !loading && (
        <div className="flex flex-col gap-5">
          <Section title="What the teacher is asking">
            <p className="text-sm text-ink/80 dark:text-paper/80">{data.content.whatIsAsked}</p>
          </Section>
          <Section title="Key concepts">
            <div className="flex flex-col gap-3">
              {data.content.keyConcepts?.map((c: any, i: number) => (
                <ConceptCard key={i} assignmentId={assignment.id} concept={c} />
              ))}
            </div>
          </Section>
          <Section title="Common mistakes">
            <div className="flex flex-col gap-3">
              {data.content.commonMistakes?.map((c: any, i: number) => (
                <div key={i}>
                  <p className="text-sm font-medium text-ink dark:text-paper">{c.mistake}</p>
                  <p className="mt-0.5 text-sm text-ink/80 dark:text-paper/80">{c.whyItHappens}</p>
                  <p className="mt-0.5 text-sm text-pen-teal dark:text-pen-teal">→ {c.howToAvoid}</p>
                </div>
              ))}
            </div>
          </Section>
          {data.content.resources?.length > 0 && (
          <Section title="Suggested resources">
            <ul className="flex flex-col gap-1 text-sm text-ink/80 dark:text-paper/80">
              {data.content.resources?.map((r: any, i: number) => {
                const isVideo = r.type === "video";
                const href = r.searchQuery
                  ? isVideo
                    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(r.searchQuery)}`
                    : `https://www.google.com/search?q=${encodeURIComponent(r.searchQuery)}`
                  : null;
                return (
                  <li
  key={i}
  className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-3"
>
                    {isVideo && <span className="mr-1 text-xs">▶</span>}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-amber-dark underline hover:text-amber dark:text-amber-light"
                      >
                        <>
  {isVideo ? "🎥 " : "📄 "}
  {r.title}
</>
                      </a>
                    ) : (
                      <span className="font-medium">{r.title}</span>
                    )}{" "}
                    — {r.note}
                  </li>
                );
              })}
            </ul>
          </Section>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={generate}>
              ↻ Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** One key-concept card: short explanation + diagram (if any) + on-demand "explain more". */
function ConceptCard({ assignmentId, concept }: { assignmentId: string; concept: any }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elaboration, setElaboration] = useState<{ deeperExplanation: string; additionalExample: string } | null>(null);

  async function handleExplainMore() {
    if (elaboration) {
      setExpanded((v) => !v);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/assignments/${assignmentId}/explain/elaborate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept: concept.name, currentExplanation: concept.explanation })
    });
    setLoading(false);
    if (!res.ok) return setError((await res.json()).error ?? "Failed to load more detail.");
    setElaboration(await res.json());
    setExpanded(true);
  }

  return (
    <div className="rounded border border-ink/10 p-3 dark:border-paper/10">
      <p className="text-sm font-medium text-ink dark:text-paper">{concept.name}</p>
      <p className="mt-0.5 text-sm text-ink/80 dark:text-paper/80">{concept.explanation}</p>
      {concept.example && (
        <pre className="mt-1 whitespace-pre-wrap rounded bg-ink/5 p-2 font-mono text-xs text-ink/70 dark:bg-paper/10 dark:text-paper/70">
          {concept.example}
        </pre>
      )}
      {concept.diagram && <MermaidDiagram code={concept.diagram} />}
      {concept.images?.length > 0 && (
  <div className="mt-4 rounded-lg border p-3">
    <h4 className="font-semibold mb-2">📷 Visual References</h4>

    <div className="space-y-2">
      {concept.images.map((image, index) => (
        <a
          key={index}
          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(image.searchQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600 hover:underline"
        >
          🖼 {image.title}
        </a>
      ))}
    </div>
  </div>
)}
      <button
        onClick={handleExplainMore}
        disabled={loading}
        className="mt-2 font-mono text-xs uppercase tracking-wide text-amber-dark hover:underline disabled:opacity-50 dark:text-amber-light"
      >
        {loading ? "Loading…" : expanded ? "↑ Show less" : "↓ Explain more"}
      </button>
      {error && <p className="mt-1 text-xs text-pen-rose">{error}</p>}

      {expanded && elaboration && (
        <div className="mt-2 border-l-2 border-amber pl-3">
          <p className="text-sm text-ink/80 dark:text-paper/80">{elaboration.deeperExplanation}</p>
          {elaboration.additionalExample && (
            <pre className="mt-1 whitespace-pre-wrap rounded bg-ink/5 p-2 font-mono text-xs text-ink/70 dark:bg-paper/10 dark:text-paper/70">
              {elaboration.additionalExample}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function PlanTab({ assignment, initial }: { assignment: Assignment; initial: { content: any } | null }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/assignments/${assignment.id}/plan`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return setError((await res.json()).error ?? "Failed to generate.");
    setData(await res.json());
  }

  return (
    <div className="flex flex-col gap-4">
      <GenerateBar hasResult={!!data} loading={loading} onGenerate={generate} emptyLabel="No plan yet — generate a study and completion plan." />
      {error && <p className="text-xs text-pen-rose">{error}</p>}
      {data && !loading && (
        <div className="flex flex-col gap-5">
          <Section title="Topics to study">
            <ul className="list-disc pl-5 text-sm text-ink/80 dark:text-paper/80">
              {data.content.topicsToStudy?.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </Section>
          <Section title="Step-by-step plan">
            <ol className="list-decimal pl-5 text-sm text-ink/80 dark:text-paper/80">
              {data.content.steps?.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ol>
          </Section>
          <Section title={`Estimated time: ${data.content.estimatedHours} hours`}>
            <div className="flex flex-col gap-1 text-sm text-ink/80 dark:text-paper/80">
              {data.content.dailyChecklist?.map((d: any, i: number) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="checkbox" className="accent-amber" />
                  <span className="font-mono text-xs text-ink/50 dark:text-paper/50">{d.day}</span> {d.task}
                </label>
              ))}
            </div>
          </Section>
          <Section title="Timeline">
            <ul className="flex flex-col gap-1 text-sm text-ink/80 dark:text-paper/80">
              {data.content.timeline?.map((t: any, i: number) => (
                <li key={i}>
                  <span className="font-mono text-xs text-amber-dark dark:text-amber-light">{t.date}</span> — {t.milestone}
                </li>
              ))}
            </ul>
          </Section>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={generate}>
              ↻ Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewTab({ assignment, initial }: { assignment: Assignment; initial: any | null }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function generate() {
    if (!draftText.trim()) {
      setError("Paste your draft text (or the text from your uploaded PDF) before reviewing.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/assignments/${assignment.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftText, uploadedFileUrl: fileUrl })
    });
    setLoading(false);
    if (!res.ok) return setError((await res.json()).error ?? "Failed to review draft.");
    setData(await res.json());
  }

  if (loading) return <Loader label="Reviewing your draft…" />;

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState title="No review yet" description="Upload or paste your own draft below to get honest, qualitative feedback." />
        <div>
          <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">Upload draft (PDF)</label>
          <FileUpload onUploaded={(f) => setFileUrl(f.url)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">
            Paste your draft text
          </label>
          <textarea
            rows={8}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
            placeholder="Paste the text of your own completed draft here."
          />
        </div>
        {error && <p className="text-xs text-pen-rose">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={generate}>Review my draft</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-3">
        <RatingCard label="Grammar" rating={data.grammarRating} />
        <RatingCard label="Structure" rating={data.structureRating} />
        <RatingCard label="Formatting" rating={data.formattingRating} />
        <RatingCard label="References" rating={data.referencesRating} />
      </div>
      <Section title="Feedback and suggestions">
        <p className="text-sm text-ink/80 dark:text-paper/80">{data.feedback}</p>
      </Section>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            setData(null);
          }}
        >
          ↻ Review a new draft
        </Button>
      </div>
    </div>
  );
}

function VivaTab({ assignment, initial }: { assignment: Assignment; initial: { content: any } | null }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/assignments/${assignment.id}/viva`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return setError((await res.json()).error ?? "Failed to generate.");
    setData(await res.json());
  }

  return (
    <div className="flex flex-col gap-4">
      <GenerateBar hasResult={!!data} loading={loading} onGenerate={generate} emptyLabel="No viva prep yet — generate likely questions to defend your work." />
      {error && <p className="text-xs text-pen-rose">{error}</p>}
      {data && !loading && (
        <div className="flex flex-col gap-5">
          <Section title="Possible viva questions">
            <div className="flex flex-col gap-4">
              {data.content.questions?.map((q: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink dark:text-paper">
                      {i + 1}. {q.question}
                    </p>
                    {q.difficulty && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                          q.difficulty === "probing"
                            ? "bg-pen-rose/15 text-pen-rose"
                            : q.difficulty === "applied"
                            ? "bg-amber/15 text-amber-dark dark:text-amber-light"
                            : "bg-pen-teal/15 text-pen-teal"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">{q.modelAnswer}</p>
                  {q.followUp && (
                    <p className="mt-1 text-sm italic text-ink/50 dark:text-paper/50">
                      Follow-up if that's too shallow: "{q.followUp}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
          <Section title="Key concepts to know">
            <ul className="list-disc pl-5 text-sm text-ink/80 dark:text-paper/80">
              {data.content.keyConcepts?.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </Section>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={generate}>
              ↻ Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-dark dark:text-amber-light">
        {title}
      </h3>
      {children}
    </div>
  );
}

function RatingCard({ label, rating }: { label: string; rating: "GOOD" | "NEEDS_WORK" | "MISSING" }) {
  return (
    <Card className="flex flex-col items-start gap-2">
      <span className="font-mono text-xs text-ink/50 dark:text-paper/50">{label}</span>
      <RatingBadge rating={rating} />
    </Card>
  );
}