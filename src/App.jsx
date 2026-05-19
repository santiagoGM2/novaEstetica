import { useState } from 'react'
import { useScrollReveal } from './hooks/useScrollReveal'
import SmoothScrollProvider from './components/SmoothScrollProvider'
import ScrollProgress from './components/ScrollProgress'
import UrgencyBar from './components/UrgencyBar'
import Header from './components/Header'
import Hero from './components/Hero'
import EspacioSection from './components/EspacioSection'
import Conciencia from './components/Conciencia'
import SideStep from './components/SideStep'
import Quiz from './components/Quiz'
import SocialProof from './components/SocialProof'
import Footer from './components/Footer'
import Fabs from './components/Fabs'

export default function App() {
  // Keeps backward compat for any leftover `.reveal` markers (Footer still
  // uses them). New components animate via GSAP ScrollTrigger directly.
  useScrollReveal()

  // Seed que el Quiz lee al montar para pre-seleccionar la zona desde
  // las tarjetas de servicios. `key` fuerza re-evaluación cada vez que
  // el usuario clickea otra tarjeta.
  const [quizSeed, setQuizSeed] = useState(null)

  const handlePickService = (zone) => {
    // zone === null → solo scrolleamos sin pre-seleccionar (caso Corporales)
    setQuizSeed(zone ? { preselectZone: zone, key: Date.now() } : null)
    setTimeout(() => {
      const q = document.getElementById('quiz')
      if (q) q.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 30)
  }

  return (
    <SmoothScrollProvider>
      <ScrollProgress />
      <UrgencyBar />
      <Header />
      <main>
        <Hero />
        <EspacioSection />
        <Conciencia />
        <SideStep onPickService={handlePickService} />
        <Quiz seed={quizSeed} />
        <SocialProof />
      </main>
      <Footer />
      <Fabs />
    </SmoothScrollProvider>
  )
}
