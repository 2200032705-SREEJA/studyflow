import Link from "next/link";
import Image from "next/image";
import { Sparkles, BookOpenCheck, CalendarClock, LineChart, Mic2, FileQuestion, ListChecks, PenLine, MessageSquareText } from "lucide-react";

const howItWorks = [
  {
    icon: FileQuestion,
    step: "01",
    title: "Explain",
    description: "Upload or paste your assignment. AI breaks down what's actually being asked."
  },
  {
    icon: ListChecks,
    step: "02",
    title: "Plan",
    description: "Get a step-by-step study plan with deadlines so you're never scrambling."
  },
  {
    icon: PenLine,
    step: "03",
    title: "Review",
    description: "Upload your own draft and get honest AI feedback before you submit."
  },
  {
    icon: MessageSquareText,
    step: "04",
    title: "Viva",
    description: "Practice answering viva questions out loud and build real confidence."
  }
];

const features = [
  {
    icon: BookOpenCheck,
    title: "Smart Explain",
    description: "AI explains your assignments step by step, in plain language."
  },
  {
    icon: CalendarClock,
    title: "Study Planner",
    description: "Plan, schedule, and manage your time like a pro."
  },
  {
    icon: LineChart,
    title: "Improve & Review",
    description: "Get AI feedback and improve your drafts before you submit."
  },
  {
    icon: Mic2,
    title: "Viva Practice",
    description: "Practice viva questions with AI and boost your confidence."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#08070d] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold">
              S
            </span>
            <span className="text-lg font-semibold">StudyFlow</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <Link href="#" className="hover:text-white">Home</Link>
            <Link href="#features" className="hover:text-white">Features</Link>
            <Link href="#how" className="hover:text-white">How it Works</Link>
          </div>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium shadow-lg shadow-violet-900/40 hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>

        {/* Hero */}
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI Powered
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              Your AI Copilot for{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Smarter Study
              </span>
            </h1>
            <p className="mt-5 max-w-md text-white/60">
              Understand, plan, improve and ace your assignments with the power of AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium shadow-lg shadow-violet-900/40 hover:opacity-90"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/5"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-full bg-violet-600/25 blur-[100px]" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-violet-950/50">
              <Image
                src="/hero-student.png"
                alt="Student studying with AI-powered tools"
                width={800}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="absolute left-3 top-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md shadow-lg shadow-violet-950/40">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs">
                ✦
              </span>
              <span className="text-xs font-medium text-white/90">AI Explain</span>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how" className="py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">How it Works</h2>
            <p className="mt-2 text-sm text-white/50">Four simple steps from confusion to a finished, defensible assignment.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="text-xs font-mono text-violet-400/70">{s.step}</span>
                <span className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Everything you need to excel</h2>
            <p className="mt-2 text-sm text-white/50">One platform. All the tools.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/30 hover:bg-white/[0.05]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}