import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Sun from './Sun'
import Planet from './Planet'
import { useKineticTrackball } from './useKineticTrackball'

const AVAILABLE_TEXTURES = [
  { color: '/textures/mercury.jpg' },
  { color: '/textures/venus.jpg' },
  { color: '/textures/earth_color.jpg', normal: '/textures/earth_normal.png', specular: '/textures/earth_water.png', clouds: '/textures/earth_clouds.png' },
  { color: '/textures/mars.jpg' },
  { color: '/textures/jupiter.jpg' },
  { color: '/textures/saturn.jpg' },
  { color: '/textures/uranus.jpg' },
  { color: '/textures/neptune.jpg' }
]

export const SOL_PLANETS = [
  { name: 'Mercury', symbol: '☿', pos: [15, 0, 0], radius: 0.38, color: '#b5b5b5' },
  { name: 'Venus', symbol: '♀', pos: [22, 0, 0], radius: 0.95, color: '#e3bb76' },
  { name: 'Earth', symbol: '🌍', pos: [30, 0, 0], radius: 1.0, color: '#38bdf8' },
  { name: 'Mars', symbol: '♂', pos: [40, 0, 0], radius: 0.53, color: '#ef4444' },
  { name: 'Jupiter', symbol: '♃', pos: [65, 0, 0], radius: 2.8, color: '#f59e0b' },
  { name: 'Saturn', symbol: '♄', pos: [95, 0, 0], radius: 2.4, color: '#fbbf24' },
  { name: 'Uranus', symbol: '♅', pos: [125, 0, 0], radius: 1.2, color: '#67e8f9' },
  { name: 'Neptune', symbol: '♆', pos: [155, 0, 0], radius: 1.1, color: '#3b82f6' },
  { name: 'Pluto', symbol: '♇', pos: [175, 0, 0], radius: 0.18, color: '#cbd5e1' }
]

