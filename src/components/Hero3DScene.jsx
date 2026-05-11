import { useEffect, useRef, useState, lazy, Suspense } from 'react'

// Lazy-loaded so three.js + R3F + drei are split out of the main bundle.
const Hero3DCanvas = lazy(() => import('./Hero3DCanvas'))

/**
 * Defensive wrapper around the 3D scene:
 *  - Skips entirely on prefers-reduced-motion
 *  - Skips on coarse pointers + small screens (mobile fallback)
 *  - Mounts only once visible (IntersectionObserver) to defer the chunk download
 */
export default function Hero3DScene({ className = '' }) {
  const wrapRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isSmallTouch = window.matchMedia('(max-width: 600px) and (pointer: coarse)').matches
    if (reduceMotion || isSmallTouch || !wrapRef.current) {
      setShouldRender(false)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRender(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldRender) return
    const onScroll = () => {
      const max = window.innerHeight * 1.5
      setScrollProgress(Math.min(1, window.scrollY / max))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [shouldRender])

  return (
    <div ref={wrapRef} className={`hero-3d ${className}`} aria-hidden="true">
      {shouldRender && (
        <Suspense fallback={null}>
          <Hero3DCanvas scrollProgress={scrollProgress} />
        </Suspense>
      )}
    </div>
  )
}
