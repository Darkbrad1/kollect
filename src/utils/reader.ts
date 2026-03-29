export function getScrollPercentage(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight

  if (docHeight <= 0) return 100

  return Math.round((scrollTop / docHeight) * 100000) / 1000
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout !== null) return

    timeout = window.setTimeout(() => {
      fn(...args)
      timeout = null
    }, delay)
  }
}