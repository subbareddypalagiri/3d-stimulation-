import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SolarSystem from './SolarSystem'

const starTypes = [
  { dark: '#220000', red: '#cc1100', org: '#ff6600', wht: '#ffeeaa' }, // 0: Yellow-Gold (Sol / G-type)
  { dark: '#000022', red: '#0033cc', org: '#0099ff', wht: '#ffffff' }, // 1: Electric Blue (Sirius / A-type)
  { dark: '#330000', red: '#ff0000', org: '#cc3300', wht: '#ffaaaa' }, // 2: Crimson Red Dwarf (Proxima / M-dwarf)
  { dark: '#112211', red: '#22aa22', org: '#55ff55', wht: '#eeffee' }, // 3: Emerald Exotic
  { dark: '#220022', red: '#9900cc', org: '#dd33ff', wht: '#ffeeff' }, // 4: Violet Pulsar
  { dark: '#222222', red: '#aaaaaa', org: '#dddddd', wht: '#ffffff' }, // 5: Blinding White Dwarf
]

// 24 Real Named Neighboring Star Systems around Sol (Total 25 Systems!)
// Clean, elegant, proportional scales (0.5 to 1.5) and well-spaced coordinates
const NEIGHBOR_STAR_SYSTEMS = [
  // 1-24: Original Neighbor Systems (Balanced Scales)
  { name: 'Alpha Centauri A', pos: [580, 80, -320], starType: 0, scale: 0.95, planets: 4 },
  { name: 'Proxima Centauri', pos: [720, -110, -420], starType: 2, scale: 0.55, planets: 2 },
  { name: "Barnard's Star", pos: [-850, 160, 480], starType: 2, scale: 0.6, planets: 3 },
  { name: 'Wolf 359', pos: [980, -220, 650], starType: 2, scale: 0.5, planets: 2 },
  { name: 'Lalande 21185', pos: [-1150, -80, -780], starType: 2, scale: 0.65, planets: 3 },
  { name: 'Sirius System', pos: [1380, 280, -920], starType: 1, scale: 1.25, planets: 5 },
  { name: 'Luyten 726-8', pos: [-1550, 320, 950], starType: 4, scale: 0.55, planets: 2 },
  { name: 'Ross 128', pos: [1750, -160, -1150], starType: 2, scale: 0.6, planets: 3 },
  { name: 'Epsilon Eridani', pos: [-1980, -380, 1280], starType: 0, scale: 0.85, planets: 4 },
  { name: 'Procyon', pos: [2200, 420, 1450], starType: 5, scale: 1.1, planets: 4 },
  { name: '61 Cygni', pos: [-2450, 210, -1680], starType: 0, scale: 0.75, planets: 3 },
  { name: 'Epsilon Indi', pos: [2680, -310, -1890], starType: 0, scale: 0.7, planets: 3 },
  { name: 'Tau Ceti', pos: [-2920, -480, 2100], starType: 0, scale: 0.85, planets: 4 },
  { name: "Kapteyn's Star", pos: [3150, 520, -2250], starType: 2, scale: 0.6, planets: 3 },
  { name: 'Vega', pos: [-3450, 380, -2480], starType: 1, scale: 1.35, planets: 5 },
  { name: 'Kepler-186', pos: [3780, -420, 2700], starType: 2, scale: 0.7, planets: 4 },
  { name: 'Trappist-1', pos: [-4100, -280, -2950], starType: 2, scale: 0.5, planets: 5 },
  { name: 'Gliese 581', pos: [4450, 620, 3180], starType: 2, scale: 0.65, planets: 3 },
  { name: 'HD 209458', pos: [-4800, 480, -3400], starType: 0, scale: 0.9, planets: 4 },
  { name: '51 Pegasi', pos: [5150, -520, 3650], starType: 0, scale: 0.85, planets: 3 },
  { name: 'Pollux', pos: [-5500, -380, -3900], starType: 0, scale: 1.2, planets: 5 },
  { name: 'Arcturus', pos: [5850, 580, 4150], starType: 2, scale: 1.4, planets: 5 },
  { name: 'Aldebaran', pos: [-6200, 430, -4400], starType: 2, scale: 1.35, planets: 4 },
  { name: 'Betelgeuse', pos: [6600, -650, 4700], starType: 2, scale: 1.5, planets: 6 }
]

const generateAllSystems = () => {
  // 1. Home Solar System (ID 0) at origin
  const list = [
    {
      id: 0,
      name: 'Sol (Home System)',
      position: [0, 0, 0],
      scale: 1.0,
      speedMultiplier: 1.0,
      sunColors: starTypes[0],
      planetCount: 9
    }
  ]

  // 2. Add all 44 Neighboring & Exotic Stellar Systems
  NEIGHBOR_STAR_SYSTEMS.forEach((star, index) => {
    list.push({
      id: index + 1,
      name: star.name,
      position: star.pos,
      scale: star.scale,
      speedMultiplier: 0.3 + (index % 6) * 0.18,
      sunColors: starTypes[star.starType],
      planetCount: star.planets
    })
  })

  return list
}

export default function UniverseManager({ flyTo, onActiveSystemChange }) {
  const [systems, setSystems] = useState(generateAllSystems)
  const [activeSystemId, setActiveSystemId] = useState(0)
  const groupRef = useRef()

  useEffect(() => {
    if (onActiveSystemChange && systems[activeSystemId]) {
      onActiveSystemChange(systems[activeSystemId].position)
    }
  }, [activeSystemId, systems, onActiveSystemChange])

  // Smoothly manage visibility: All 45 solar systems visible throughout Level 1 (dist < 65,000)
  useFrame(({ camera }) => {
    if (groupRef.current) {
      const dist = camera.position.length()
      groupRef.current.visible = dist < 65000
    }
  })

  return (
    <group ref={groupRef}>
      {systems.map((system) => (
        <SolarSystem 
          key={system.id} 
          {...system} 
          onSelectSystem={(pos, scale) => {
            setActiveSystemId(system.id)
            if (flyTo) flyTo(pos, scale * 4)
          }} 
        />
      ))}
    </group>
  )
}
