import React, { useEffect, useRef, useState, useCallback } from "react"

const TOTAL_FRAMES = 720
const PAD_ZERO = (num) => String(num).padStart(4, "0")

export default function ScrollVideoPortal({ isOpen, onClose }) {
  const canvasRef = useRef(null)
  const imagesRef = useRef(new Map())
  const currentFrameRef = useRef(1)
  const targetFrameRef = useRef(1)
  const animFrameIdRef = useRef(null)
  const lastMouseXRef = useRef(null)

  const [displayFrame, setDisplayFrame] = useState(1)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [whiteFlash, setWhiteFlash] = useState(true)

  // Trigger pure white flashout whenever portal opens ("screen mottam white aipoyi")
  useEffect(() => {
    if (isOpen) {
      setWhiteFlash(true)
      const timer = setTimeout(() => {
        setWhiteFlash(false)
      }, 700) // Smooth flash dissolution over 700ms
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Preload frames incrementally
  useEffect(() => {
    if (!isOpen) return

    let loadedCount = 0
    const priorityLimit = 150

    const loadSingleFrame = (idx) => {
      if (imagesRef.current.has(idx)) return
      const img = new Image()
      img.src = `/frames/frame_${PAD_ZERO(idx)}.jpg`
      img.onload = () => {
        imagesRef.current.set(idx, img)
        loadedCount++
        if (loadedCount % 15 === 0 || loadedCount === TOTAL_FRAMES) {
          setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100))
        }
      }
    }

    // Priority load first 150 immediately
    for (let i = 1; i <= priorityLimit; i++) {
      loadSingleFrame(i)
    }

    // Background load the rest
    const loadRemaining = () => {
      for (let i = priorityLimit + 1; i <= TOTAL_FRAMES; i++) {
        loadSingleFrame(i)
      }
    }

    const timeout = setTimeout(loadRemaining, 200)
    return () => clearTimeout(timeout)
  }, [isOpen])

  // Draw current frame onto canvas
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const clampedIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIdx)))
    const img = imagesRef.current.get(clampedIdx)

    if (img && img.complete && img.naturalWidth > 0) {
      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight

      const scale = Math.min(cw / iw, ch / ih)
      const dw = iw * scale
      const dh = ih * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2

      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
    }
  }, [])

  // 60-120 FPS Liquid Lerp Animation Loop
  useEffect(() => {
    if (!isOpen) return

    const loop = () => {
      if (isPlaying) {
        targetFrameRef.current = (targetFrameRef.current % TOTAL_FRAMES) + 0.6
      }

      // Smooth exponential lerp
      const diff = targetFrameRef.current - currentFrameRef.current
      if (Math.abs(diff) > 0.01) {
        currentFrameRef.current += diff * 0.22
      } else {
        currentFrameRef.current = targetFrameRef.current
      }

      drawFrame(currentFrameRef.current)
      const rounded = Math.round(currentFrameRef.current)
      setDisplayFrame((prev) => (prev !== rounded ? rounded : prev))

      animFrameIdRef.current = requestAnimationFrame(loop)
    }

    animFrameIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameIdRef.current)
  }, [isOpen, isPlaying, drawFrame])

  // Resize canvas to full window
  useEffect(() => {
    if (!isOpen) return
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        drawFrame(currentFrameRef.current)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, drawFrame])

  // Mouse Move & Wheel Listeners: Move mouse OR scroll wheel to scrub frames!
  useEffect(() => {
    if (!isOpen) return

    // 1. Mouse Wheel scrubbing
    const handleWheel = (e) => {
      e.preventDefault()
      setIsPlaying(false)
      const delta = e.deltaY * 0.35
      targetFrameRef.current = Math.max(1, Math.min(TOTAL_FRAMES, targetFrameRef.current + delta))
    }

    // 2. Mouse Movement across screen (Horizontal Cursor Move scrubbing)
    const handleMouseMove = (e) => {
      setIsPlaying(false)
      if (lastMouseXRef.current !== null) {
        const deltaX = e.clientX - lastMouseXRef.current
        // Moving mouse right moves forward, moving left moves backward
        targetFrameRef.current = Math.max(1, Math.min(TOTAL_FRAMES, targetFrameRef.current + deltaX * 1.8))
      }
      lastMouseXRef.current = e.clientX
    }

    const handleMouseLeave = () => {
      lastMouseXRef.current = null
    }

    // 3. Keyboard controls
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose()
      } else if (e.key === "ArrowRight") {
        targetFrameRef.current = Math.min(TOTAL_FRAMES, targetFrameRef.current + 8)
      } else if (e.key === "ArrowLeft") {
        targetFrameRef.current = Math.max(1, targetFrameRef.current - 8)
      } else if (e.key === " ") {
        setIsPlaying((p) => !p)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const progressPercent = ((displayFrame - 1) / (TOTAL_FRAMES - 1)) * 100
  const currentTimeSec = ((displayFrame / 24)).toFixed(1)

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "ew-resize",
        userSelect: "none",
        overflow: "hidden"
      }}
    >
      {/* Background Frame Render Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block"
        }}
      />

      {/* Screen Mottam White Flashout ("screen mottam white aipoyi") */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#ffffff",
          pointerEvents: "none",
          zIndex: 100,
          opacity: whiteFlash ? 1 : 0,
          transition: "opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />

      {/* Top HUD Header */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 28px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
          backdropFilter: "blur(8px)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 16px #ffffff, 0 0 32px #00ffff"
            }}
          />
          <div>
            <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em" }}>
              ⚪ BEYOND COSMIC SPHERE: SINGULARITY PORTAL
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>
              Move Mouse Left/Right or Scroll Wheel to Scrub Video Frames
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "5px 12px",
              borderRadius: 6,
              color: "#00ffff",
              fontSize: 11,
              fontFamily: "monospace",
              fontWeight: 700
            }}
          >
            FRAME: {displayFrame} / {TOTAL_FRAMES} | {currentTimeSec}s / 30.0s
          </div>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              background: isPlaying ? "rgba(0, 255, 200, 0.25)" : "rgba(255,255,255,0.1)",
              border: `1px solid ${isPlaying ? "#00ffc8" : "rgba(255,255,255,0.2)"}`,
              color: isPlaying ? "#00ffc8" : "#ffffff",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {isPlaying ? "⏸️ Pause" : "▶️ Auto Play"}
          </button>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 68, 68, 0.25)",
              border: "1px solid rgba(255, 68, 68, 0.6)",
              color: "#ff8888",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            ✕ Return to Cosmos (Esc)
          </button>
        </div>
      </div>

      {/* Bottom HUD Controls & Interactive Scrubber */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "20px 32px",
          background: "linear-gradient(to top, rgba(0,0,0,0.92), transparent)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        {/* Interactive Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const pct = Math.max(0, Math.min(1, clickX / rect.width))
            targetFrameRef.current = Math.round(1 + pct * (TOTAL_FRAMES - 1))
          }}
          style={{
            width: "100%",
            height: 9,
            background: "rgba(255,255,255,0.14)",
            borderRadius: 5,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00d8ff, #ff00ea, #ffffff)",
              boxShadow: "0 0 14px #00d8ff"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🖱️ <b>Move Mouse Left/Right</b> OR <b>Scroll Wheel</b> to scrub frames</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
            <span>⌨️ <b>Space</b>: Auto-Play | <b>Esc</b>: Back to Cosmos</span>
          </div>

          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>
            Preloaded: {loadProgress}% ({imagesRef.current.size} / {TOTAL_FRAMES} frames)
          </div>
        </div>
      </div>
    </div>
  )
}
