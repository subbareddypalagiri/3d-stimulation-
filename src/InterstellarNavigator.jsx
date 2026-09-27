import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function InterstellarNavigator({ cameraControlRef, flyTo }) {
  const keysPressed = useRef({})
  const flyToRef = useRef(flyTo)
  flyToRef.current = flyTo

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

    // Dynamically scale flight speed according to cosmic scale depth
    const camDist = camera.position.length()
    let baseSpeed = 120 // Cruising speed in stellar neighborhood
    if (camDist <= 250) {
      baseSpeed = 45 // Precision docking near planets
    } else if (camDist > 1000 && camDist <= 10000) {
      baseSpeed = 1200
    } else if (camDist > 10000 && camDist <= 60000) {
      baseSpeed = 6500
    } else if (camDist > 60000 && camDist <= 450000) {
      baseSpeed = 45000 // Deep void & Skill Web transit
    } else if (camDist > 450000 && camDist <= 2500000) {
      baseSpeed = 280000
    } else if (camDist > 2500000 && camDist <= 50000000) {
      baseSpeed = 2500000
    } else if (camDist > 50000000 && camDist <= 250000000) {
      baseSpeed = 25000000
    } else if (camDist > 250000000) {
      baseSpeed = Math.max(120000000, camDist * 0.45)
    }

    const currentSpeed = shift ? baseSpeed * 4.5 : baseSpeed
    const dt = Math.min(delta, 0.1)

    if (forward) controls.forward(currentSpeed * dt, false)
    if (backward) controls.forward(-currentSpeed * dt, false)
    if (left) controls.truck(-currentSpeed * dt, 0, false)
    if (right) controls.truck(currentSpeed * dt, 0, false)
  })

  return null
}
