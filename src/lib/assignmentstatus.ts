/**
 * The assignment pipeline auto-advances as the student uses each feature:
 * Not Started → Planning → Draft ready → Reviewed happen automatically.
 * Completed is the one stage that stays manual (only the student can judge
 * that they're actually done), set via the status dropdown in the UI.
 */
export const STATUS_ORDER = ["NOT_STARTED", "PLANNING", "DRAFT_READY", "REVIEWED", "COMPLETED"] as const;
export type AssignmentStatusValue = (typeof STATUS_ORDER)[number];

/** True if moving from `current` to `target` is a forward step in the pipeline. */
export function isForwardStatus(current: string, target: AssignmentStatusValue): boolean {
  const currentIndex = STATUS_ORDER.indexOf(current as AssignmentStatusValue);
  const targetIndex = STATUS_ORDER.indexOf(target);
  // Unknown current status: treat any known target as forward progress.
  if (currentIndex === -1) return true;
  return targetIndex > currentIndex;
}