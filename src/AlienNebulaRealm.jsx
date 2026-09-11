import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function AlienNebulaRealm({ 
  position = [-8200000000, -1100000000, 3900000000], 
  scale = 130000 
}) {
  const groupRef = useRef()
  const { scene } = useGLTF('/alien_space_nebula_1_skybox.glb')

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
          // Enhance vibrant alien neon colors and emissive glow
          if (mat.emissive) {
            mat.emissiveIntensity = 1.3
          }
          child.material = mat
        }
      }
    })
    return clone
  }, [scene])

  // Slowly rotate the entire nebula dome for an ethereal, living cosmos feel
  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return
    const dist = camera.position.length()
    // Visible at Level 7, 8, 9 cosmic scales (dist > 120,000,000 AU)
    groupRef.current.visible = dist > 120000000

    if (groupRef.current.visible) {
      const t = clock.elapsedTime
      groupRef.current.rotation.y = t * 0.0012
    }
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} raycast={() => null}>
      <primitive object={clonedScene} raycast={() => null} />
      {/* Dynamic ambient alien core luminescence */}
      <pointLight color='#ff00aa' intensity={5000000000} distance={1500000000} position={[0, 0, 0]} />
      <pointLight color='#00ffff' intensity={3000000000} distance={1500000000} position={[0, 500000000, 0]} />
    </group>
  )
}

useGLTF.preload('/alien_space_nebula_1_skybox.glb')
