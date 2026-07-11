"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus2, FolderKanban, UserRound } from "lucide-react";
import clsx from "@/lib/clsx";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assignments/new", label: "New assignment", icon: FilePlus2 },
  { href: "/workspace", label: "Workspace", icon: FolderKanban },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-white/10 bg-[#0b0a11] px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
          S
        </span>
        <span className="text-lg font-semibold text-white">StudyFlow</span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-200"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}