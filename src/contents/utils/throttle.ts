/**
 * Limit how often a function can run.
 *
 * This is an immediate throttle:
 * - the first call runs right away
 * - additional calls inside the delay window are ignored
 * - once the delay has passed, the next call is allowed through
 *
 * This behavior is usually a better fit for scroll progress updates than
 * a delayed throttle because it reports progress sooner.
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall < delay) return

    lastCall = now
    fn(...args)
  }
}