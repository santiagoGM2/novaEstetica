import { useEffect } from 'react'

export function useScrollReveal(selector = '.reveal', { threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector)
    if (!elements.length) return

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('in-view'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector, threshold, rootMargin])
}