export default function SolarSystem({ 
  id = 0,
  position = [0, 0, 0], 
  sunColors, 
  speedMultiplier = 1,
  scale = 1,
  planetCount = 6, 
  onSelectSystem,
  onSelectPlanet
}) {
  const [showPlanets, setShowPlanets] = useState(id === 0)
  const systemPos = useMemo(() => new THREE.Vector3(...position), [position])
  
  // Sleek, compact procedural planets
  const planetsData = useMemo(() => {
    // HOME SYSTEM (ID = 0): THE REAL 9 PLANETS
    if (id === 0) {
      return [
        { name: 'Mercury', position: [15, 0, 0], radius: 0.38, orbitSpeed: 0.04, rotationSpeed: 0.01, textures: { color: '/textures/mercury.jpg' }, hasClouds: false, ring: null },
        { name: 'Venus', position: [22, 0, 0], radius: 0.95, orbitSpeed: 0.015, rotationSpeed: -0.002, textures: { color: '/textures/venus.jpg' }, hasClouds: false, ring: null },
        { name: 'Earth', position: [30, 0, 0], radius: 1, orbitSpeed: 0.01, rotationSpeed: 0.02, textures: { color: '/textures/earth_color.jpg', normal: '/textures/earth_normal.png', specular: '/textures/earth_water.png', clouds: '/textures/earth_clouds.png' }, hasClouds: true, ring: null },
        { name: 'Mars', position: [40, 0, 0], radius: 0.53, orbitSpeed: 0.008, rotationSpeed: 0.018, textures: { color: '/textures/mars.jpg' }, hasClouds: false, ring: null },
        { name: 'Jupiter', position: [65, 0, 0], radius: 2.8, orbitSpeed: 0.002, rotationSpeed: 0.04, textures: { color: '/textures/jupiter.jpg' }, hasClouds: false, ring: null },
        { name: 'Saturn', position: [95, 0, 0], radius: 2.4, orbitSpeed: 0.0009, rotationSpeed: 0.038, textures: { color: '/textures/saturn.jpg' }, hasClouds: false, ring: { innerRadius: 3.0, outerRadius: 5.5, color: '#eebb99' } },
        { name: 'Uranus', position: [125, 0, 0], radius: 1.2, orbitSpeed: 0.0004, rotationSpeed: -0.03, textures: { color: '/textures/uranus.jpg' }, hasClouds: false, ring: { innerRadius: 1.6, outerRadius: 2.1, color: '#99ccff' } },
        { name: 'Neptune', position: [155, 0, 0], radius: 1.1, orbitSpeed: 0.0001, rotationSpeed: 0.032, textures: { color: '/textures/neptune.jpg' }, hasClouds: false, ring: null },
        { name: 'Pluto', position: [175, 0, 0], radius: 0.18, orbitSpeed: 0.00005, rotationSpeed: 0.005, textures: { color: '/textures/mercury.jpg' }, hasClouds: false, ring: null }
      ]
    }

    // ALIEN SYSTEMS (ID > 0): ELEGANT, COMPACT REALISTIC PLANETS
    const randomPlanets = []
    let currentOrbit = 12
    const numPlanets = Math.min(planetCount, 6) // Max 6 planets per alien system to prevent visual clutter
    
    for (let i = 0; i < numPlanets; i++) {
      const tex = AVAILABLE_TEXTURES[i % AVAILABLE_TEXTURES.length]
      const isGasGiant = i >= 3 && Math.random() > 0.4
      
      // Proportional, realistic radii (never giant blobs!)
      const radius = isGasGiant ? 0.75 + Math.random() * 0.7 : 0.25 + Math.random() * 0.35
      const orbitSpeed = (0.3 / (currentOrbit * 0.1)) * (0.6 + Math.random() * 0.4)
      
      let ring = null
      if (isGasGiant && Math.random() > 0.4) {
        ring = {
          innerRadius: radius * 1.3,
          outerRadius: radius * 2.2,
          color: new THREE.Color().setHSL((i * 0.2) % 1.0, 0.4, 0.6).getStyle()
        }
      }

      randomPlanets.push({
        name: `Planet-${i + 1}`,
        position: [currentOrbit, 0, 0],
        radius,
        orbitSpeed,
        rotationSpeed: 0.01 + Math.random() * 0.03,
        textures: tex,
        hasClouds: !!tex.clouds,
        ring
      })
      
      currentOrbit += radius * 2 + 5 + Math.random() * 6
    }
    return randomPlanets
  }, [id, planetCount])

  // LOD: Only render planetary systems when camera is within proximity of this star system
  useFrame(({ camera }) => {
    if (id === 0) return // Home Sol system always has planets
    const dist = camera.position.distanceTo(systemPos)
    const shouldShow = dist < 450 * Math.max(scale, 1)
    if (shouldShow !== showPlanets) {
      setShowPlanets(shouldShow)
    }
  })

  const sunGroupRef = useRef()
  const { bindGrab: bindSunGrab } = useKineticTrackball({
    targetRef: sunGroupRef,
    idleDriftY: 0.002,
    idleDriftX: 0,
    sensitivityX: 0.005,
    sensitivityY: 0.004,
    damping: 0.92,
    clampPitch: false,
    onClick: () => {
      if (onSelectSystem) {
        onSelectSystem(position, scale)
      }
    }
  })

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Dynamic pointLight ONLY for Home Sol system (preserves pure 60fps & prevents lighting blowout) */}
      {id === 0 && (
        <pointLight 
          intensity={2000} 
          color={sunColors.colorWhite || sunColors.wht} 
          distance={800} 
          decay={1.8} 
        />
      )}
      
      {/* Interactive Sun with 360° kinetic trackball and hit target */}
      <group>
        <group ref={sunGroupRef}>
          <Sun 
            colorDark={sunColors.colorDark || sunColors.dark}
            colorRed={sunColors.colorRed || sunColors.red}
            colorOrange={sunColors.colorOrange || sunColors.org}
            colorWhite={sunColors.colorWhite || sunColors.wht}
          />
        </group>
        <mesh {...bindSunGrab}>
          <sphereGeometry args={[11, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Planets rendered when camera is near this solar system */}
      {showPlanets && planetsData.map((planet, idx) => (
        <Planet 
          key={idx}
          {...planet}
          orbitSpeed={planet.orbitSpeed * speedMultiplier}
          rotationSpeed={planet.rotationSpeed * speedMultiplier}
          onClick={onSelectPlanet}
        />
      ))}
    </group>
  )
}
