import { useEffect, useState } from 'react'
import { scrollToId } from '../lib/scrollTo'
import { ArrowIcon } from '../lib/icons'

/**
 * Thin sticky bar above the header. Appears after the user scrolls past the
 * first viewport (so it doesn't fight with the hero), and offers an
 * always-present scarcity reminder + one-click path to the calendar.
 */
export default function UrgencyBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`urgency-bar${visible ? ' visible' : ''}`} role="status" aria-hidden={!visible}>
      <div className="urgency-bar-inner">
        <span className="urgency-bar-pulse" aria-hidden="true" />
        <span className="urgency-bar-text">
          <strong>5 cupos premium</strong> esta semana · Sin compromiso
        </span>
        <a
          href="#calendar"
          className="urgency-bar-cta"
          onClick={(e) => scrollToId('calendar', e)}
        >
          Reservar
          <ArrowIcon />
        </a>
      </div>
    </div>
  )
}
