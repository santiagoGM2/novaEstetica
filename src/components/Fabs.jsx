import { useEffect, useState } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { WhatsAppIcon, CalendarIcon } from '../lib/icons'

const WHATSAPP_LINK = (
  import.meta.env.VITE_WHATSAPP_LINK ??
  'https://api.whatsapp.com/send/?phone=573105725730&text&type=phone_number&app_absent=0'
)

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
