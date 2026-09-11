import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function EmuInTheSky({ position = [-35000, 3200, 32000], scale = 65 }) {
  const groupRef = useRef()
  const { scene } = useGLTF('/emu_in_the_sky.glb')

  // Clone scene & tune materials for deep-space starlight luminescence
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.raycast = () => null
        if (child.material) {
          const mat = child.material.clone()
          mat.side = THREE.DoubleSide
          mat.transparent = true
          mat.depthWrite = false
          if (mat.color) mat.color.multiplyScalar(1.4)
          if (mat.emissive) {
            mat.emissive = mat.color ? mat.color.clone().multiplyScalar(0.4) : new THREE.Color('#00e5ff')
            mat.emissiveIntensity = 0.8
          }
          child.material = mat
        }
      }
    })
    return clone
  }, [scene])

  // Gentle, majestic cosmological rotation
  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return
    const dist = camera.position.length()
    // Visible throughout Milky Way & Interstellar scale (8k to 550k AU)
    groupRef.current.visible = dist > 8000 && dist < 550000

    if (groupRef.current.visible) {
      const t = clock.elapsedTime
      groupRef.current.rotation.y = t * 0.008
      groupRef.current.rotation.z = Math.sin(t * 0.005) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} raycast={() => null}>
      <primitive object={clonedScene} raycast={() => null} />
      {/* Subtle celestial stardust lighting */}
      <pointLight color='#00e5ff' intensity={3000} distance={15000} position={[0, 50, 100]} />
      <pointLight color='#ff88cc' intensity={2000} distance={15000} position={[0, -50, -100]} />
    </group>
  )
}

useGLTF.preload('/emu_in_the_sky.glb')
