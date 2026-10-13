import { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PRIME_CENTER = new THREE.Vector3(0, 180000000, 680000000)
const SKILL_CENTER = new THREE.Vector3(110000, 32000, -180000)
const M87_CENTER = new THREE.Vector3(-620000, 190000, 540000)
const SOL_CENTER = new THREE.Vector3(0, 0, 0)

/**
 * Intelligent adaptive cosmic speed calculator:
 * Uses continuous exponential distance scaling across all 9 cosmological levels.
 * Guarantees effortless traversal from planetary surfaces (AU < 50) all the way to
 * the deep Multiverse (35 Billion AU) without speed ceilings or invisible walls.
 */
export function getCosmicFlightSpeed(camera, target) {
  const camPos = camera.position
  const targetDist = target ? camPos.distanceTo(target) : 100
  const distToSol = camPos.distanceTo(SOL_CENTER)
  const distToPrime = camPos.distanceTo(PRIME_CENTER)
  const distToSkill = camPos.distanceTo(SKILL_CENTER)
  const distToM87 = camPos.distanceTo(M87_CENTER)

  // 1. Close-up Planetary / Celestial Surface Inspection
  if (targetDist < 70 && distToSol < 10000) {
    return Math.max(4.0, targetDist * 0.42)
  }

  // 2. Prime Cosmic Realm (13 Projects Orbit)
  if (distToPrime < 120 * 650000) {
    const localDist = Math.min(distToPrime, targetDist)
    return Math.max(650000 * 0.12, localDist * 0.38)
  }

  // 3. Subbareddy Skill Web
  if (distToSkill < 60000) {
    const localDist = Math.min(distToSkill, targetDist)
    return Math.max(45, localDist * 0.36)
  }

  // 4. M87 Relativistic Black Hole Gateway
  if (distToM87 < 80000) {
    const localDist = Math.min(distToM87, targetDist)
    return Math.max(60, localDist * 0.36)
  }

  // 5. Universal Exponential Flight (Sol -> Milky Way -> Virgo -> Cosmic Web -> Multiverse)
  // Each wheel gesture travels ~20-25% of current distance for natural, swift navigation
  const currentScale = Math.max(distToSol, 110)
  return Math.max(32, currentScale * 0.52)
}

/**
 * CosmicFlightNavigator:
 * Provides unrestricted 360° free-flight navigation across all cosmic scales.
 * Scrolling the mouse wheel smoothly translates camera & target forward/backward
 * along the camera's active view vector, allowing effortless free motion to any
 * planet, star, or deep-space nebula without pivot locks.
 */
export default function CosmicFlightNavigator({ cameraControlRef, scrollSpeed = 0.6 }) {
  const { gl, camera } = useThree()
  const flightVelocity = useRef(0)

  useEffect(() => {
    const canvas = gl.domElement
    if (!canvas) return

    const handleWheel = (e) => {
      const controls = cameraControlRef.current
      if (!controls) return

      // Prevent page scroll and eliminate native dolly conflicts
      e.preventDefault()
      e.stopPropagation()

      // Normalize wheel delta across mice & trackpads
      const rawDelta = e.deltaY
      const normalizedMagnitude = Math.abs(rawDelta) > 40 ? Math.sign(rawDelta) : rawDelta / 40
      const forwardDir = -normalizedMagnitude
      const isShift = e.shiftKey
      const baseSpeed = getCosmicFlightSpeed(camera, controls._target)
      const impulse = forwardDir * baseSpeed * scrollSpeed * (isShift ? 3.0 : 1.0)

      // Accumulate smooth flight momentum
      flightVelocity.current += impulse
      const maxImpulse = baseSpeed * 10.0 * scrollSpeed
      flightVelocity.current = THREE.MathUtils.clamp(flightVelocity.current, -maxImpulse, maxImpulse)
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [gl, camera, cameraControlRef, scrollSpeed])

  // Continuous frame update loop: applies momentum dolly
  useFrame(({ camera: activeCam }, delta) => {
    const controls = cameraControlRef.current
    if (!controls) return

    const dt = Math.min(delta, 0.1)

    // Smooth physical exponential dolly
    if (Math.abs(flightVelocity.current) > 0.0001) {
      const step = flightVelocity.current * dt * 8.0
      controls.dolly(step, false)

      // Exponential damping for luxurious, buttery glide
      flightVelocity.current *= Math.pow(0.72, dt * 60)
      if (Math.abs(flightVelocity.current) < 0.001) {
        flightVelocity.current = 0
      }
    }
  })

  return null
}
