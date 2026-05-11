import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import LaserDevice from '../three/LaserDevice'
import GoldParticles from '../three/GoldParticles'

/**
 * Heavy R3F payload. Code-split out of the main bundle via React.lazy in
 * Hero3DScene.jsx — only loaded when the hero scrolls into view.
 */
export default function Hero3DCanvas({ scrollProgress }) {
  useEffect(() => {
    // Diagnostic: confirm the chunk mounted in dev consoles. Remove once
    // the user confirms the scene renders.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[Hero3D] Hero3DCanvas mounted')
    }
  }, [])

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.4, 4.6], fov: 38, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        // eslint-disable-next-line no-console
        console.log('[Hero3D] Canvas created — WebGL ctx:', !!gl, 'size:', gl?.domElement?.width, 'x', gl?.domElement?.height)
      }}
    >
      {/* Hemisphere light: warm sky / bronze ground — gives PBR materials
         something to reflect even without an HDRI environment */}
      <hemisphereLight args={['#E0BC7E', '#3D2B1F', 0.6]} />
      <ambientLight intensity={0.45} color="#3D2B1F" />
      <directionalLight position={[3, 4, 5]} intensity={1.55} color="#FFE9C2" />
      <directionalLight position={[-3, 2, -2]} intensity={0.65} color="#C49B7E" />
      <pointLight position={[0, 0, 1.5]} intensity={1.8} color="#E0BC7E" distance={6} />
      <Suspense fallback={null}>
        <LaserDevice scrollProgress={scrollProgress} />
        <GoldParticles />
      </Suspense>
    </Canvas>
  )
}
