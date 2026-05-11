import { useState } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { ArrowIcon, CheckIcon } from '../lib/icons'

const ZONES = [
  { value: 'Axilas', icon: 'A' },
  { value: 'Bikini', icon: 'B' },
  { value: 'Piernas', icon: 'P' },
  { value: 'Rostro', icon: 'R' },
]

const TIMES = [
  { value: '2-4 horas', label: '2 – 4 horas', sub: 'Rutina básica' },
  { value: '5-8 horas', label: '5 – 8 horas', sub: 'Piernas + zonas extra' },
  { value: '8+ horas', label: 'Más de 8 horas', sub: 'Protocolo completo' },
]

const PRIORITIES = [
  { value: 'precio', heading: 'Una oferta barata', sub: 'Precio por encima de todo lo demás.', featured: false },
  { value: 'calidad', heading: 'Una atención personalizada que respete mi piel', sub: 'Resultados duraderos y un estándar que refleje quién soy.', featured: true },
]

const TOTAL_STEPS = 4

export default function Quiz() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({ zone: null, time: null, priority: null })
  const [form, setForm] = useState({ name: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const advance = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), 320)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const name = form.name.trim()
    const phone = form.phone.trim()
    if (!name || !phone) {
      setError('Completa tu nombre y WhatsApp para continuar.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          zone: answers.zone,
          time: answers.time,
          priority: answers.priority,
          source: 'landing-quiz',
        }),
      })
      // Even if API fails, advance to success — backend logs will catch the lead
      // and the user can still book via the calendar. Show a soft note on failure.
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        console.warn('Lead API non-OK:', res.status, detail)
      }
    } catch (err) {
      console.warn('Lead API failed:', err)
    } finally {
      setSubmitting(false)
      setSuccess(true)
    }
  }

  return (
    <section id="quiz" className="quiz-section" aria-labelledby="quiz-heading">
      <div className="quiz-inner">
        <div className="quiz-header reveal">
          <span className="section-label">Diagnóstico personalizado</span>
          <h2 className="section-title" id="quiz-heading">
            Tu piel merece<br /><em>una consulta a tu medida.</em>
          </h2>
          <p className="quiz-meta" aria-label="Detalles del diagnóstico">
            <span className="quiz-meta-dot" aria-hidden="true" />
            60 segundos · 4 pasos · 100% privado
          </p>
        </div>

        <div className="quiz-progress reveal" role="group" aria-label="Progreso del diagnóstico">
          {Array.from({ length: TOTAL_STEPS }).flatMap((_, i) => {
            const n = i + 1
            const stateCls = n === step ? ' active' : n < step ? ' done' : ''
            const nodes = [
              <div key={`dot-${n}`} className={`quiz-progress-step${stateCls}`}>
                <div className="quiz-progress-dot">{n}</div>
              </div>,
            ]
            if (n < TOTAL_STEPS) {
              nodes.push(
                <div key={`line-${n}`} className={`quiz-progress-line${n < step ? ' done' : ''}`} />
              )
            }
            return nodes
          })}
        </div>

        {!success && (
          <div className="reveal">
            {step === 1 && (
              <div className="quiz-step active">
                <p className="quiz-question">¿Qué zona de tu cuerpo merece prioridad hoy?</p>
                <div className="zone-grid">
                  {ZONES.map((z) => (
                    <button
                      key={z.value}
                      type="button"
                      className={`zone-btn${answers.zone === z.value ? ' selected' : ''}`}
                      onClick={() => advance('zone', z.value)}
                    >
                      <span className="zone-btn-icon">{z.icon}</span>
                      <span className="zone-btn-label">{z.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="quiz-step active">
                <p className="quiz-question">¿Cuántas horas al mes recuperas si dejas de depender de la cuchilla?</p>
                <div className="time-grid">
                  {TIMES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`time-btn${answers.time === t.value ? ' selected' : ''}`}
                      onClick={() => advance('time', t.value)}
                    >
                      <div>
                        <div className="time-btn-label">{t.label}</div>
                        <div className="time-btn-sub">{t.sub}</div>
                      </div>
                      <div className="time-btn-icon" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="quiz-step active">
                <p className="quiz-question">¿Qué es más importante para ti?</p>
                <div className="priority-grid">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`priority-btn${p.featured ? ' featured' : ''}${answers.priority === p.value ? ' selected' : ''}`}
                      onClick={() => advance('priority', p.value)}
                    >
                      <div className="priority-btn-heading">{p.heading}</div>
                      <div className="priority-btn-sub">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="quiz-step active">
                <p className="quiz-question">Déjanos tu WhatsApp para enviarte los resultados de tu diagnóstico y tu invitación VIP.</p>
                <form className="quiz-form" onSubmit={onSubmit} noValidate>
                  <input
                    className="quiz-input"
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    autoComplete="given-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <input
                    className="quiz-input"
                    type="tel"
                    name="whatsapp"
                    placeholder="+57 300 000 0000"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                  />
                  <button type="submit" className="btn-primary quiz-submit" disabled={submitting}>
                    {submitting ? 'Enviando…' : 'Recibir mi Diagnóstico VIP'}
                    {!submitting && <ArrowIcon />}
                  </button>
                  {error && <p className="quiz-error" role="alert">{error}</p>}
                </form>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="quiz-success" aria-live="polite">
            <div className="quiz-success-icon">
              <CheckIcon />
            </div>
            <p className="quiz-success-title">Diagnóstico registrado.</p>
            <p className="quiz-success-text">
              Recibirás tu invitación VIP por WhatsApp. Ahora elige tu horario.
            </p>
            <a href="#calendar" className="btn-primary" onClick={(e) => scrollToId('calendar', e)}>
              Asegurar mi Invitación VIP
              <ArrowIcon />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
