import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceClient } from "./WorkspaceClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssignmentPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const assignment = await prisma.assignment.findFirst({
    where: { id, userId },
  });

  if (!assignment) notFound();

  const [explain, plan, review, viva] = await Promise.all([
    prisma.explainResult.findFirst({
      where: { assignmentId: assignment.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.planResult.findFirst({
      where: { assignmentId: assignment.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reviewResult.findFirst({
      where: { assignmentId: assignment.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vivaResult.findFirst({
      where: { assignmentId: assignment.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <WorkspaceClient
      assignment={JSON.parse(JSON.stringify(assignment))}
      initialExplain={explain ? JSON.parse(JSON.stringify(explain)) : null}
      initialPlan={plan ? JSON.parse(JSON.stringify(plan)) : null}
      initialReview={review ? JSON.parse(JSON.stringify(review)) : null}
      initialViva={viva ? JSON.parse(JSON.stringify(viva)) : null}
    />
  );
}