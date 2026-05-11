import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

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

  useGSAPScrollTrigger(sectionRef, () => {
    // Pin the section for ~1 viewport. Animate overlay opacity (darker → lighter)
    // so the video becomes more legible as the user reads the copy, and bring
    // the editorial copy in with stagger.
    const pin = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=100%',
        scrub: 0.8,
      },
    })

    tl.from('.espacio-eyebrow', { opacity: 0, y: 24 }, 0)
      .from('.espacio-title', { opacity: 0, y: 36 }, 0.05)
      .from('.espacio-sub', { opacity: 0, y: 24 }, 0.18)
      .to('.espacio-overlay', { opacity: 0.55 }, 0)
      .to('.espacio-video', { filter: 'blur(0px) saturate(1.05)' }, 0)

    return () => pin.kill()
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
            Tecnología <strong>Fenix 4</strong> y estándar sanitario premium en el corazón de Ciudad Jardín, Cali. Un protocolo donde cada detalle del entorno comunica el nivel del resultado.
          </p>
        </div>
      </div>
    </section>
  )
}

