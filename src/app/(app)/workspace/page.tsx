import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WorkspaceHistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const assignments = await prisma.assignment.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      explain: { select: { id: true }, take: 1 },
      plan: { select: { id: true }, take: 1 },
      review: { select: { id: true }, take: 1 },
      viva: { select: { id: true }, take: 1 }
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Workspace history</h1>
      <p className="mt-1 text-sm text-white/50">
        Every stage is saved permanently — reopen any assignment to see it instantly, no regeneration needed.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
            <h3 className="text-lg font-semibold">Nothing here yet</h3>
            <p className="mt-1.5 max-w-sm text-sm text-white/50">
              Assignments you create will show their stage completion here.
            </p>
            <Link
              href="/assignments/new"
              className="mt-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium shadow-lg shadow-violet-900/40 hover:opacity-90"
            >
              Create an assignment
            </Link>
          </div>
        ) : (
          assignments.map((a) => (
            <Link key={a.id} href={`/assignments/${a.id}`}>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/30 hover:bg-white/[0.05]">
                <div>
                  <h3 className="text-base font-semibold">{a.title}</h3>
                  <p className="text-sm text-white/50">{a.subject}</p>
                </div>
                <div className="flex gap-3 text-xs text-white/50">
                  <StageMark label="Explain" done={a.explain.length > 0} />
                  <StageMark label="Plan" done={a.plan.length > 0} />
                  <StageMark label="Review" done={a.review.length > 0} />
                  <StageMark label="Viva" done={a.viva.length > 0} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function StageMark({ label, done }: { label: string; done: boolean }) {
  return (
    <span className={done ? "text-emerald-300" : "text-white/30"}>
      {label} {done ? "✅" : "⬜"}
    </span>
  );
}