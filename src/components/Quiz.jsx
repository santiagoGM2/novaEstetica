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

// --------------------------------------------------------------------------
// Webhook config — cliente envía directo al Inbound Webhook de GHL.
//   - DEV sin VITE_GHL_WEBHOOK_URL → modo MOCK (no envía, solo console.log)
//   - PROD sin VITE_GHL_WEBHOOK_URL → error inmediato, no se intenta nada
// --------------------------------------------------------------------------
const WEBHOOK_URL = import.meta.env.VITE_GHL_WEBHOOK_URL
const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK || null
const MOCK_WEBHOOK = import.meta.env.DEV && !WEBHOOK_URL

// Simple email validation — rechaza espacios, exige @ y al menos un .
// No es bulletproof (acepta "a@b.c") pero cubre el 99% de typos comunes.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function countDigits(s) {
  return (String(s || '').match(/\d/g) || []).length
}

function normalizePhone(p) {
  let s = String(p || '').replace(/[\s()-]/g, '')
  if (!s) return ''
  if (s.startsWith('+')) return s
  if (s.startsWith('0')) s = s.slice(1)
  return `+57${s}`
}

async function postWebhookWithRetry(payload, attempts = 3) {
  // Prod sin URL configurada: no hay nada que intentar — fallar inmediato.
  if (!MOCK_WEBHOOK && !WEBHOOK_URL) {
    // eslint-disable-next-line no-console
    console.error(
      '[Quiz] VITE_GHL_WEBHOOK_URL no está configurada en producción, contactar al equipo técnico'
    )
    throw new Error('Webhook URL no configurada')
  }

  let delay = 1000
  let lastErr = null
  for (let i = 0; i < attempts; i++) {
    try {
      if (MOCK_WEBHOOK) {
        // eslint-disable-next-line no-console
        console.log('[MOCK] Webhook payload:', payload)
        await new Promise((r) => setTimeout(r, 1000))
        return
      }
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) return
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (err) {
      lastErr = err
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delay))
      delay *= 2
    }
  }
  throw lastErr || new Error('Webhook failed after retries')
}

export default function Quiz() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({ zone: null, time: null, priority: null })
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showRetryFallback, setShowRetryFallback] = useState(false)

  const advance = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), 320)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setShowRetryFallback(false)

    const name = form.name.trim()
    const email = form.email.trim()
    const rawPhone = form.phone.trim()

    if (!name || !rawPhone) {
      setError('Completa tu nombre y WhatsApp para continuar.')
      return
    }
    if (countDigits(rawPhone) < 10) {
      setError('El WhatsApp debe tener al menos 10 dígitos.')
      return
    }
    if (email && !EMAIL_REGEX.test(email)) {
      setError('Revisá que el email esté bien escrito.')
      return
    }
    if (!answers.zone || !answers.time || !answers.priority) {
      setError('Algunas respuestas del diagnóstico están vacías. Volvé al paso 1 para completar.')
      return
    }

    const payload = {
      firstName: name,
      phone: normalizePhone(rawPhone),
      zone: answers.zone,
      time: answers.time,
      priority: answers.priority,
      source: 'landing-quiz',
      ...(email && { email }),
    }

    setSubmitting(true)
    try {
      await postWebhookWithRetry(payload, 3)
      setSuccess(true)
      // Después de 1.5s — tiempo para ver el éxito — scroll suave al calendar.
      setTimeout(() => {
        const cal = document.getElementById('calendar')
        if (cal) cal.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 1500)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Quiz] Webhook falló tras 3 intentos:', err)
      setError(
        'Hubo un problema al enviar tus datos. Por favor escribinos directamente por WhatsApp para asegurar tu invitación VIP.'
      )
      setShowRetryFallback(true)
    } finally {
      setSubmitting(false)
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
                    type="email"
                    name="email"
                    placeholder="Tu email (opcional)"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                  {error && (
                    <div className="quiz-error" role="alert">
                      <p>{error}</p>
                      {showRetryFallback && WHATSAPP_LINK && (
                        <a
                          href={WHATSAPP_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline quiz-error-cta"
                        >
                          Escribirnos por WhatsApp
                        </a>
                      )}
                    </div>
                  )}
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
