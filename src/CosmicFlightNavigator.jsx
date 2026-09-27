import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

/**
 * CosmicFlightNavigator:
 * Provides unrestricted 360° free-flight navigation across all cosmic scales.
 * Scrolling mouse wheel translates camera & target forward/backward along view vector,
 * allowing effortless free motion to any planet, star, or deep-space nebula without pivot locks.
 */
export default function CosmicFlightNavigator({ cameraControlRef, scrollSpeed = 0.6 }) {
  const { gl, camera } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    if (!canvas) return

    const handleWheel = (e) => {
      const controls = cameraControlRef.current
      if (!controls) return

      // Prevent default page scroll and override default dolly limits
      e.preventDefault()
      e.stopPropagation()

      // negative deltaY = scrolling forward into screen; positive = backward
      const forwardDir = e.deltaY < 0 ? 1 : -1
      const isShift = e.shiftKey

      // Adaptive cosmological speed curve based on camera distance
      const camDist = camera.position.length()
      let speed = 12

      if (camDist < 120) {
        speed = 4 // Close-up planet surface inspection
      } else if (camDist < 600) {
        speed = 22 // Solar system cruise
      } else if (camDist < 3000) {
        speed = 140 // Outer Kuiper / Oort boundary
      } else if (camDist < 25000) {
        speed = 1100 // Interstellar neighbor stars
      } else if (camDist < 100000) {
        speed = 7000 // Milky Way spiral boundary
      } else if (camDist < 600000) {
        speed = 36000 // Intergalactic deep void & Skill Web transit
      } else if (camDist < 5000000) {
        speed = 240000 // Local galactic group
      } else if (camDist < 50000000) {
        speed = 2000000 // Virgo supercluster
      } else {
        speed = Math.max(10000000, camDist * 0.12) // Cosmic web & multiverse horizons
      }

      // Apply user-configured scrollSpeed multiplier
      const totalDistance = forwardDir * speed * scrollSpeed * (isShift ? 3.0 : 1.0)
      controls.forward(totalDistance, true)
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [gl, camera, cameraControlRef, scrollSpeed])

  return null
}
