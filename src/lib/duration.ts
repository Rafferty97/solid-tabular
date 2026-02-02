/**
 * Formats a time value in milliseconds to a human-readable string with appropriate units.
 * Automatically selects the most appropriate unit (s, ms, or μs) based on the magnitude.
 *
 * @param milliseconds - The time value in milliseconds
 * @param precision - Number of significant digits to show (default: 3)
 * @returns Formatted time string with units
 */
export function formatDuration(milliseconds: number, precision: number = 3): string {
  // Handle edge cases
  if (milliseconds === 0) {
    return `0 ms`
  }

  if (milliseconds < 0) {
    return `-${formatDuration(-milliseconds, precision)}`
  }

  // Convert to seconds if >= 1000ms
  if (milliseconds >= 1000) {
    const seconds = milliseconds / 1000
    return `${seconds.toPrecision(precision)} s`
  }

  // Use milliseconds if >= 1ms
  if (milliseconds >= 1) {
    return `${milliseconds.toPrecision(precision)} ms`
  }

  // Convert to microseconds if < 1ms
  const microseconds = milliseconds * 1000
  return `${microseconds.toPrecision(precision)} μs`
}
