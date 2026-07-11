"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "@/lib/clsx";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assignments/new", label: "New assignment" },
  { href: "/workspace", label: "Workspace" },
  { href: "/profile", label: "Profile" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col justify-between border-r border-ink/10 dark:border-paper/10 bg-paper-dim dark:bg-ink px-4 py-6">
      <div>
        <div className="mb-8 px-2">
          <span className="font-display text-xl font-semibold text-ink dark:text-paper">StudyFlow</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-card px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-amber/15 text-amber-dark dark:text-amber-light"
                    : "text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <ThemeToggle />
    </aside>
  );
}
