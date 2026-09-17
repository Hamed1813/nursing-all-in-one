import { LeitnerIntervals } from '../types';

export const DEFAULT_INTERVALS: LeitnerIntervals = {
  box1: 1,
  box2: 3,
  box3: 7,
  box4: 14,
  box5: 30,
};

export const DEFAULT_PASS_THRESHOLD = 4; // out of 5 questions correct advances the box

export function intervalForBox(box: number, intervals: LeitnerIntervals): number {
  const key = `box${Math.min(Math.max(box, 1), 5)}` as keyof LeitnerIntervals;
  return intervals[key];
}

/**
 * Given the current box and a quiz result (score out of 5), returns the next
 * box number and the ISO date the page should come up for review again.
 * Passing (score >= passThreshold) advances one box (capped at 5, so reviews
 * get further apart). Falling short resets to box 1 so it resurfaces soon.
 */
export function nextLeitnerState(
  currentBox: number,
  scoreOutOf5: number,
  intervals: LeitnerIntervals,
  passThreshold: number,
  from: Date = new Date()
): { box: number; nextReviewAt: string } {
  const passed = scoreOutOf5 >= passThreshold;
  const nextBox = passed ? Math.min(currentBox + 1, 5) : 1;
  const days = intervalForBox(nextBox, intervals);
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return { box: nextBox, nextReviewAt: next.toISOString() };
}
