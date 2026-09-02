import React, { useEffect, useRef, useState, useCallback } from "react"

const TOTAL_FRAMES = 720
const PAD_ZERO = (num) => String(num).padStart(4, "0")

export default function ScrollVideoPortal({ isOpen, onClose }) {
  const canvasRef = useRef(null)
  const imagesRef = useRef(new Map())
  const currentFrameRef = useRef(1)
  const targetFrameRef = useRef(1)
  const animFrameIdRef = useRef(null)
  const isDraggingRef = useRef(false)
  const lastMouseYRef = useRef(0)

  const [displayFrame, setDisplayFrame] = useState(1)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Preload frames incrementally
  useEffect(() => {
    if (!isOpen) return

    let loadedCount = 0
    // Priority: preload first 120 frames instantly
    const priorityLimit = 120

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

    // Load initial 120 immediately
    for (let i = 1; i <= priorityLimit; i++) {
      loadSingleFrame(i)
    }

    // Load the rest smoothly in idle chunks
    const loadRemaining = () => {
      for (let i = priorityLimit + 1; i <= TOTAL_FRAMES; i++) {
        loadSingleFrame(i)
      }
    }

    const timeout = setTimeout(loadRemaining, 300)
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
      // Responsive contain draw
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
        currentFrameRef.current += diff * 0.18
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

  // Mouse Wheel Scrubbing Listener
  useEffect(() => {
    if (!isOpen) return

    const handleWheel = (e) => {
      e.preventDefault()
      setIsPlaying(false)

      // Natural scroll scrub sensitivity
      const delta = e.deltaY * 0.28
      targetFrameRef.current = Math.max(1, Math.min(TOTAL_FRAMES, targetFrameRef.current + delta))
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose()
      } else if (e.key === "ArrowRight") {
        targetFrameRef.current = Math.min(TOTAL_FRAMES, targetFrameRef.current + 6)
      } else if (e.key === "ArrowLeft") {
        targetFrameRef.current = Math.max(1, targetFrameRef.current - 6)
      } else if (e.key === " ") {
        setIsPlaying((p) => !p)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  // Drag scrubber for touch / mouse drag
  const handleMouseDown = (e) => {
    isDraggingRef.current = true
    lastMouseYRef.current = e.clientY
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    setIsPlaying(false)
    const delta = (lastMouseYRef.current - e.clientY) * 1.5
    lastMouseYRef.current = e.clientY
    targetFrameRef.current = Math.max(1, Math.min(TOTAL_FRAMES, targetFrameRef.current + delta))
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  if (!isOpen) return null

  const progressPercent = ((displayFrame - 1) / (TOTAL_FRAMES - 1)) * 100
  const currentTimeSec = ((displayFrame / 24)).toFixed(1)

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "grab",
        userSelect: "none"
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

      {/* Top HUD Header */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
          backdropFilter: "blur(8px)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 14px #ffffff, 0 0 28px #00ffff"
            }}
          />
          <div>
            <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em" }}>
              ⚪ PRIMORDIAL SINGULARITY PORTAL
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }}>
              Ultra-Smooth Scroll Frame Sequence (Apple Scrubber Engine)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "4px 10px",
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
              background: isPlaying ? "rgba(0, 255, 200, 0.2)" : "rgba(255,255,255,0.1)",
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
              background: "rgba(255, 68, 68, 0.2)",
              border: "1px solid rgba(255, 68, 68, 0.5)",
              color: "#ff6666",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            ✕ Exit to Cosmos (Esc)
          </button>
        </div>
      </div>

      {/* Bottom HUD Controls & Scrubber */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "20px 30px",
          background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
          display: "flex",
          flexDirection: "column",
          gap: 10
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
            height: 8,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 4,
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
              boxShadow: "0 0 12px #00d8ff"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🖱️ <b>Scroll Mouse Wheel</b> (Forward/Backward) or <b>Drag</b> to scrub smoothly</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
            <span>⌨️ <b>Arrow Keys</b>: Step | <b>Space</b>: Play/Pause</span>
          </div>

          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>
            Cache: {loadProgress}% loaded ({imagesRef.current.size} / {TOTAL_FRAMES} frames)
          </div>
        </div>
      </div>
    </div>
  )
}
