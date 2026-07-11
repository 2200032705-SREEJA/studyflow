import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import clsx from "@/lib/clsx";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const assignments = await prisma.assignment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter((a) => a.status !== "COMPLETED" && a.status !== "NOT_STARTED").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome back, {session!.user?.name?.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-white/50">Let&apos;s continue your learning journey.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Total assignments" value={total} />
        <Stat label="In progress" value={inProgress} />
        <Stat label="Completed" value={completed} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your assignments</h2>
        <Link
          href="/assignments/new"
          className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium shadow-lg shadow-violet-900/40 hover:opacity-90"
        >
          + New assignment
        </Link>
      </div>

      <div className="mt-4">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
            <h3 className="text-lg font-semibold">No assignments yet</h3>
            <p className="mt-1.5 max-w-sm text-sm text-white/50">
              Create your first one to get an explanation, a study plan, a draft review, and viva prep.
            </p>
            <Link
              href="/assignments/new"
              className="mt-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium shadow-lg shadow-violet-900/40 hover:opacity-90"
            >
              Create your first assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {assignments.map((a) => (
              <Link key={a.id} href={`/assignments/${a.id}`}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/30 hover:bg-white/[0.05]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold">{a.title}</h3>
                      <p className="text-sm text-white/50">{a.subject}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-3 text-xs text-white/40">
                    {a.dueDate ? `Due ${new Date(a.dueDate).toLocaleDateString()}` : "No due date set"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  const tone =
    status === "COMPLETED"
      ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/30"
      : status === "NOT_STARTED"
        ? "bg-white/5 text-white/60 border-white/15"
        : "bg-violet-400/10 text-violet-300 border-violet-400/30";
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", tone)}>
      {label}
    </span>
  );
}