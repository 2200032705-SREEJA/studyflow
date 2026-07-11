export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber/30 border-t-amber" />
      {label && <p className="font-mono text-xs text-ink/50 dark:text-paper/50">{label}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/10 dark:bg-paper/10 ${className ?? "h-4 w-full"}`} />;
}
