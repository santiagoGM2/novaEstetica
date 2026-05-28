import { useEffect, useRef } from 'react'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'
import { scrollToId } from '../lib/scrollTo'
import {
  ArrowIcon,
  WavesIcon,
  SnowflakeIcon,
  ShieldCellIcon,
  CrosshairIcon,
} from '../lib/icons'

const FENIX_BENEFITS = [
  {
    icon: <WavesIcon />,
    title: 'Adaptabilidad Absoluta',
    body: 'Las 4 longitudes de onda se ajustan a tu fototipo y tipo de vello. Funciona en piel clara, mestiza y morena — sin importar contraste o densidad.',
  },
  {
    icon: <SnowflakeIcon />,
    title: 'Confort Premium',
    body: 'Sistema de refrigeración integrado a baja temperatura. La sesión se siente fresca y controlada, no dolorosa.',
  },
  {
    icon: <ShieldCellIcon />,
    title: 'Protección Celular',
    body: 'Calibración biomédica que actúa solo sobre el folículo. Tu piel queda intacta, sin enrojecimiento prolongado.',
  },
  {
    icon: <CrosshairIcon />,
    title: 'Precisión en Cada Zona',
    body: 'Spot ajustable para cada anatomía: desde el bozo más fino hasta piernas completas en una misma sesión.',
  },
]

export default function EspacioSection() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)

  // Play/pause based on visibility — saves decode work when off-screen.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.1 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  // Reveal-on-scroll for content. No pinning — the section is naturally tall
  // and the video fills the whole section as atmospheric background.
  useGSAPScrollTrigger(sectionRef, () => {
    gsap.from('.espacio-head .reveal-target', {
      opacity: 0,
      y: 32,
      stagger: 0.1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
    })

    gsap.from('.espacio-subhead', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.espacio-subhead', start: 'top 82%' },
    })

    gsap.from('.espacio-benefit', {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.85,
      ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      scrollTrigger: { trigger: '.espacio-grid', start: 'top 82%' },
    })

    gsap.from('.espacio-foot > *', {
      opacity: 0,
      y: 22,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.espacio-foot', start: 'top 88%' },
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      id="fenix"
      className="espacio"
      aria-labelledby="espacio-heading"
    >
      <video
        ref={videoRef}
        className="espacio-video"
        src="/assets/videos/fenix-instalaciones.mp4"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden="true"
      />
      <div className="espacio-overlay" aria-hidden="true" />
      <div className="espacio-grain" aria-hidden="true" />

      <div className="espacio-content">
        <div className="espacio-head">
          <span className="espacio-eyebrow section-label reveal-target">
            Depilación Láser en NOVA · Tecnología FENIX
          </span>
          <h2 className="espacio-title section-title reveal-target" id="espacio-heading">
            Evolución Tecnológica:
            <em className="espacio-title-accent">La Ciencia Detrás de Tu Libertad.</em>
          </h2>
          <p className="espacio-intro reveal-target">
            En NOVA respetamos y transformamos tu piel con <strong>FENIX</strong>, el láser diodo biomédico que combina <strong>4 longitudes de onda</strong> en una sola sesión. No es estética genérica: es ciencia adaptada a cada fototipo, cada zona, cada cliente.
          </p>
        </div>

        <h3 className="espacio-subhead">
          ¿Por qué FENIX es el nuevo estándar en Cali?
        </h3>

        <ul className="espacio-grid" role="list">
          {FENIX_BENEFITS.map((b) => (
            <li className="espacio-benefit" key={b.title}>
              <span className="espacio-benefit-icon" aria-hidden="true">{b.icon}</span>
              <h4 className="espacio-benefit-title">{b.title}</h4>
              <p className="espacio-benefit-body">{b.body}</p>
            </li>
          ))}
        </ul>

        <div className="espacio-foot">
          <a
            href="#quiz"
            className="btn-primary espacio-cta"
            onClick={(e) => scrollToId('quiz', e)}
          >
            Reservar mi Diagnóstico Premium de Cortesía
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}
