import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the assignment if it exists and belongs to the current session's user.
 * Returns null (and the route should respond 401/404) otherwise.
 */
export async function getOwnedAssignment(assignmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { assignment: null, status: 401 as const };

  const userId = (session.user as { id: string }).id;
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, userId }
  });

  if (!assignment) return { assignment: null, status: 404 as const };
  return { assignment, status: 200 as const };
}
