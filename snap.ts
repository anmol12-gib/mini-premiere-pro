export const SNAP_THRESHOLD = 0.15; // seconds

export function snapTime(
  time: number,
  snapPoints: number[]
) {
  for (const p of snapPoints) {
    if (Math.abs(time - p) <= 0.15) {
      return p;
    }
  }
  return time;
}
