import React, { useRef, useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function MultiverseFinalSkyPano({ activeCenter = [0, 0, 0] }) {
  const { scene } = useGLTF("/sky_pano_-_milkyway.glb")
  const groupRef = useRef()
  const matRef = useRef()

  // Clone and setup MeshBasicMaterial so it is 100% self-luminous and crystal clear
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        const tex = child.material.emissiveMap || child.material.map
        if (tex) {
          tex.colorSpace = THREE.SRGBColorSpace
          tex.wrapS = THREE.RepeatWrapping
          tex.wrapT = THREE.ClampToEdgeWrapping
        }

        const basicMat = new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.BackSide, // Visible looking outwards from inside the sphere
          transparent: true,
          opacity: 0.0,
          depthWrite: false
        })

        child.material = basicMat
        matRef.current = basicMat
      }
    })
    return clone
  }, [scene])

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return

    const dist = camera.position.length()

    // Appears strictly AFTER the Omniverse (Level 6 is 45,000,000 - 180,000,000)
    // Fades in as camera reaches the outer boundary beyond the Omniverse (dist > 160,000,000 AU)
    const isVisible = dist > 140000000
    groupRef.current.visible = isVisible

    if (isVisible && matRef.current) {
      // Smooth fade in from 140,000,000 to 240,000,000 AU
      let opacity = 1.0
      if (dist < 240000000) {
        opacity = (dist - 140000000) / 100000000
      }
      matRef.current.opacity = Math.min(1.0, Math.max(0.0, opacity))

      // Slow majestic cosmic rotation
      const t = clock.elapsedTime
      groupRef.current.rotation.y = t * 0.002
    }
  })

  // Radius of PanoSphere is 500. Scale of 800,000 gives radius of 400,000,000 AU!
  // Colossal sphere that encloses the entire Omniverse and all 20 Inflaton Domains!
  return (
    <group
      ref={groupRef}
      position={activeCenter}
      scale={[800000, 800000, 800000]}
      rotation={[0, 0, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload("/sky_pano_-_milkyway.glb")
