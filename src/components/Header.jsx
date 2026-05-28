import { scrollToId } from '../lib/scrollTo'
import { InstagramIcon } from '../lib/icons'

const INSTAGRAM_URL = 'https://www.instagram.com/nova_aestheticp/'

export default function Header() {
  return (
    <header className="header">
      <a href="#" className="logo" aria-label="Nova Aesthetic Professionals · inicio">
        <picture>
          <source srcSet="/assets/logo/logo.webp" type="image/webp" />
          <img
            src="/assets/logo/logo.jpeg"
            alt="Nova Aesthetic Professionals"
            width="44"
            height="44"
            className="logo-img"
            loading="eager"
            decoding="async"
          />
        </picture>
        <span className="logo-wordmark" aria-hidden="true">NOVA</span>
      </a>

      <div className="header-actions">
        <a
          href={INSTAGRAM_URL}
          className="btn-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Nova Aesthetic Professionals"
        >
          <InstagramIcon />
        </a>
        <a
          href="#protocolos"
          className="btn-nav btn-nav-ghost"
          onClick={(e) => scrollToId('protocolos', e)}
        >
          Otros Protocolos VIP
        </a>
        <a href="#quiz" className="btn-nav" onClick={(e) => scrollToId('quiz', e)}>
          Ver Disponibilidad VIP
        </a>
      </div>
    </header>
  )
}
