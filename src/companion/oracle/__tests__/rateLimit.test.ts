import { shouldSurfaceScreening, markScreeningSurfaced } from '../rateLimit';

describe('shouldSurfaceScreening', () => {
  it('returns true for a new cycle id', () => {
    expect(
      shouldSurfaceScreening({ lastSurfacedCycleId: null }, 5)
    ).toBe(true);
    expect(
      shouldSurfaceScreening({ lastSurfacedCycleId: 4 }, 5)
    ).toBe(true);
  });

  it('returns false for the same cycle id', () => {
    expect(
      shouldSurfaceScreening({ lastSurfacedCycleId: 5 }, 5)
    ).toBe(false);
  });

  it('returns false when no cycle id is known', () => {
    expect(
      shouldSurfaceScreening({ lastSurfacedCycleId: 5 }, null)
    ).toBe(false);
  });

  it('markScreeningSurfaced advances the state', () => {
    const next = markScreeningSurfaced({ lastSurfacedCycleId: null }, 7);
    expect(next.lastSurfacedCycleId).toBe(7);
    // and is now blocked
    expect(shouldSurfaceScreening(next, 7)).toBe(false);
  });
});
