import { useEffect, useRef } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { ArrowIcon } from '../lib/icons'
import Hero3DScene from './Hero3DScene'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

const HEADLINE = '¿Por qué una mujer con tu nivel de éxito sigue negociando su agenda con una cuchilla cada mañana?'

function splitWords(text) {
  // Word-level split is more legible than letter-by-letter for this length.
  return text.split(/(\s+)/).map((chunk, i) => {
    if (/^\s+$/.test(chunk)) return <span key={`s-${i}`}>{chunk}</span>
    return (
      <span key={`w-${i}`} className="hero-word">
        <span className="hero-word-inner">{chunk}</span>
      </span>
    )
  })
}

export default function Hero() {
  const sectionRef = useRef(null)

  // Initial reveal animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'cubic-bezier(0.23, 1, 0.32, 1)' } })

      // Note: .hero-3d is intentionally NOT animated here. Animating its opacity
      // through gsap.context() interacts badly with React 18 strict mode in dev
      // (double-mount + revert can leave it stuck at opacity:0). The canvas
      // appears as soon as the lazy chunk mounts.
      tl.from('.hero-pre', { opacity: 0, y: 18, duration: 0.7, delay: 0.15 })
        .from(
          '.hero-word-inner',
          {
            opacity: 0,
            yPercent: 110,
            filter: 'blur(8px)',
            duration: 0.9,
            stagger: { each: 0.04, from: 'start' },
          },
          '-=0.35'
        )
        .from('.hero-sub', { opacity: 0, y: 24, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { opacity: 0, y: 18, duration: 0.7 }, '-=0.5')
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Parallax on scroll (cheap — gsap.quickSetter style would be ideal but
  // ScrollTrigger handles it efficiently enough for a single hero).
  useGSAPScrollTrigger(sectionRef, () => {
    gsap.to('.hero-content', {
      yPercent: -8,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
    // Only do parallax on the 3D layer (no opacity changes — keep it visible)
    gsap.to('.hero-3d', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [])

  return (
    <section ref={sectionRef} className="hero" aria-labelledby="hero-heading">
      <div className="hero-bg" aria-hidden="true" />

      {/* 3D scene replaces the old SVG arc rings */}
      <Hero3DScene />

      <span className="hero-location" aria-hidden="true">Ciudad Jardín, Cali</span>

      <div className="hero-scroll" aria-hidden="true">
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">Scroll</span>
      </div>

      <div className="hero-content">
        <span className="hero-pre">Protocolo Evolución Láser · Nova Aesthetic Professionals</span>

        <h1 className="hero-title" id="hero-heading">
          {splitWords(HEADLINE)}
        </h1>

        <p className="hero-sub">
          No es falta de tiempo; es que estás usando un método del siglo pasado para una piel que merece el estándar del futuro. Tu piel no necesita más cuidados, necesita una <strong>Evolución de Identidad</strong>.
        </p>

        <a href="#quiz" className="btn-primary hero-cta" onClick={(e) => scrollToId('quiz', e)}>
          Iniciar mi Diagnóstico de Piel Premium
          <ArrowIcon />
        </a>

        <ul className="hero-trust" aria-label="Garantías iniciales">
          <li><span className="hero-trust-dot" aria-hidden="true" />Sin compromiso</li>
          <li><span className="hero-trust-dot" aria-hidden="true" />60 segundos</li>
          <li><span className="hero-trust-dot" aria-hidden="true" />100% privado</li>
        </ul>
      </div>
    </section>
  )
}
