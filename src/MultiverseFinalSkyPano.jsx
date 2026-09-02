import React, { useRef, useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function MultiverseFinalSkyPano({ activeCenter = [0, 0, 0] }) {
  const { scene } = useGLTF("/sky_pano_-_milkyway.glb")
  const groupRef = useRef()
  const matRef = useRef()

  // Clone the scene and prepare the panoramic material
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        // Ensure texture is rendered on the inside of the sphere
        child.material = child.material.clone()
        child.material.side = THREE.DoubleSide
        child.material.transparent = true
        child.material.opacity = 0
        child.material.depthWrite = false
        if (child.material.map) {
          child.material.map.colorSpace = THREE.SRGBColorSpace
        }
        matRef.current = child.material
      }
    })
    return clone
  }, [scene])

  useFrame(({ camera, clock }) => {
    if (!groupRef.current || !matRef.current) return

    const dist = camera.position.length()
    // Visible at the last point of the Multiverse & Omniverse (dist > 15,000,000 AU)
    const isVisible = dist > 12000000
    groupRef.current.visible = isVisible

    if (isVisible) {
      // Smooth fade-in: Fades in from 15,000,000 to 45,000,000 AU
      let opacity = 0
      if (dist >= 15000000 && dist <= 45000000) {
        opacity = (dist - 15000000) / 30000000
      } else if (dist > 45000000) {
        opacity = 1.0
      }
      matRef.current.opacity = Math.min(1.0, opacity * 0.92)

      // Slow majestic rotation
      const t = clock.elapsedTime
      groupRef.current.rotation.y = t * 0.003
    }
  })

  // Radius of PanoSphere mesh is 500. Scale of 280,000 gives diameter of ~280,000,000 AU enclosing the Multiverse!
  return (
    <group
      ref={groupRef}
      position={activeCenter}
      scale={[280000, 280000, 280000]}
      rotation={[0, 0, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload("/sky_pano_-_milkyway.glb")
