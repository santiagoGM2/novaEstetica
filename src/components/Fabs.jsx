import { useEffect, useState } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { WhatsAppIcon, CalendarIcon } from '../lib/icons'

// FAB de WhatsApp flotante (visible en toda la landing) — mensaje específico
// de marketing que activa la "Invitación VIP" y posiciona la depilación
// láser como tema de la conversación. La frase "Invitación VIP" se mantiene
// intacta porque GHL la usa como marcador para detectar estos leads.
// NOTA: este link es independiente de VITE_WHATSAPP_LINK (contacto genérico,
// que sigue usándose en footer y en el fallback de error del quiz).
const WHATSAPP_LINK = 'https://api.whatsapp.com/send?phone=573105725730&text=Hola%20NOVA%2C%20vengo%20de%20su%20p%C3%A1gina%20web.%20Me%20gustar%C3%ADa%20activar%20mi%20Invitaci%C3%B3n%20VIP%20y%20conocer%20m%C3%A1s%20sobre%20la%20depilaci%C3%B3n%20l%C3%A1ser.'

export default function Fabs() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fabs">
      <a
        href={WHATSAPP_LINK}
        className={`fab fab-wa${visible ? ' visible' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar por WhatsApp"
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
