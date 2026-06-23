import { useEffect, useState } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { WhatsAppIcon, CalendarIcon } from '../lib/icons'

// FAB de WhatsApp flotante — visible SIEMPRE desde la primera carga.
// Mensaje de marketing que activa la "Invitación VIP", lista los beneficios
// con bullets y abre la conversación con una pregunta concreta. La frase
// "Invitación VIP" se mantiene intacta porque GHL la usa como marcador
// para detectar estos leads.
// NOTA: este link es independiente de VITE_WHATSAPP_LINK (contacto genérico,
// que sigue usándose en footer y en el fallback de error del quiz).
const WA_PHONE = '573105725730'
const WA_MESSAGE = `Hola NOVA 👋 Vengo de su página web y me gustaría activar mi Invitación VIP para conocer más sobre la depilación láser.

Entiendo que incluye:

✅ Valoración gratuita sin compromiso
✅ Hidratación facial gratis al tomar algún paquete
✅ Un descuento especial por activar la invitación

¿Me pueden orientar sobre cómo proceder? 😊`

const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(WA_MESSAGE)}`

export default function Fabs() {
  // Los FABs están presentes desde el primer paint. Arrancamos con
  // `visible=false` y lo gatillamos a `true` con un microdelay para que la
  // transición CSS de opacity + translateY se ejecute como fade-in suave
  // en lugar de aparecer abruptos.
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fabs">
      <a
        href={WHATSAPP_LINK}
        className={`fab fab-wa fab-wa-prominent${visible ? ' visible' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar por WhatsApp con Nova"
      >
        <span className="fab-label">Hablar por WhatsApp</span>
        <span className="fab-icon"><WhatsAppIcon /></span>
      </a>
      <a
        href="#quiz"
        className={`fab fab-cta${visible ? ' visible' : ''}`}
        onClick={(e) => scrollToId('quiz', e)}
        aria-label="Iniciar mi Diagnóstico"
      >
        <span className="fab-label">Iniciar mi Diagnóstico</span>
        <span className="fab-icon"><CalendarIcon /></span>
      </a>
    </div>
  )
}
