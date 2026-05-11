import { useEffect, useRef, useState } from 'react'

const WHATSAPP_LINK = (
  import.meta.env.VITE_WHATSAPP_LINK ??
  'https://api.whatsapp.com/send/?phone=573105725730&text&type=phone_number&app_absent=0'
)
const BOOKING_URL = 'https://api.leadconnectorhq.com/widget/booking/xVUu1c8gHzw3AooU5lDC'

export default function Calendar() {
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef(null)

  // Fallback: hide loader after 6s even if onLoad never fires
  useEffect(() => {
    if (loaded) return
    const t = setTimeout(() => setLoaded(true), 6000)
    return () => clearTimeout(t)
  }, [loaded])

  // Listen for GHL's postMessage with the iframe's actual content height.
  // This avoids the form being cut off when the user advances steps.
  useEffect(() => {
    const handler = (event) => {
      if (event.origin !== 'https://api.leadconnectorhq.com') return
      const data = event.data
      // GHL sends { type: 'resize', height } or sometimes a numeric msg
      if (data && (data.type === 'resize' || data.height)) {
        const h = data.height || data.contentHeight
        if (typeof h === 'number' && h > 200 && iframeRef.current) {
          iframeRef.current.style.height = `${h}px`
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <section id="calendar" className="calendar-section" aria-labelledby="calendar-heading">
      <span className="section-label">Agenda tu cita</span>
      <h2 className="section-title" id="calendar-heading">
        Agenda tu Diagnóstico de Piel Premium.<br />Elige tu horario ahora.
      </h2>

      <ul className="calendar-trust" aria-label="Garantías de la valoración">
        <li><span className="calendar-trust-dot" aria-hidden="true" />Sin compromiso</li>
        <li><span className="calendar-trust-dot" aria-hidden="true" />Tecnología Fenix 4 certificada</li>
        <li><span className="calendar-trust-dot" aria-hidden="true" />Atención en español</li>
      </ul>

      <div className="calendar-wrap">
        <div className={`calendar-loading${loaded ? ' hidden' : ''}`} aria-hidden={loaded}>
          <div className="loading-spinner" />
          <p className="calendar-loading-text">Cargando tu calendario…</p>
          <p className="calendar-loading-sub">
            Si el calendario no aparece en unos segundos,{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              escríbenos por WhatsApp
            </a>
            {' '}y agendamos tu cita en minutos.
          </p>
        </div>

        <div className="calendar-iframe-wrap">
          <iframe
            ref={iframeRef}
            src={BOOKING_URL}
            style={{ width: '100%', border: 'none', display: 'block' }}
            scrolling="no"
            id="xVUu1c8gHzw3AooU5lDC_landing"
            title="Agenda tu cita · Nova Aesthetic Professionals"
            loading="eager"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </section>
  )
}
