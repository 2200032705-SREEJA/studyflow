import { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink/15 dark:border-paper/15 px-6 py-14 text-center">
      <h3 className="font-display text-lg text-ink dark:text-paper">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink/60 dark:text-paper/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
