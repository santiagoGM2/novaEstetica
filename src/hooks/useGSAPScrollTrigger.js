import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function ensureGSAPRegistered() {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

ensureGSAPRegistered()

/**
 * Mounts a GSAP context bound to a ref, runs the setup once, and reverts
 * everything on unmount. Use this for any ScrollTrigger-driven section so
 * that timelines and triggers are cleaned up automatically.
 *
 *   useGSAPScrollTrigger(ref, () => {
 *     gsap.from('.thing', { y: 40, opacity: 0, scrollTrigger: { trigger: ref.current, start: 'top 75%' } })
 *   }, [deps])
 */
export function useGSAPScrollTrigger(scopeRef, setup, deps = []) {
  useEffect(() => {
    if (!scopeRef?.current) return
    const ctx = gsap.context(setup, scopeRef.current)
    // Refresh after layout settles (fonts, images, async loads).
    const refresh = () => ScrollTrigger.refresh()
    if (document.readyState === 'complete') refresh()
    else window.addEventListener('load', refresh, { once: true })
    return () => {
      ctx.revert()
      window.removeEventListener('load', refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap, ScrollTrigger }
