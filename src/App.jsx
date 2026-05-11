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
import Calendar from './components/Calendar'
import Footer from './components/Footer'
import Fabs from './components/Fabs'

export default function App() {
  // Keeps backward compat for any leftover `.reveal` markers (Calendar/Footer
  // still use them). New M2 components animate via GSAP ScrollTrigger directly.
  useScrollReveal()

  return (
    <SmoothScrollProvider>
      <ScrollProgress />
      <UrgencyBar />
      <Header />
      <main>
        <Hero />
        <EspacioSection />
        <Conciencia />
        <SideStep />
        <Quiz />
        <SocialProof />
        <Calendar />
      </main>
      <Footer />
      <Fabs />
    </SmoothScrollProvider>
  )
}
