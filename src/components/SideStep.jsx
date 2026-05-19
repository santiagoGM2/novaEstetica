import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

const services = [
  {
    idx: '01 · Faciales',
    name: ['Para rostros que', 'proyectan seguridad.'],
    desc: 'Tratamientos diseñados para reflejar la misma confianza que proyectas en cualquier sala.',
    cta: 'Iniciar mi Diagnóstico Facial',
    pickZone: 'Rostro',
  },
  {
    idx: '02 · Cejas & Pestañas',
    name: ['Diseño de mirada ejecutiva.'],
    desc: 'Una mirada que comunica antes de que digas una sola palabra.',
    cta: 'Iniciar mi Diagnóstico de Mirada',
    pickZone: 'Rostro',
  },
  {
    idx: '03 · Corporales',
    name: ['Escultura corporal High-End.'],
    desc: 'Protocolo de remodelación para quienes exigen resultados de alto rendimiento.',
    cta: 'Iniciar mi Diagnóstico Corporal',
    // null → el usuario elige Axilas/Bikini/Piernas en paso 1
    pickZone: null,
  },
]

export default function SideStep({ onPickService }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Pagination dots: detect which card is centered (mobile carousel only)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const card = el.querySelector('.service-card')
      const cardWidth = (card?.offsetWidth || 1) + 12 /* gap */
      const idx = Math.round(el.scrollLeft / cardWidth)
      setActiveIdx(Math.max(0, Math.min(services.length - 1, idx)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const goToDot = (i) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('.service-card')
    const cardWidth = (card?.offsetWidth || 0) + 12
    el.scrollTo({ left: cardWidth * i, behavior: 'smooth' })
  }

  useGSAPScrollTrigger(sectionRef, () => {
    gsap.from('.side-step-head .reveal-target', {
      opacity: 0,
      y: 28,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    })

    gsap.from('.service-card', {
      opacity: 0,
      y: 60,
      rotateY: 8,
      stagger: 0.18,
      duration: 1.1,
      ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      scrollTrigger: { trigger: '.services-grid', start: 'top 80%' },
    })
  }, [])

  return (
    <section ref={sectionRef} className="side-step" aria-labelledby="sidestep-heading">
      <div className="side-step-inner">
        <div className="side-step-head">
          <div>
            <span className="section-label reveal-target">Protocolos complementarios</span>
            <h2 className="section-title reveal-target" id="sidestep-heading">
              Tu Evolución no termina en la piel suave.
            </h2>
          </div>
          <button
            type="button"
            className="btn-ghost reveal-target"
            onClick={() => onPickService?.(null)}
          >
            Ver Protocolos VIP
          </button>
        </div>

        <div className="services-grid" ref={trackRef}>
          {services.map((s) => (
            <div className="service-card" key={s.idx}>
              <span className="service-card-idx">{s.idx}</span>
              <h3 className="service-card-name">
                {s.name.map((line, i) => (
                  <span key={i}>{line}{i < s.name.length - 1 && <br />}</span>
                ))}
              </h3>
              <p className="service-card-desc">{s.desc}</p>
              <button
                type="button"
                className="service-card-cta btn-outline"
                onClick={() => onPickService?.(s.pickZone)}
              >
                {s.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Pagination dots — visible solo en mobile via CSS */}
        <div className="services-dots" role="tablist" aria-label="Navegación de servicios">
          {services.map((s, i) => (
            <button
              key={s.idx}
              type="button"
              className={`services-dot${i === activeIdx ? ' active' : ''}`}
              aria-label={`Ir a tarjeta ${i + 1}: ${s.idx}`}
              aria-current={i === activeIdx ? 'true' : undefined}
              onClick={() => goToDot(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
