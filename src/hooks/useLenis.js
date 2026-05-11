import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, ensureGSAPRegistered } from './useGSAPScrollTrigger'

/**
 * Initializes a global Lenis instance and wires it up with GSAP's ScrollTrigger
 * so scroll-driven animations stay in sync with the smooth-scroll easing.
 *
 * Honors prefers-reduced-motion: when the user wants reduced motion, Lenis is
 * not initialized and native scrolling stays in place.
 */
export function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    ensureGSAPRegistered()

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
