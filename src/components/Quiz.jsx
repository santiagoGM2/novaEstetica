import { useEffect, useRef, useState } from 'react'
import { ArrowIcon, CheckIcon, WhatsAppIcon } from '../lib/icons'

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

// Link específico para el botón post-diagnóstico (success state) — mensaje
// que confirma a NOVA que la usuaria completó el quiz y espera su invitación VIP.
const WHATSAPP_POSTDIAGNOSTIC = 'https://api.whatsapp.com/send?phone=573105725730&text=Hola%20NOVA%2C%20ya%20hice%20mi%20diagn%C3%B3stico%20y%20estoy%20a%20la%20espera%20de%20mi%20invitaci%C3%B3n%20VIP.'
const MOCK_WEBHOOK = import.meta.env.DEV && !WEBHOOK_URL

// Simple email validation — rechaza espacios, exige @ y al menos un .
// No es bulletproof (acepta "a@b.c") pero cubre el 99% de typos comunes.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function countDigits(s) {
  return (String(s || '').match(/\d/g) || []).length
}

// El input solo recibe los 10 dígitos colombianos. El prefijo +57 vive en la UI.
function normalizePhone(p) {
  const digits = String(p || '').replace(/\D/g, '')
  if (!digits) return ''
  return `+57${digits}`
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

export default function Quiz({ seed }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({ zone: null, time: null, priority: null })
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showRetryFallback, setShowRetryFallback] = useState(false)
  // Track de pre-selección de la zona desde las tarjetas de servicio,
  // para mostrar el hint "Seleccionaste: X · cambiar" en el paso 2.
  const [preselectedZone, setPreselectedZone] = useState(null)
  const lastSeedKey = useRef(null)

  // Aplica el seed cuando cambia (cambio de tarjeta → nuevo timestamp)
  useEffect(() => {
    if (seed?.key && seed.key !== lastSeedKey.current && seed.preselectZone) {
      lastSeedKey.current = seed.key
      setAnswers((a) => ({ ...a, zone: seed.preselectZone }))
      setStep(2)
      setPreselectedZone(seed.preselectZone)
    }
  }, [seed])

  const advance = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    // Si el usuario eligió manualmente la zona, ya no es "preselect"
    if (key === 'zone') setPreselectedZone(null)
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), 320)
  }

  const clearPreselect = () => {
    setStep(1)
    setAnswers((a) => ({ ...a, zone: null }))
    setPreselectedZone(null)
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
      setError('Ingresá los 10 dígitos de tu celular.')
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
                {preselectedZone && (
                  <div className="quiz-preselect-hint" role="status" aria-live="polite">
                    <span>Seleccionaste: <strong>{preselectedZone}</strong></span>
                    <button type="button" className="quiz-preselect-change" onClick={clearPreselect}>
                      cambiar
                    </button>
                  </div>
                )}
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
                  <div className="quiz-phone-group">
                    <span className="quiz-phone-prefix" aria-hidden="true">+57</span>
                    <input
                      className="quiz-input quiz-phone-input"
                      type="tel"
                      name="whatsapp"
                      placeholder="300 000 0000"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      aria-label="Número de WhatsApp en Colombia, 10 dígitos"
                      value={form.phone}
                      onChange={(e) => {
                        // Solo dígitos y espacios, cap a 14 chars (10 dígitos + espacios)
                        const v = e.target.value.replace(/[^\d\s]/g, '').slice(0, 14)
                        setForm((f) => ({ ...f, phone: v }))
                      }}
                      required
                    />
                  </div>
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
            <p className="quiz-success-title">¡Tu diagnóstico premium está listo!</p>
            <p className="quiz-success-text">
              El último paso para asegurar tus beneficios es notificarnos. Haz clic en el botón de abajo para activar tu acceso preferencial de inmediato.
            </p>
            <a
              href={WHATSAPP_POSTDIAGNOSTIC}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary quiz-success-cta"
            >
              <WhatsAppIcon />
              Escribirnos por WhatsApp
              <ArrowIcon />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
