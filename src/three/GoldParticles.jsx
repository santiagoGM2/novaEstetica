import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const COUNT = 80
const TMP_OBJ = new THREE.Object3D()

/**
 * 80 instanced spheres distributed on a wide torus around the device,
 * orbiting slowly. Cheap, stable, no shaders.
 */
export default function GoldParticles() {
  const ref = useRef(null)

  const particles = useMemo(() => {
    return Array.from({ length: COUNT }).map(() => ({
      // Initial position on a torus of radius ~2.4 with thickness ~0.3
      angle: Math.random() * Math.PI * 2,
      radius: 2.2 + Math.random() * 0.6,
      height: (Math.random() - 0.5) * 1.6,
      speed: 0.04 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      scale: 0.012 + Math.random() * 0.018,
    }))
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i]
      const a = p.angle + t * p.speed
      const x = Math.cos(a) * p.radius
      const z = Math.sin(a) * p.radius
      const y = p.height + Math.sin(t * 0.6 + p.phase) * 0.18
      TMP_OBJ.position.set(x, y, z)
      TMP_OBJ.scale.setScalar(p.scale)
      TMP_OBJ.updateMatrix()
      ref.current.setMatrixAt(i, TMP_OBJ.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#E0BC7E" transparent opacity={0.85} toneMapped={false} />
    </instancedMesh>
  )
}
