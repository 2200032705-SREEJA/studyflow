import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6 py-24">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-dark dark:text-amber-light">
          Explain → Plan → Review → Viva
        </span>
        <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold leading-[1.1] text-ink dark:text-paper">
          A smart way to understand, plan, improve, and prepare for your assignments.
        </h1>
        <p className="mt-5 max-w-md text-ink/70 dark:text-paper/70">
          StudyFlow never writes your assignment for you. It explains what&apos;s being asked, helps you plan the
          work, reviews your own draft honestly, and preps you to defend it out loud.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/register">
            <Button variant="primary">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
