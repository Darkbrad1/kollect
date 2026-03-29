/**
 * Return the current page scroll percentage.
 *
 * If the document is shorter than the viewport, we consider the page fully read.
 * The returned value keeps 3 decimal places of precision.
 */
export function getScrollPercentage(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight

  if (docHeight <= 0) return 100

  return Math.round((scrollTop / docHeight) * 100000) / 1000
}