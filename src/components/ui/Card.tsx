import { HTMLAttributes } from "react";
import clsx from "@/lib/clsx";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-card border border-ink/10 bg-white/80 dark:bg-ink-light/60 dark:border-paper/10 p-5 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
