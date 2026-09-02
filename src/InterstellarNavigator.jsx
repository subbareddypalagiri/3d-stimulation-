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

    // Two-way Wheel handler for seamless interstellar flight
    const handleWheel = (e) => {
      const controls = cameraControlRef.current
      if (!controls) return

      const distToTarget = controls.distance

      // When scrolling forward (zooming IN) past a solar system
      if (e.deltaY < 0 && distToTarget <= 28) {
        controls.forward(22, true)
      }
      // When scrolling backward (zooming OUT) to escape back into space
      else if (e.deltaY > 0 && distToTarget <= 28) {
        controls.forward(-22, true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("wheel", handleWheel, { passive: true })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("wheel", handleWheel)
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
    let baseSpeed = 90 // Cruising speed in stellar neighborhood
    if (camDist > 10000 && camDist <= 60000) {
      baseSpeed = 750
    } else if (camDist > 60000 && camDist <= 300000) {
      baseSpeed = 4500
    } else if (camDist > 300000 && camDist <= 2000000) {
      baseSpeed = 40000
    } else if (camDist > 2000000) {
      baseSpeed = 300000
    }

    const currentSpeed = shift ? baseSpeed * 3.8 : baseSpeed
    const dt = Math.min(delta, 0.1)

    if (forward) controls.forward(currentSpeed * dt, false)
    if (backward) controls.forward(-currentSpeed * dt, false)
    if (left) controls.truck(-currentSpeed * dt, 0, false)
    if (right) controls.truck(currentSpeed * dt, 0, false)
  })

  return null
}
