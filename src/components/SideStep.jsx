import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'
import { ArrowIcon, WhatsAppIcon } from '../lib/icons'

const services = [
  {
    idx: '01 · Faciales',
    name: ['Para rostros que', 'proyectan seguridad.'],
    desc: 'Limpieza profunda, hidratación de alta gama y bioestimulación con activos premium. Resultados visibles desde la primera sesión.',
    highlights: ['Limpieza Premium', 'Hidrafacial', 'PDRN', 'Exosomas'],
    cta: 'Consultar Faciales por WhatsApp',
    whatsapp:
      'https://api.whatsapp.com/send?phone=573105725730&text=Hola%20NOVA%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20servicio%20de%20Faciales%20Premium.',
  },
  {
    idx: '02 · Cejas & Pestañas',
    name: ['Diseño de mirada', 'ejecutiva.'],
    desc: 'Diseño y arquitectura de mirada para mujeres que comunican antes de hablar. Bajo mantenimiento, alto impacto.',
    highlights: ['Lifting de Pestañas', 'Diseño en Henna', 'Laminado', 'Depilación Cejas'],
    cta: 'Consultar Diseño de Mirada',
    whatsapp:
      'https://api.whatsapp.com/send?phone=573105725730&text=Hola%20NOVA%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20servicio%20de%20Dise%C3%B1o%20de%20Mirada%20Ejecutiva.',
  },
  {
    idx: '03 · Corporales',
    name: ['Escultura corporal', 'High-End.'],
    desc: 'Protocolo de remodelación y firmeza para quienes exigen resultados de alto rendimiento, sin tiempos de recuperación largos.',
    highlights: ['Reafirmante', 'Modelado', 'Drenaje VIP', 'Firmeza Premium'],
    cta: 'Consultar Escultura Corporal',
    whatsapp:
      'https://api.whatsapp.com/send?phone=573105725730&text=Hola%20NOVA%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20servicio%20de%20Escultura%20Corporal%20High-End.',
  },
]

const ALL_SERVICES_WHATSAPP =
  'https://api.whatsapp.com/send?phone=573105725730&text=Hola%20NOVA%2C%20quiero%20conocer%20tus%20otros%20servicios%20disponibles.'

export default function SideStep() {
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

    gsap.from('.services-all-cta', {
      opacity: 0,
      y: 18,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.services-all-cta-wrap', start: 'top 92%' },
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      id="protocolos"
      className="side-step"
      aria-labelledby="sidestep-heading"
    >
      <div className="side-step-inner">
        <div className="side-step-head">
          <div>
            <span className="section-label reveal-target">Protocolos complementarios</span>
            <h2 className="section-title reveal-target" id="sidestep-heading">
              Tu Evolución no termina en la piel suave.
            </h2>
          </div>
          <a
            href={ALL_SERVICES_WHATSAPP}
            className="btn-ghost reveal-target"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver Protocolos VIP
          </a>
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
              {s.highlights && (
                <ul className="service-card-highlights" aria-label="Tratamientos incluidos">
                  {s.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              <a
                href={s.whatsapp}
                className="service-card-cta btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                {s.cta}
              </a>
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

        {/* General CTA below the 3 cards */}
        <div className="services-all-cta-wrap">
          <a
            href={ALL_SERVICES_WHATSAPP}
            className="btn-primary services-all-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Quiero ver todos los servicios
            <ArrowIcon />
          </a>
          <p className="services-all-cta-note">
            Conversación directa con nuestro equipo · respuesta en minutos.
          </p>
        </div>
      </div>
    </section>
  )
}
