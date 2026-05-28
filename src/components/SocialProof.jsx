import { useEffect, useRef, useState } from 'react'
import {
  StarIcon,
  ShieldIcon,
  PersonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../lib/icons'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

const testimonials = [
  {
    id: 'luisa',
    quote:
      'Excelente servicio, instalaciones muy cómodas y un equipo profesional que te hace sentir realmente atendida. Súper recomendado.',
    name: 'Luisa Fer. Córdoba Triviño',
    role: 'Cliente verificada · Google',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjVar8BxsARq2Jp1SFPOhAD_fq5A-xf4_1z8ipgRh1FIgGX16MEtcg=w72-h72-p-rp-mo-ba3-br100',
  },
  {
    id: 'ana',
    quote:
      'Maravillosa atención y excelente trabajo. Los resultados se ven desde la primera sesión, definitivamente vuelvo.',
    name: 'Ana Cristina Triviño Aparicio',
    role: 'Cliente verificada · Google',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLl9ex2u8Hcw5zQ4bh9aTlN67Zg-CU_YeKGCXBV5GPX42HGSQ=w72-h72-p-rp-mo-br100',
  },
  {
    id: 'ciara',
    quote:
      'Lo súper recomiendo. Realizan unos buenos procedimientos, con dedicación y profesionalismo en cada detalle.',
    name: 'Ciara Riascos Campo',
    role: 'Cliente verificada · Google',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocJ1y4Iv4jH-zG4W7NFP08ENYDqfM77fkKTaNcv8p0cOnW9OGg=w72-h72-p-rp-mo-br100',
  },
  {
    id: 'aurora',
    quote:
      'Excelente servicio, me gustó mucho. El trato cercano y los resultados visibles hacen toda la diferencia.',
    name: 'Aurora Olave',
    role: 'Cliente verificada · Google',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjWU24rdTkrB9W1mdKgzS2tizU151gLza2dYtriTjkpEczz5WPaUug=w72-h72-p-rp-mo-br100',
  },
]

const badges = [
  { icon: <StarIcon />, text: 'Tecnología Alemana' },
  { icon: <ShieldIcon />, text: 'Ambiente Sanitario Premium' },
  { icon: <PersonIcon />, text: 'Atención Especializada' },
]

const TILT_MAX = 3 // degrees — subtler is more premium

function useCardTilt(ref) {
  useEffect(() => {
    const card = ref.current
    if (!card) return
    // Skip on touch devices and when the user wants reduced motion.
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rect = card.getBoundingClientRect()
    const refreshRect = () => { rect = card.getBoundingClientRect() }
    window.addEventListener('resize', refreshRect, { passive: true })
    window.addEventListener('scroll', refreshRect, { passive: true })

    const onMove = (e) => {
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotY = (x - 0.5) * 2 * TILT_MAX
      const rotX = -(y - 0.5) * 2 * TILT_MAX
      gsap.to(card, {
        rotationY: rotY,
        rotationX: rotX,
        duration: 0.4,
        ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
        overwrite: 'auto',
      })
    }
    const onLeave = () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      })
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('resize', refreshRect)
      window.removeEventListener('scroll', refreshRect)
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}

function StarRow() {
  return (
    <div className="testimonial-stars" aria-label="5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1.5l1.83 5h5l-4.07 3.18 1.54 5L8 11.5l-4.3 3.18 1.54-5L1.17 6.5h5z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ quote, name, role, avatar }) {
  const ref = useRef(null)
  useCardTilt(ref)
  return (
    <article ref={ref} className="testimonial" role="listitem">
      <StarRow />
      <p className="testimonial-quote">{quote}</p>
      <div className="testimonial-author">
        <img
          className="testimonial-avatar"
          src={avatar}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          width="44"
          height="44"
        />
        <div>
          <p className="testimonial-name">{name}</p>
          <p className="testimonial-role">{role}</p>
        </div>
      </div>
    </article>
  )
}

/**
 * Carousel that shows 2 testimonials at a time on desktop (1 on mobile)
 * with prev/next controls. Pages through the testimonials list.
 */
function TestimonialsCarousel({ items }) {
  const [page, setPage] = useState(0)
  // perPage = 2 on desktop, 1 on mobile (set by CSS, but JS needs to know to
  // page correctly). Track via matchMedia.
  const [perPage, setPerPage] = useState(2)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setPerPage(mq.matches ? 1 : 2)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const currentPage = Math.min(page, totalPages - 1)
  const start = currentPage * perPage
  const visible = items.slice(start, start + perPage)

  const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages)
  const goNext = () => setPage((p) => (p + 1) % totalPages)

  return (
    <div className="testimonials-carousel">
      <div className="testimonials" role="list" aria-live="polite">
        {visible.map((t) => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </div>

      <div className="testimonials-controls" aria-label="Navegación de testimonios">
        <button
          type="button"
          className="testimonials-arrow"
          aria-label="Testimonios anteriores"
          onClick={goPrev}
          disabled={totalPages <= 1}
        >
          <ChevronLeftIcon />
        </button>

        <div className="testimonials-dots" role="tablist">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`testimonials-dot${i === currentPage ? ' active' : ''}`}
              aria-label={`Ir a página ${i + 1} de ${totalPages}`}
              aria-current={i === currentPage ? 'true' : undefined}
              onClick={() => setPage(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="testimonials-arrow"
          aria-label="Testimonios siguientes"
          onClick={goNext}
          disabled={totalPages <= 1}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}

function ProcedureMedia() {
  const videoRef = useRef(null)

  // Always autoplay loop. Pause when off-screen to save decode work.
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

  return (
    <div className="proof-media">
      <video
        ref={videoRef}
        className="proof-media-video"
        src="/assets/videos/procedimiento-nova.mp4"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label="Procedimiento de depilación láser en Nova Aesthetic Professionals"
      />
      <div className="proof-media-overlay" aria-hidden="true">
        <span className="proof-media-label">Procedimiento real</span>
        <span className="proof-media-cta">Sesión Fenix 4 · Nova Aesthetic Professionals</span>
      </div>
    </div>
  )
}

export default function SocialProof() {
  const sectionRef = useRef(null)

  useGSAPScrollTrigger(sectionRef, () => {
    gsap.from('.testimonial', {
      opacity: 0,
      y: 40,
      stagger: 0.15,
      duration: 1,
      ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      scrollTrigger: { trigger: '.testimonials', start: 'top 80%' },
    })
    gsap.from('.proof-media', {
      opacity: 0,
      scale: 0.94,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.proof-media', start: 'top 85%' },
    })
    gsap.from('.trust-badge', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.trust-badges', start: 'top 90%' },
    })
  }, [])

  return (
    <section ref={sectionRef} className="social-proof" aria-labelledby="proof-heading">
      <span className="section-label" id="proof-heading">Lo que dicen nuestras clientas</span>

      <div className="social-proof-grid">
        <TestimonialsCarousel items={testimonials} />
        <ProcedureMedia />
      </div>

      <div className="proof-stats" role="list">
        <div className="proof-stat" role="listitem">
          <span className="proof-stat-num">98%</span>
          <span className="proof-stat-label">de clientas vuelven<br />para sesiones siguientes</span>
        </div>
        <div className="proof-stat" role="listitem">
          <span className="proof-stat-num">+200</span>
          <span className="proof-stat-label">mujeres premium<br />atendidas en Cali</span>
        </div>
        <div className="proof-stat" role="listitem">
          <span className="proof-stat-num">5 / 5</span>
          <span className="proof-stat-label">valoración promedio<br />después de la primera sesión</span>
        </div>
      </div>

      <div className="trust-badges" role="list">
        {badges.map((b) => (
          <div className="trust-badge" role="listitem" key={b.text}>
            <div className="trust-badge-icon" aria-hidden="true">{b.icon}</div>
            <p className="trust-badge-text">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
