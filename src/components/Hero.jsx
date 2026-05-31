import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { scrollToId } from '../lib/scrollTo'
import { ArrowIcon } from '../lib/icons'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

export default function Hero() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const prefersReduced = useReducedMotion()

  // Variant factory — delays comprimidos para que el CTA aparezca a ~0.95s.
  const v = (delay) =>
    prefersReduced
      ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
      : {
          hidden: { opacity: 0, y: 24 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
          },
        }

  // Video entrance: fade + scale-in lento — la respiración cinematográfica
  // viene del propio video reproduciéndose.
  const videoVariants = prefersReduced
    ? { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 1.04 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { duration: 1.6, ease: [0.23, 1, 0.32, 1] },
        },
      }

  // Pausa el video cuando está fuera de viewport para no quemar GPU
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.05 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  // Parallax on scroll
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
    gsap.to('.hero-image', {
      yPercent: -6,
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

      <motion.div
        className="hero-image hero-image-video"
        aria-hidden="true"
        variants={videoVariants}
        initial="hidden"
        animate="show"
      >
        <video
          ref={videoRef}
          src="/assets/videos/procedimiento-nova.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
        />
      </motion.div>

      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-accent-line" aria-hidden="true" />

      <span className="hero-location" aria-hidden="true">Cali</span>

      <div className="hero-scroll" aria-hidden="true">
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">Scroll</span>
      </div>

      <div className="hero-content">
        <motion.span
          className="hero-pre"
          variants={v(0)}
          initial="hidden"
          animate="show"
        >
          Protocolo Evolución Láser · Nova Aesthetic Professionals
        </motion.span>

        <h1 className="hero-title" id="hero-heading">
          <motion.span
            className="hero-title-line"
            variants={v(0.1)}
            initial="hidden"
            animate="show"
          >
            ¿Por qué seguís perdiendo tiempo
          </motion.span>
          <motion.span
            className="hero-title-line"
            variants={v(0.4)}
            initial="hidden"
            animate="show"
          >
            con una <em className="hero-title-accent">cuchilla</em> cada mañana?
          </motion.span>
        </h1>

        <motion.p
          className="hero-sub"
          variants={v(0.7)}
          initial="hidden"
          animate="show"
        >
          No es falta de tiempo. Tu piel merece el estándar del futuro: una <strong>Evolución de Identidad</strong>.
        </motion.p>

        <motion.a
          href="#quiz"
          className="btn-primary hero-cta"
          onClick={(e) => scrollToId('quiz', e)}
          variants={v(0.95)}
          initial="hidden"
          animate="show"
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          transition={prefersReduced ? undefined : { type: 'spring', stiffness: 320, damping: 22 }}
        >
          Iniciar mi Diagnóstico de Piel Premium
          <ArrowIcon />
        </motion.a>

        <motion.ul
          className="hero-trust"
          variants={v(1.15)}
          initial="hidden"
          animate="show"
          aria-label="Garantías iniciales"
        >
          <li><span className="hero-trust-dot" aria-hidden="true" />Sin compromiso</li>
          <li><span className="hero-trust-dot" aria-hidden="true" />60 segundos</li>
          <li><span className="hero-trust-dot" aria-hidden="true" />100% privado</li>
        </motion.ul>
      </div>
    </section>
  )
}
