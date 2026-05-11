import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * The "device": a metallic gold ring with a vertical volumetric beam
 * emerging through its center. Pure geometry + standard materials with
 * strong emissive — visibility-first (no HDRI required).
 */
export default function LaserDevice({ scrollProgress = 0 }) {
  const groupRef = useRef(null)
  const beamGroupRef = useRef(null)

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      groupRef.current.rotation.y = t * 0.18 + scrollProgress * 0.4
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.04 - scrollProgress * 0.15
    }
    if (beamGroupRef.current) {
      const pulse = 0.92 + Math.sin(state.clock.elapsedTime * 1.4) * 0.08
      beamGroupRef.current.scale.x = pulse
      beamGroupRef.current.scale.z = pulse
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer ring — moderate metalness with strong gold emissive so it
         glows even without an environment map */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.06, 24, 96]} />
        <meshStandardMaterial
          color="#C9A164"
          metalness={0.4}
          roughness={0.28}
          emissive="#C9A164"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Inner thin ring — pure emissive bright gold */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.88, 0.012, 16, 96]} />
        <meshBasicMaterial color="#FFE9C2" toneMapped={false} />
      </mesh>

      {/* Beam: vertical light shaft through the ring's center */}
      <group ref={beamGroupRef}>
        {/* Bright core */}
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 4.0, 16, 1, true]} />
          <meshBasicMaterial
            color="#FFE9C2"
            transparent
            opacity={0.95}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {/* Mid glow */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 4.2, 16, 1, true]} />
          <meshBasicMaterial
            color="#E0BC7E"
            transparent
            opacity={0.42}
            depthWrite={false}
            toneMapped={false}
            blending={2 /* THREE.AdditiveBlending */}
          />
        </mesh>
        {/* Outer halo */}
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 4.4, 16, 1, true]} />
          <meshBasicMaterial
            color="#C9A164"
            transparent
            opacity={0.18}
            depthWrite={false}
            toneMapped={false}
            blending={2}
          />
        </mesh>
      </group>
    </group>
  )
}
