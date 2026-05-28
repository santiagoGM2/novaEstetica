import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'
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
  const fenixRef = useRef(null)
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

  // Pinned video stage timeline
  useGSAPScrollTrigger(sectionRef, () => {
    const pin = ScrollTrigger.create({
      trigger: '.espacio-stage',
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.espacio-stage',
        start: 'top top',
        end: '+=100%',
        scrub: 0.8,
      },
    })

    tl.from('.espacio-eyebrow', { opacity: 0, y: 24 }, 0)
      .from('.espacio-title', { opacity: 0, y: 36 }, 0.05)
      .from('.espacio-sub', { opacity: 0, y: 24 }, 0.18)
      .from('.espacio-cta', { opacity: 0, y: 16 }, 0.32)
      .to('.espacio-overlay', { opacity: 0.55 }, 0)
      .to('.espacio-video', { filter: 'blur(0px) saturate(1.05)' }, 0)

    return () => pin.kill()
  }, [])

  // FENIX block reveal
  useGSAPScrollTrigger(fenixRef, () => {
    gsap.from('.fenix-head .reveal-target', {
      opacity: 0,
      y: 28,
      stagger: 0.08,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: fenixRef.current, start: 'top 78%' },
    })

    gsap.from('.fenix-benefit', {
      opacity: 0,
      y: 32,
      stagger: 0.12,
      duration: 0.9,
      ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      scrollTrigger: { trigger: '.fenix-grid', start: 'top 82%' },
    })

    gsap.from('.fenix-foot .reveal-target', {
      opacity: 0,
      y: 24,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.fenix-foot', start: 'top 88%' },
    })
  }, [])

  return (
    <section ref={sectionRef} className="espacio" aria-labelledby="espacio-heading">
      <div className="espacio-stage">
        <video
          ref={videoRef}
          className="espacio-video"
          src="/assets/videos/fenix-instalaciones.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster=""
          aria-hidden="true"
        />
        <div className="espacio-overlay" aria-hidden="true" />
        <div className="espacio-content">
          <span className="espacio-eyebrow section-label">El Espacio</span>
          <h2 className="espacio-title section-title" id="espacio-heading">
            Un espacio diseñado para tu evolución.
          </h2>
          <p className="espacio-sub">
            Tecnología <strong>Fenix 4</strong> y estándar sanitario premium en el corazón de Cali. Un protocolo donde cada detalle del entorno comunica el nivel del resultado.
          </p>
          <a
            href="#quiz"
            className="btn-outline espacio-cta"
            onClick={(e) => scrollToId('quiz', e)}
          >
            Iniciar mi Diagnóstico Premium
            <ArrowIcon />
          </a>
        </div>
      </div>

      {/* ============== FENIX TECH BLOCK ============== */}
      <div ref={fenixRef} className="fenix-block" id="fenix">
        <div className="fenix-inner">
          <div className="fenix-head">
            <span className="section-label reveal-target">
              Depilación Láser en NOVA — Tecnología FENIX
            </span>
            <h2 className="fenix-title section-title reveal-target">
              Evolución Tecnológica: <br />
              <em className="fenix-title-accent">La Ciencia Detrás de Tu Libertad.</em>
            </h2>
            <p className="fenix-intro reveal-target">
              En NOVA respetamos y transformamos tu piel con <strong>FENIX</strong>, el láser diodo biomédico que combina <strong>4 longitudes de onda</strong> en una sola sesión. No es estética genérica: es ciencia adaptada a cada fototipo, cada zona, cada cliente.
            </p>
          </div>

          <h3 className="fenix-subhead reveal-target">
            ¿Por qué FENIX es el nuevo estándar en Cali?
          </h3>

          <ul className="fenix-grid" role="list">
            {FENIX_BENEFITS.map((b) => (
              <li className="fenix-benefit" key={b.title}>
                <span className="fenix-benefit-icon" aria-hidden="true">{b.icon}</span>
                <h4 className="fenix-benefit-title">{b.title}</h4>
                <p className="fenix-benefit-body">{b.body}</p>
              </li>
            ))}
          </ul>

          <div className="fenix-foot">
            <a
              href="#quiz"
              className="btn-primary fenix-cta reveal-target"
              onClick={(e) => scrollToId('quiz', e)}
            >
              Reservar mi Diagnóstico Premium de Cortesía
              <ArrowIcon />
            </a>
            <p className="fenix-foot-note reveal-target">
              Evaluación científica de tu piel en 2 minutos · Cupos VIP limitados.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
