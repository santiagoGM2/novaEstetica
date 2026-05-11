import { useRef } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

const services = [
  { idx: '01 · Faciales', name: ['Para rostros que', 'proyectan seguridad.'], desc: 'Tratamientos diseñados para reflejar la misma confianza que proyectas en cualquier sala.' },
  { idx: '02 · Cejas & Pestañas', name: ['Diseño de mirada ejecutiva.'], desc: 'Una mirada que comunica antes de que digas una sola palabra.' },
  { idx: '03 · Corporales', name: ['Escultura corporal High-End.'], desc: 'Protocolo de remodelación para quienes exigen resultados de alto rendimiento.' },
]

export default function SideStep() {
  const sectionRef = useRef(null)

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
          <a href="#quiz" className="btn-ghost reveal-target" onClick={(e) => scrollToId('quiz', e)}>
            Ver Protocolos VIP
          </a>
        </div>

        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.idx}>
              <span className="service-card-idx">{s.idx}</span>
              <h3 className="service-card-name">
                {s.name.map((line, i) => (
                  <span key={i}>{line}{i < s.name.length - 1 && <br />}</span>
                ))}
              </h3>
              <p className="service-card-desc">{s.desc}</p>
              <span className="service-card-note">Consultar disponibilidad tras tu diagnóstico de láser</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
