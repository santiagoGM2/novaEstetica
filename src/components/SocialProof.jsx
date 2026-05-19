import { useEffect, useRef } from 'react'
import { StarIcon, ShieldIcon, PersonIcon } from '../lib/icons'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

const testimonials = [
  {
    quote: 'Por fin encontré un lugar en Cali que entiende mi ritmo de vida.',
    avatar: 'V',
    name: 'Valentina M.',
    role: 'Gerente Comercial · Cali',
  },
  {
    quote: 'Estar siempre lista para el gimnasio, para una reunión, para cualquier cosa. Eso no tiene precio.',
    avatar: 'C',
    name: 'Carolina R.',
    role: 'Empresaria · Cali',
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

function TestimonialCard({ quote, avatar, name, role }) {
  const ref = useRef(null)
  useCardTilt(ref)
  return (
    <article ref={ref} className="testimonial" role="listitem">
      <StarRow />
      <p className="testimonial-quote">{quote}</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar" aria-hidden="true">{avatar}</div>
        <div>
          <p className="testimonial-name">{name}</p>
          <p className="testimonial-role">{role}</p>
        </div>
      </div>
    </article>
  )
}

function BeforeAfterMedia() {
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
        src="/assets/videos/antes-despues.mp4"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label="Comparativa antes y después de tratamientos en Nova"
      />
      <div className="proof-media-overlay" aria-hidden="true">
        <span className="proof-media-label">Antes · Después</span>
        <span className="proof-media-cta">Resultado real · clientas premium</span>
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
        <div className="testimonials" role="list">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
        <BeforeAfterMedia />
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
          <span className="proof-stat-num">4.9 / 5</span>
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
