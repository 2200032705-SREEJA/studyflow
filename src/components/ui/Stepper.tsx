import clsx from "@/lib/clsx";

const STAGES = [
  { key: "NOT_STARTED", label: "Not started" },
  { key: "PLANNING", label: "Planning" },
  { key: "DRAFT_READY", label: "Draft ready" },
  { key: "REVIEWED", label: "Reviewed" },
  { key: "COMPLETED", label: "Completed" }
] as const;

// Styled like a margin checklist ticked off in pen — the recurring motif
// across StudyFlow rather than a generic progress bar.
export function Stepper({ status }: { status: string }) {
  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <ol className="flex w-full items-center">
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={stage.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-xs",
                  done && "border-pen-teal bg-pen-teal text-white",
                  current && "border-amber text-amber-dark dark:text-amber-light bg-transparent",
                  !done && !current && "border-ink/20 text-ink/30 dark:border-paper/20 dark:text-paper/30"
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={clsx(
                  "whitespace-nowrap text-[11px] font-mono",
                  current ? "text-amber-dark dark:text-amber-light" : "text-ink/50 dark:text-paper/50"
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={clsx(
                  "mx-2 h-px flex-1",
                  i < currentIndex ? "bg-pen-teal" : "bg-ink/15 dark:bg-paper/15"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
