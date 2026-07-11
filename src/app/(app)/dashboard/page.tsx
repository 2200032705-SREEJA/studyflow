import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <h1 className="font-display text-3xl text-ink dark:text-paper">
        Welcome back, {session!.user?.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-ink/60 dark:text-paper/60">Let&apos;s continue your learning journey.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Total assignments" value={total} />
        <Stat label="In progress" value={inProgress} />
        <Stat label="Completed" value={completed} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink dark:text-paper">Your assignments</h2>
        <Link href="/assignments/new">
          <Button variant="primary">+ New assignment</Button>
        </Link>
      </div>

      <div className="mt-4">
        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            description="Create your first one to get an explanation, a study plan, a draft review, and viva prep."
            action={
              <Link href="/assignments/new">
                <Button>Create your first assignment</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {assignments.map((a) => (
              <Link key={a.id} href={`/assignments/${a.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg text-ink dark:text-paper">{a.title}</h3>
                      <p className="text-sm text-ink/60 dark:text-paper/60">{a.subject}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-3 font-mono text-xs text-ink/50 dark:text-paper/50">
                    {a.dueDate ? `Due ${new Date(a.dueDate).toLocaleDateString()}` : "No due date set"}
                  </p>
                </Card>
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
    <Card>
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink dark:text-paper">{value}</p>
    </Card>
  );
}
