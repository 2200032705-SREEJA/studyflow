"use client";

import { useState, ReactNode } from "react";
import clsx from "@/lib/clsx";

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs, defaultTab }: { tabs: TabDef[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border-b border-ink/10 dark:border-paper/10" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              "relative px-4 py-3 font-mono text-sm tracking-wide transition-colors",
              active === tab.id
                ? "text-amber-dark dark:text-amber-light"
                : "text-ink/50 hover:text-ink dark:text-paper/50 dark:hover:text-paper"
            )}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-amber" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
