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

function makeStarLabelSprite(name, color = "#ffeedd") {
  const fontSize = 38
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  const textWidth = Math.ceil(ctx.measureText("✦ " + name).width)
  canvas.width = textWidth + 56
  canvas.height = fontSize + 44

  const ctx2 = canvas.getContext("2d")
  ctx2.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx2.textBaseline = "middle"

  // Rounded pill background with subtle glow border
  const r = 20
  const x = 4, y = 4, w = canvas.width - 8, h = canvas.height - 8
  ctx2.fillStyle = "rgba(6, 10, 20, 0.84)"
  ctx2.strokeStyle = color
  ctx2.lineWidth = 3
  ctx2.beginPath()
  ctx2.moveTo(x + r, y)
  ctx2.arcTo(x + w, y, x + w, y + h, r)
  ctx2.arcTo(x + w, y + h, x, y + h, r)
  ctx2.arcTo(x, y + h, x, y, r)
  ctx2.arcTo(x, y, x + w, y, r)
  ctx2.closePath()
  ctx2.fill()
  ctx2.stroke()

  // Glowing symbol and text
  ctx2.shadowColor = color
  ctx2.shadowBlur = 12
  ctx2.fillStyle = color
  ctx2.fillText("✦ " + name, 26, canvas.height / 2)
  ctx2.shadowBlur = 0
  ctx2.fillStyle = "#ffffff"
  ctx2.fillText("✦ " + name, 26, canvas.height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false
  })
  const sprite = new THREE.Sprite(mat)
  const spriteH = 14
  sprite.scale.set(spriteH * (canvas.width / canvas.height), spriteH, 1)
  return sprite
}

export default function SolarSystem({ 
  id = 0,
  name = 'Star System',
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
  const labelGroupRef = useRef()
  
  // Sleek, compact procedural planets
  const planetsData = useMemo(() => {
    // HOME SYSTEM (ID = 0): THE REAL 9 PLANETS
    if (id === 0) {
      return [
        { name: 'Mercury', position: [15, 0, 0], radius: 0.38, orbitSpeed: 0.04, rotationSpeed: 0.01, textures: { color: '/textures/mercury.jpg' }, hasClouds: false, ring: null, atmosphere: null },
        { name: 'Venus', position: [22, 0, 0], radius: 0.95, orbitSpeed: 0.015, rotationSpeed: -0.002, textures: { color: '/textures/venus.jpg' }, hasClouds: false, ring: null, atmosphere: '#e3bb76', atmoPower: 1.8 },
        { name: 'Earth', position: [30, 0, 0], radius: 1, orbitSpeed: 0.01, rotationSpeed: 0.02, textures: { color: '/textures/earth_color.jpg', normal: '/textures/earth_normal.png', specular: '/textures/earth_water.png', clouds: '/textures/earth_clouds.png' }, hasClouds: true, ring: null, atmosphere: '#38bdf8', atmoPower: 2.0 },
        { name: 'Mars', position: [40, 0, 0], radius: 0.53, orbitSpeed: 0.008, rotationSpeed: 0.018, textures: { color: '/textures/mars.jpg' }, hasClouds: false, ring: null, atmosphere: '#ef4444', atmoPower: 3.2 },
        { name: 'Jupiter', position: [65, 0, 0], radius: 2.8, orbitSpeed: 0.002, rotationSpeed: 0.04, textures: { color: '/textures/jupiter.jpg' }, hasClouds: false, ring: null, atmosphere: '#f59e0b', atmoPower: 2.4 },
        { name: 'Saturn', position: [95, 0, 0], radius: 2.4, orbitSpeed: 0.0009, rotationSpeed: 0.038, textures: { color: '/textures/saturn.jpg' }, hasClouds: false, ring: { innerRadius: 2.8, outerRadius: 5.8, color: '#fbbf24' }, atmosphere: '#fbbf24', atmoPower: 2.4 },
        { name: 'Uranus', position: [125, 0, 0], radius: 1.2, orbitSpeed: 0.0004, rotationSpeed: -0.03, textures: { color: '/textures/uranus.jpg' }, hasClouds: false, ring: { innerRadius: 1.5, outerRadius: 2.2, color: '#67e8f9' }, atmosphere: '#67e8f9', atmoPower: 2.0 },
        { name: 'Neptune', position: [155, 0, 0], radius: 1.1, orbitSpeed: 0.0001, rotationSpeed: 0.032, textures: { color: '/textures/neptune.jpg' }, hasClouds: false, ring: null, atmosphere: '#3b82f6', atmoPower: 2.0 },
        { name: 'Pluto', position: [175, 0, 0], radius: 0.18, orbitSpeed: 0.00005, rotationSpeed: 0.005, textures: { color: '/textures/mercury.jpg' }, hasClouds: false, ring: null, atmosphere: null }
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

  // Billboard name badge sprite generated once
  const labelSprite = useMemo(() => {
    if (id === 0) return null
    const starGlowColor = sunColors.colorOrange || sunColors.org || sunColors.colorRed || sunColors.red || "#ffaa33"
    return makeStarLabelSprite(name, starGlowColor)
  }, [id, name, sunColors])

  // LOD: Only render planetary systems when camera is within proximity of this star system
  // Dynamic visibility for star label: visible in space (< 65,000 AU), hides when up close (< 45 AU)
  useFrame(({ camera }) => {
    const dist = camera.position.distanceTo(systemPos)
    if (id !== 0) {
      const shouldShow = dist < 450 * Math.max(scale, 1)
      if (shouldShow !== showPlanets) {
        setShowPlanets(shouldShow)
      }
    }

    if (labelGroupRef.current) {
      const isLabelVisible = dist >= 45 * Math.max(scale, 0.8) && dist < 65000
      if (labelGroupRef.current.visible !== isLabelVisible) {
        labelGroupRef.current.visible = isLabelVisible
      }
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
    clampPitch: false
  })

  // Direct Click-to-Fly handler for mouse clicks on star or label
  const handleSelect = (e) => {
    e.stopPropagation()
    if (onSelectSystem) {
      onSelectSystem(position, scale)
    }
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

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
            id={id}
            colorDark={sunColors.colorDark || sunColors.dark}
            colorRed={sunColors.colorRed || sunColors.red}
            colorOrange={sunColors.colorOrange || sunColors.org}
            colorWhite={sunColors.colorWhite || sunColors.wht}
          />
        </group>
        
        {/* Inner trackball grab mesh for close-up inspection */}
        <mesh {...bindSunGrab}>
          <sphereGeometry args={[11, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Generous Click-to-Fly hit volume (easily clicked from afar) */}
        <mesh
          onClick={handleSelect}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[id === 0 ? 16 : 38, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Floating 3D Star Name Badge (Interactive & Click-to-Fly) */}
      {labelSprite && (
        <group
          ref={labelGroupRef}
          position={[0, 18, 0]}
          onClick={handleSelect}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <primitive object={labelSprite} />
        </group>
      )}

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
