import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Helper function to create a procedural radial gradient texture for the glowing energy
function createGlowTexture(colorInner, colorOuter) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')

  // Draw a radial gradient
  const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256)
  gradient.addColorStop(0, colorInner)      // Center
  gradient.addColorStop(0.4, colorOuter)    // Mid
  gradient.addColorStop(1, 'rgba(0,0,0,0)') // Edge (transparent)

  context.fillStyle = gradient
  context.fillRect(0, 0, 512, 512)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function GalacticCore() {
  const outerGlowRef = useRef()
  const innerCoreRef = useRef()

  // Generate textures once
  const { outerTexture, innerTexture } = useMemo(() => {
    // Colors matching the NASA image core (Orange/Gold/White)
    return {
      outerTexture: createGlowTexture('rgba(255, 180, 100, 1.0)', 'rgba(255, 100, 20, 0.4)'),
      innerTexture: createGlowTexture('rgba(255, 255, 255, 1.0)', 'rgba(255, 220, 180, 0.8)')
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Breathing math: Sine wave that gently oscillates over time
    // Base scale + (Pulse amplitude * sine wave)
    if (outerGlowRef.current) {
      const outerScale = 12000 + Math.sin(t * 1.5) * 800
      outerGlowRef.current.scale.set(outerScale, outerScale, 1)
      
      // Pulse opacity slightly
      outerGlowRef.current.material.opacity = 0.8 + Math.sin(t * 2.0) * 0.1
    }

    if (innerCoreRef.current) {
      const innerScale = 4000 + Math.sin(t * 3.0) * 300 // Faster, tighter pulse for the inner core
      innerCoreRef.current.scale.set(innerScale, innerScale, 1)
      
      innerCoreRef.current.material.opacity = 0.9 + Math.sin(t * 4.0) * 0.1
    }
  })

  return (
    <group position={[0, 0, -22000]}> {/* Positioned far away, near the edge of the skybox */}
      {/* Massive Outer Glow */}
      <sprite ref={outerGlowRef}>
        <spriteMaterial 
          map={outerTexture} 
          transparent={true} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </sprite>

      {/* Intense Inner Core Singularity */}
      <sprite ref={innerCoreRef}>
        <spriteMaterial 
          map={innerTexture} 
          transparent={true} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </sprite>
    </group>
  )
}
