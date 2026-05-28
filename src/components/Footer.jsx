import { InstagramIcon, MapPinIcon, WhatsAppIcon } from '../lib/icons'

const INSTAGRAM_URL = 'https://www.instagram.com/nova_aestheticp/'
const MAPS_URL = 'https://maps.app.goo.gl/?q=Nova+aesthetic+professionals'
const WHATSAPP_URL = (
  import.meta.env.VITE_WHATSAPP_LINK ??
  'https://api.whatsapp.com/send/?phone=573105725730&text&type=phone_number&app_absent=0'
)

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <picture>
            <source srcSet="/assets/logo/logo.webp" type="image/webp" />
            <img
              src="/assets/logo/logo.jpeg"
              alt="Nova Aesthetic Professionals"
              width="88"
              height="88"
              className="footer-logo-img"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <p className="footer-tagline">Nova Aesthetic Professionals · Cali</p>
        </div>

        <div className="footer-links">
          <a
            href={WHATSAPP_URL}
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>
          <a
            href={INSTAGRAM_URL}
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Síguenos en Instagram"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>
          <a
            href={MAPS_URL}
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver ubicación en Google Maps"
          >
            <MapPinIcon />
            <span>Ubicación</span>
          </a>
        </div>

        <div className="footer-bottom">
          <p className="footer-meta">© {year} Nova Aesthetic Professionals</p>
          <p className="footer-meta">Tecnología Fenix 4 · Atención Premium</p>
        </div>
      </div>
    </footer>
  )
}
