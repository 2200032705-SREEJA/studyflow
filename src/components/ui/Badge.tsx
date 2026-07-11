import clsx from "@/lib/clsx";

type Tone = "good" | "warn" | "missing" | "neutral";

const toneStyles: Record<Tone, string> = {
  good: "bg-pen-teal/10 text-pen-teal border-pen-teal/30",
  warn: "bg-amber/10 text-amber-dark border-amber/30",
  missing: "bg-pen-rose/10 text-pen-rose border-pen-rose/30",
  neutral: "bg-ink/5 text-ink dark:text-paper dark:bg-paper/10 border-ink/10 dark:border-paper/20"
};

const ratingToTone: Record<string, Tone> = {
  GOOD: "good",
  NEEDS_WORK: "warn",
  MISSING: "missing"
};

const ratingLabel: Record<string, string> = {
  GOOD: "Good",
  NEEDS_WORK: "Needs work",
  MISSING: "Missing"
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: "GOOD" | "NEEDS_WORK" | "MISSING" }) {
  return <Badge tone={ratingToTone[rating]}>{ratingLabel[rating]}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const label = status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  const tone: Tone = status === "COMPLETED" ? "good" : status === "NOT_STARTED" ? "neutral" : "warn";
  return <Badge tone={tone}>{label}</Badge>;
}
