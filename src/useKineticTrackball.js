import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * useKineticTrackball:
 * High-performance virtual trackball physics hook for 3D objects & groups.
 * Provides butter-smooth, unrestricted 360° drag rotation with kinetic momentum damping.
 */
export function useKineticTrackball({
  targetRef,
  enabled = true,
  sensitivityX = 0.005,
  sensitivityY = 0.004,
  damping = 0.92,
  idleDriftX = 0,
  idleDriftY = 0.001,
  minPitch = -Math.PI,
  maxPitch = Math.PI,
  clampPitch = false,
  onClick = null
}) {
  const isDragging = useRef(false)
  const prevPointer = useRef({ x: 0, y: 0 })
  const startPointer = useRef({ x: 0, y: 0, time: 0 })
  const rotationVelocity = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return

    const handlePointerMove = (e) => {
      if (!isDragging.current) return
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0

      const dx = clientX - prevPointer.current.x
      const dy = clientY - prevPointer.current.y
      prevPointer.current = { x: clientX, y: clientY }

      currentRotation.current.y += dx * sensitivityX
      if (clampPitch) {
        currentRotation.current.x = THREE.MathUtils.clamp(
          currentRotation.current.x + dy * sensitivityY,
          minPitch,
          maxPitch
        )
      } else {
        currentRotation.current.x += dy * sensitivityY
      }
      rotationVelocity.current = { x: dy * sensitivityY, y: dx * sensitivityX }
    }

    const handlePointerUp = (e) => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = "auto"

      const clientX = e.clientX ?? (e.changedTouches && e.changedTouches[0]?.clientX) ?? prevPointer.current.x
      const clientY = e.clientY ?? (e.changedTouches && e.changedTouches[0]?.clientY) ?? prevPointer.current.y

      const dist = Math.hypot(clientX - startPointer.current.x, clientY - startPointer.current.y)
      const duration = Date.now() - startPointer.current.time

      // If clicked without dragging (< 6px movement, < 350ms duration)
      if (dist < 6 && duration < 350 && onClick) {
        onClick(e)
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("touchmove", handlePointerMove, { passive: true })
    window.addEventListener("touchend", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("touchmove", handlePointerMove)
      window.removeEventListener("touchend", handlePointerUp)
    }
  }, [enabled, sensitivityX, sensitivityY, minPitch, maxPitch, clampPitch, onClick])

  useFrame((_, delta) => {
    if (!targetRef?.current || !enabled) return
    const dt = Math.min(delta, 0.1)

    if (!isDragging.current) {
      currentRotation.current.y += rotationVelocity.current.y + idleDriftY
      currentRotation.current.x += rotationVelocity.current.x + idleDriftX
      rotationVelocity.current.x *= Math.pow(damping, dt * 60)
      rotationVelocity.current.y *= Math.pow(damping, dt * 60)
    }

    targetRef.current.rotation.y = currentRotation.current.y
    targetRef.current.rotation.x = currentRotation.current.x
  })

  // Props to attach to an interactive grab mesh / hit volume
  const bindGrab = {
    onPointerDown: (e) => {
      if (!enabled) return
      e.stopPropagation()
      isDragging.current = true
      const clientX = e.clientX ?? (e.nativeEvent && e.nativeEvent.clientX) ?? 0
      const clientY = e.clientY ?? (e.nativeEvent && e.nativeEvent.clientY) ?? 0
      prevPointer.current = { x: clientX, y: clientY }
      startPointer.current = { x: clientX, y: clientY, time: Date.now() }
      document.body.style.cursor = "grabbing"
    },
    onPointerOver: (e) => {
      if (enabled && !isDragging.current) {
        e.stopPropagation()
        document.body.style.cursor = "grab"
      }
    },
    onPointerOut: () => {
      if (!isDragging.current) {
        document.body.style.cursor = "auto"
      }
    }
  }

  return { isDragging, currentRotation, rotationVelocity, bindGrab }
}
