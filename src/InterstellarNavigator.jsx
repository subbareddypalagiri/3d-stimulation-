import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function InterstellarNavigator({ cameraControlRef }) {
  const keysPressed = useRef({})

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
      keysPressed.current[e.key.toLowerCase()] = true
      keysPressed.current[e.code] = true
    }

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false
      keysPressed.current[e.code] = false
    }

    // Wheel handler for breaking past the solar system barrier into interstellar space
    const handleWheel = (e) => {
      const controls = cameraControlRef.current
      if (!controls) return

      // When scrolling forward (zooming IN)
      if (e.deltaY < 0) {
        const distToTarget = controls.distance
        // If we are already deep inside a solar system (near sun / planets)
        // Instead of hitting a brick wall at minDistance, push forward into the interstellar void!
        if (distToTarget <= 25) {
          const forwardStep = 18 // units forward into deep space per scroll
          controls.forward(forwardStep, true)
        }
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
  }, [cameraControlRef])

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
    let baseSpeed = 80 // Base cruising speed between neighboring stars
    if (camDist > 10000 && camDist <= 60000) {
      baseSpeed = 600
    } else if (camDist > 60000 && camDist <= 300000) {
      baseSpeed = 4000
    } else if (camDist > 300000 && camDist <= 2000000) {
      baseSpeed = 35000
    } else if (camDist > 2000000) {
      baseSpeed = 250000
    }

    const currentSpeed = shift ? baseSpeed * 3.5 : baseSpeed
    const dt = Math.min(delta, 0.1) // clamp delta to avoid huge jumps

    if (forward) controls.forward(currentSpeed * dt, false)
    if (backward) controls.forward(-currentSpeed * dt, false)
    if (left) controls.truck(-currentSpeed * dt, 0, false)
    if (right) controls.truck(currentSpeed * dt, 0, false)
  })

  return null
}
