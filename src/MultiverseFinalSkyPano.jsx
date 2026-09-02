import React, { useRef, useMemo } from "react"
import { useLoader, useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function MultiverseFinalSkyPano({ activeCenter = [0, 0, 0] }) {
  const groupRef = useRef()
  const matRef = useRef()

  // Load the pristine HD panorama texture extracted directly from sky_pano_-_milkyway.glb
  const texture = useLoader(THREE.TextureLoader, "/textures/milkyway_pano.jpg")
  
  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.generateMipmaps = true
      texture.needsUpdate = true
    }
  }, [texture])

  // Visible strictly when zooming past the Omniverse into Level 7 (dist > 180,000,000 AU)
  useFrame(({ camera, clock }) => {
    if (!groupRef.current || !matRef.current) return

    const dist = camera.position.length()
    // Appears beyond the Omniverse (Level 6 ends at ~180,000,000 AU)
    const isVisible = dist > 160000000
    groupRef.current.visible = isVisible

    if (isVisible) {
      // Smooth fade-in
      let opacity = 1.0
      if (dist < 260000000) {
        opacity = (dist - 160000000) / 100000000
      }
      matRef.current.opacity = Math.min(1.0, Math.max(0.2, opacity))

      // Slow majestic cosmic celestial drift
      const t = clock.elapsedTime
      groupRef.current.rotation.y = t * 0.0015
    }
  })

  // Colossal celestial sphere (radius 1,400,000,000 AU) enclosing the entire Omniverse!
  return (
    <group ref={groupRef} position={activeCenter}>
      <mesh>
        <sphereGeometry args={[1400000000, 64, 32]} />
        <meshBasicMaterial 
          ref={matRef}
          map={texture} 
          side={THREE.DoubleSide} // 100% visible from both inside and outside with ZERO culling!
          transparent={true}
          opacity={1.0}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
