import { useRef } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { ArrowIcon } from '../lib/icons'
import { gsap, useGSAPScrollTrigger } from '../hooks/useGSAPScrollTrigger'

const PAIN_POINTS = [
  {
    num: '01',
    body: (
      <>Sentir vergüenza por vello visible en una reunión o evento social <em>no es opcional para ti.</em></>
    ),
  },
  {
    num: '02',
    body: (
      <>La irritación de la cuchilla y la esclavitud de la cera son "fastidios" que <em>ya no tienes por qué tolerar.</em></>
    ),
  },
  {
    num: '03',
    body: (
      <>El 95% de las mujeres premium eligen su método de depilación por estatus y libertad, no solo por estética.</>
    ),
    tag: 'Dato destacado',
  },
]

export default function Conciencia() {
  const sectionRef = useRef(null)

  useGSAPScrollTrigger(sectionRef, () => {
    // Header reveal
    gsap.from('.conciencia-head .reveal-target', {
      opacity: 0,
      y: 36,
      stagger: 0.1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    })

    // Vertical beam grows with scroll — visualizes "El Haz de Evolución"
    gsap.fromTo(
      '.conciencia-beam-fill',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.pain-points',
          start: 'top 75%',
          end: 'bottom 30%',
          scrub: 0.6,
        },
      }
    )

    // Each pain-point: cinematic entrance — rotateY 3D + clipPath wipe + marker pop
    const points = gsap.utils.toArray('.pain-point')
    points.forEach((point) => {
      const num = point.querySelector('.pain-point-num')
      const body = point.querySelector('.pain-point-body')
      const marker = point.querySelector('.pain-point-marker')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: point,
          start: 'top 78%',
          end: 'top 42%',
          scrub: 0.8,
        },
      })

      tl.fromTo(
        num,
        {
          rotateY: -55,
          scale: 0.78,
          opacity: 0.18,
          color: 'var(--text-tertiary)',
          textShadow: '0 0 0 rgba(224, 188, 126, 0)',
        },
        {
          rotateY: 0,
          scale: 1,
          opacity: 1,
          color: 'var(--gold-bright)',
          textShadow: '0 0 24px rgba(224, 188, 126, 0.45)',
          ease: 'power3.out',
          duration: 1,
        },
        0
      )
        .fromTo(
          body,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, ease: 'power2.out', duration: 1 },
          0.15
        )
        .fromTo(
          marker,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'back.out(2.4)', duration: 0.6 },
          0.05
        )

      // Optional dato-tag fade in last
      const tag = point.querySelector('.dato-tag')
      if (tag) {
        tl.fromTo(tag, { opacity: 0, x: -12 }, { opacity: 1, x: 0, ease: 'power2.out', duration: 0.6 }, 0.45)
      }
    })
  }, [])

  return (
    <section ref={sectionRef} className="conciencia" aria-labelledby="conciencia-heading">
      <div className="conciencia-inner">
        <div className="conciencia-head">
          <div>
            <span className="section-label reveal-target">Conciencia de estándar</span>
            <h2 className="section-title reveal-target" id="conciencia-heading">
              Lo que tu piel revela de tu estándar de vida.
            </h2>
          </div>
          <p className="conciencia-desc reveal-target">
            Cada elección que haces sobre tu cuerpo es una declaración silenciosa sobre quién eres. Las mujeres que operan en tu nivel no toleran soluciones provisionales.
          </p>
        </div>

        <div className="conciencia-stage">
          <div className="conciencia-beam" aria-hidden="true">
            <div className="conciencia-beam-fill" />
          </div>

          <ol className="pain-points" role="list">
            {PAIN_POINTS.map((p) => (
              <li key={p.num} className="pain-point">
                <span className="pain-point-marker" aria-hidden="true" />
                <span className="pain-point-num" aria-hidden="true">{p.num}</span>
                <div className="pain-point-text">
                  <p className="pain-point-body">{p.body}</p>
                  {p.tag && <span className="dato-tag">{p.tag}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <a href="#quiz" className="btn-outline conciencia-cta" onClick={(e) => scrollToId('quiz', e)}>
          Quiero estar Siempre Lista
          <ArrowIcon />
        </a>
      </div>
    </section>
  )
}
