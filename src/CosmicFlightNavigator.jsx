import { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PRIME_CENTER = new THREE.Vector3(0, 180000000, 680000000)
const SKILL_CENTER = new THREE.Vector3(110000, 32000, -180000)
const M87_CENTER = new THREE.Vector3(-620000, 190000, 540000)
const SOL_CENTER = new THREE.Vector3(0, 0, 0)

/**
 * Intelligent adaptive cosmic speed calculator:
 * Determines the ideal travel velocity based on whether the camera is near a planetary surface,
 * inside the Prime Cosmic Realm (13 Projects Orbit), orbiting a star system, or transiting
 * the deep intergalactic void and multiverse horizons.
 */
export function getCosmicFlightSpeed(camera, target) {
  const camPos = camera.position
  const targetDist = target ? camPos.distanceTo(target) : 100
  const distToSol = camPos.distanceTo(SOL_CENTER)
  const distToPrime = camPos.distanceTo(PRIME_CENTER)
  const distToSkill = camPos.distanceTo(SKILL_CENTER)
  const distToM87 = camPos.distanceTo(M87_CENTER)

  // 1. Inside Prime Cosmic Realm (13 Projects Orbit)
  // Realm scale factor is 650,000 AU; total span is ~55,000,000 AU
  if (distToPrime < 120 * 650000) {
    return Math.max(650000 * 0.08, targetDist * 0.045)
  }

  // 2. Near Solar System / Earth / Inner Planets
  if (distToSol < 3500) {
    return Math.max(1.5, Math.min(targetDist * 0.05, 120))
  }

  // 3. Near Skill Web
  if (distToSkill < 60000) {
    return Math.max(80, Math.min(targetDist * 0.06, 2500))
  }

  // 4. Near M87 Relativistic Black Hole
  if (distToM87 < 80000) {
    return Math.max(120, Math.min(targetDist * 0.06, 4000))
  }

  // 5. Interstellar, Intergalactic & Multiverse Deep Void
  if (distToSol < 120000) {
    return Math.max(300, Math.min(distToSol * 0.04, 6000))
  } else if (distToSol < 1000000) {
    return Math.max(4000, Math.min(distToSol * 0.05, 45000))
  } else if (distToSol < 50000000) {
    return Math.max(35000, Math.min(distToSol * 0.06, 1800000))
  } else {
    // Deep cosmic web & multiverse bubbles (up to 32 Billion AU)
    return Math.max(1500000, Math.min(distToSol * 0.08, 120000000))
  }
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

      // negative deltaY = forward into view; positive = backward
      const forwardDir = e.deltaY < 0 ? 1 : -1
      const isShift = e.shiftKey
      const baseSpeed = getCosmicFlightSpeed(camera, controls._target)
      const impulse = forwardDir * baseSpeed * scrollSpeed * (isShift ? 3.5 : 1.0)

      // Accumulate smooth flight momentum
      flightVelocity.current += impulse
      // Clamp peak impulse to maintain control during aggressive scrolling
      const maxImpulse = baseSpeed * 12.0 * scrollSpeed
      flightVelocity.current = THREE.MathUtils.clamp(flightVelocity.current, -maxImpulse, maxImpulse)
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [gl, camera, cameraControlRef, scrollSpeed])

  // Continuous frame update loop: applies momentum & maintains auto look-ahead
  useFrame(({ camera: activeCam }, delta) => {
    const controls = cameraControlRef.current
    if (!controls) return

    const dt = Math.min(delta, 0.1)

    // 1. Smooth physical glide
    if (Math.abs(flightVelocity.current) > 0.0001) {
      const step = flightVelocity.current * dt * 9.0
      controls.forward(step, false)

      // Exponential damping for luxurious, buttery glide
      flightVelocity.current *= Math.pow(0.72, dt * 60)
      if (Math.abs(flightVelocity.current) < 0.001) {
        flightVelocity.current = 0
      }
    }

    // 2. Unrestricted 360° Look-Ahead Target Maintenance
    // Ensures target is ALWAYS ahead in the camera's view direction so you never hit a wall
    const target = controls._target
    if (target) {
      const dir = new THREE.Vector3()
      activeCam.getWorldDirection(dir)
      const distToTarget = activeCam.position.distanceTo(target)
      const camDist = activeCam.position.length()
      const minDist = Math.max(1.8, camDist * 0.0005)

      if (distToTarget < minDist) {
        const pushDist = Math.max(minDist * 12.0, 25.0)
        controls.setTarget(
          activeCam.position.x + dir.x * pushDist,
          activeCam.position.y + dir.y * pushDist,
          activeCam.position.z + dir.z * pushDist,
          false
        )
      }
    }
  })

  return null
}
