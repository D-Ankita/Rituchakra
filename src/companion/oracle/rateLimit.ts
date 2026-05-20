/**
 * Once-per-cycle rate limit on screening nudges. Stateless helpers;
 * caller owns the persistence (useCompanionStore.lastBriefAt, or a
 * dedicated field if we add one later).
 */

export interface ScreeningSurfaceState {
  lastSurfacedCycleId: number | null;
}

export function shouldSurfaceScreening(
  current: ScreeningSurfaceState,
  currentCycleId: number | null
): boolean {
  if (currentCycleId === null) return false;
  return current.lastSurfacedCycleId !== currentCycleId;
}

export function markScreeningSurfaced(
  current: ScreeningSurfaceState,
  currentCycleId: number | null
): ScreeningSurfaceState {
  return { lastSurfacedCycleId: currentCycleId };
}
