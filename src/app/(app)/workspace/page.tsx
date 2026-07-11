import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

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
      <h1 className="font-display text-3xl text-ink dark:text-paper">Workspace history</h1>
      <p className="mt-1 text-ink/60 dark:text-paper/60">
        Every stage is saved permanently — reopen any assignment to see it instantly, no regeneration needed.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {assignments.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Assignments you create will show their stage completion here."
            action={
              <Link href="/assignments/new">
                <Button>Create an assignment</Button>
              </Link>
            }
          />
        ) : (
          assignments.map((a) => (
            <Link key={a.id} href={`/assignments/${a.id}`}>
              <Card className="flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-display text-lg text-ink dark:text-paper">{a.title}</h3>
                  <p className="text-sm text-ink/60 dark:text-paper/60">{a.subject}</p>
                </div>
                <div className="flex gap-3 font-mono text-xs text-ink/60 dark:text-paper/60">
                  <StageMark label="Explain" done={a.explain.length > 0} />
                  <StageMark label="Plan" done={a.plan.length > 0} />
                  <StageMark label="Review" done={a.review.length > 0} />
                  <StageMark label="Viva" done={a.viva.length > 0} />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function StageMark({ label, done }: { label: string; done: boolean }) {
  return (
    <span className={done ? "text-pen-teal" : "text-ink/30 dark:text-paper/30"}>
      {label} {done ? "✅" : "⬜"}
    </span>
  );
}
