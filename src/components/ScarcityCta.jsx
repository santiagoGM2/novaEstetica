import { useRef } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { ArrowIcon } from '../lib/icons'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

export default function ScarcityCta() {
  const sectionRef = useRef(null)

  useGSAPScrollTrigger(sectionRef, () => {
    gsap.from('.scarcity-inner > *', {
      opacity: 0,
      y: 26,
      stagger: 0.08,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      className="scarcity-cta"
      aria-labelledby="scarcity-heading"
    >
      <div className="scarcity-inner">
        <span className="scarcity-badge" role="status" aria-live="polite">
          <span className="scarcity-badge-pulse" aria-hidden="true" />
          Última semana · Cupos contados
        </span>
        <h2 className="scarcity-headline" id="scarcity-heading">
          Solo <span className="spots">5 valoraciones premium</span> disponibles esta semana.
        </h2>
        <a
          href="#quiz"
          className="btn-primary scarcity-btn"
          onClick={(e) => scrollToId('quiz', e)}
        >
          Reclamar mi Valoración Gratuita y asegurar mi cupo
          <ArrowIcon />
        </a>
      </div>
    </section>
  )
}
