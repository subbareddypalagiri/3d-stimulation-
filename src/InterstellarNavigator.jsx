import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { getCosmicFlightSpeed } from "./CosmicFlightNavigator"

export default function InterstellarNavigator({ cameraControlRef, flyTo }) {
  const keysPressed = useRef({})
  const flyToRef = useRef(flyTo)
  flyToRef.current = flyTo
  const dirRef = useRef(new THREE.Vector3())

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
      keysPressed.current[e.key.toLowerCase()] = true
      keysPressed.current[e.code] = true

      // "R" or "Home" key: Instant smooth return flight to Home Sol System
      if (e.key.toLowerCase() === "r" || e.key === "Home") {
        if (flyToRef.current) flyToRef.current([0, 20, 45], 25)
      }
    }

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false
      keysPressed.current[e.code] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [cameraControlRef, flyTo])

  // Continuous keyboard interstellar flight loop
  useFrame(({ camera }, delta) => {
    const controls = cameraControlRef.current
    if (!controls) return

    const keys = keysPressed.current
    const forward = keys["w"] || keys["arrowup"] || keys["KeyW"]
    const backward = keys["s"] || keys["arrowdown"] || keys["KeyS"]
    const left = keys["a"] || keys["arrowleft"] || keys["KeyA"]
    const right = keys["d"] || keys["arrowright"] || keys["KeyD"]
    const shift = keys["shift"] || keys["ShiftLeft"] || keys["ShiftRight"]

    if (!forward && !backward && !left && !right) return

    // Dynamically scale flight speed using cosmological scale detector
    const baseSpeed = getCosmicFlightSpeed(camera, controls._target)
    const currentSpeed = shift ? baseSpeed * 3.5 : baseSpeed
    const dt = Math.min(delta, 0.1)

    if (forward) controls.forward(currentSpeed * dt * 2.5, false)
    if (backward) controls.forward(-currentSpeed * dt * 2.5, false)
    if (left) controls.truck(-currentSpeed * dt * 2.0, 0, false)
    if (right) controls.truck(currentSpeed * dt * 2.0, 0, false)

    // Ensure look-ahead target advances forward during keyboard flight
    const target = controls._target
    if (target) {
      const dir = dirRef.current
      camera.getWorldDirection(dir)
      const distToTarget = camera.position.distanceTo(target)
      const camDist = camera.position.length()
      const minDist = Math.max(1.8, camDist * 0.0005)

      if (distToTarget < minDist) {
        const pushDist = Math.max(minDist * 12.0, 25.0)
        controls.setTarget(
          camera.position.x + dir.x * pushDist,
          camera.position.y + dir.y * pushDist,
          camera.position.z + dir.z * pushDist,
          false
        )
      }
    }
  })

  return null
}
