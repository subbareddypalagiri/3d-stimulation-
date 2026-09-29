import React, { useState, useEffect, useCallback, useRef } from "react"

const CELESTIAL_PARTS = [
  {
    id: "hands",
    title: "THE GENESIS",
    name: "Luminhands",
    badge: "ORIGIN MATRIX",
    desc: "Original creation hands • Primordial continuous bioluminescent filaments",
    icon: "🖐️",
    url: "/hands.html",
    accentColor: "#00d8ff",
    glowColor: "rgba(0, 216, 255, 0.5)",
    tag: "PART 1"
  },
  {
    id: "unix-1",
    title: "UNIX-1",
    name: "Solitary Entity",
    badge: "SOLITARY CONSCIOUSNESS",
    desc: "Continuous root cascades • Piercing ruby red eyes • Sovereign monolith",
    icon: "🧘",
    url: "/unix-1.html",
    accentColor: "#ff0055",
    glowColor: "rgba(255, 0, 85, 0.5)",
    tag: "PART 2"
  },
  {
    id: "commanders",
    title: "UNIX - COMMANDERS",
    name: "Cardinal Council",
    badge: "4-FIGURE SQUAD",
    desc: "North, South, East, West cardinal circle formation facing inward",
    icon: "🛡️",
    url: "/commanders.html",
    accentColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)",
    tag: "PART 3"
  }
]

export default function CelestialRealmPortal({ isOpen, onClose, initialPart = "hands" }) {
  const [activePartId, setActivePartId] = useState(initialPart)
  const [whiteFlash, setWhiteFlash] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const isExitingRef = useRef(false)
  const lastScrollTimeRef = useRef(0)

  const partOrder = ["hands", "unix-1", "commanders"]

  // Sync initial part when opened
  useEffect(() => {
    if (isOpen) {
      if (initialPart) setActivePartId(initialPart)
      setWhiteFlash(true)
      const t = setTimeout(() => setWhiteFlash(false), 300)
      return () => clearTimeout(t)
    } else {
      setWhiteFlash(false)
    }
  }, [isOpen, initialPart])

  const handleExit = useCallback(() => {
    if (isExitingRef.current) return
    isExitingRef.current = true
    setWhiteFlash(true)
    setTimeout(() => {
      isExitingRef.current = false
      setWhiteFlash(false)
      if (onClose) onClose()
    }, 280)
  }, [onClose])

  const switchPart = useCallback((id) => {
    if (id === activePartId) return
    setWhiteFlash(true)
    setActivePartId(id)
    setTimeout(() => setWhiteFlash(false), 300)
  }, [activePartId])

  // Continuous Scroll Storyteller Engine:
  // Scroll Down (wheel down) advances: Hands -> UNIX-1 -> Commanders
  // Scroll Up (wheel up) reverses: Commanders -> UNIX-1 -> Hands -> Return to Cosmos!
  const handleScrollDelta = useCallback((deltaY) => {
    if (isExitingRef.current) return
    const now = Date.now()
    if (now - lastScrollTimeRef.current < 550) return // smooth debounce between stages

    if (deltaY > 30) {
      // Advance to next stage
      const currentIndex = partOrder.indexOf(activePartId)
      if (currentIndex < partOrder.length - 1) {
        lastScrollTimeRef.current = now
        switchPart(partOrder[currentIndex + 1])
      }
    } else if (deltaY < -30) {
      // Reverse to previous stage or return to space
      const currentIndex = partOrder.indexOf(activePartId)
      if (currentIndex > 0) {
        lastScrollTimeRef.current = now
        switchPart(partOrder[currentIndex - 1])
      } else if (currentIndex === 0) {
        // At Stage 1: Genesis -> Scrolling up returns to solar system!
        lastScrollTimeRef.current = now
        handleExit()
      }
    }
  }, [activePartId, switchPart, handleExit])

  // Listen to wheel events on both the window and messages posted from iframe
  useEffect(() => {
    if (!isOpen) return

    const handleWheel = (e) => {
      handleScrollDelta(e.deltaY)
    }

    const handleMessage = (e) => {
      if (e.data && e.data.type === "CELESTIAL_SCROLL") {
        handleScrollDelta(e.data.deltaY)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("message", handleMessage)
    }
  }, [isOpen, handleScrollDelta])

  // Keyboard navigation: 1, 2, 3 to switch tabs, Escape/Backspace to exit
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Backspace") {
        handleExit()
      } else if (e.key === "1") {
        switchPart("hands")
      } else if (e.key === "2") {
        switchPart("unix-1")
      } else if (e.key === "3") {
        switchPart("commanders")
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        handleScrollDelta(50)
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        handleScrollDelta(-50)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleExit, switchPart, handleScrollDelta])

  if (!isOpen) return null

  const currentPart = CELESTIAL_PARTS.find((p) => p.id === activePartId) || CELESTIAL_PARTS[0]

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#020208",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
        overflow: "hidden",
        fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Subtle Cinematic Warp Flash on Entry & Switch */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, rgba(216, 180, 254, 0.4) 40%, rgba(3, 0, 20, 0.8) 100%)",
          pointerEvents: "none",
          zIndex: 10,
          opacity: whiteFlash ? 0.7 : 0,
          transition: "opacity 0.25s ease"
        }}
      />

      {/* Main 3D WebGPU Realm Iframe */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <iframe
          key={`${currentPart.id}-${iframeKey}`}
          src={currentPart.url}
          title={currentPart.title}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "#000"
          }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Top Glassmorphic HUD Header */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 28px",
          background: "linear-gradient(to bottom, rgba(5, 5, 18, 0.92) 0%, rgba(5, 5, 18, 0.6) 70%, transparent 100%)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        {/* Brand & Realm Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: currentPart.accentColor,
              boxShadow: `0 0 16px ${currentPart.accentColor}, 0 0 32px ${currentPart.glowColor}`,
              transition: "all 0.3s ease"
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 13, letterSpacing: "0.12em" }}>
                🌌 CELESTIAL REALM
              </span>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${currentPart.accentColor}66`,
                  color: currentPart.accentColor,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 12,
                  letterSpacing: "0.08em"
                }}
              >
                {currentPart.badge}
              </span>
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 11, marginTop: 2 }}>
              {currentPart.desc}
            </div>
          </div>
        </div>

        {/* 3-Part Navigation Switcher (Hands / UNIX-1 / Commanders) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(10, 10, 30, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 30,
            padding: "4px 6px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)"
          }}
        >
          {CELESTIAL_PARTS.map((part, index) => {
            const isActive = part.id === activePartId
            return (
              <button
                key={part.id}
                onClick={() => switchPart(part.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 24,
                  background: isActive
                    ? `linear-gradient(135deg, ${part.accentColor}33, ${part.accentColor}11)`
                    : "transparent",
                  border: `1.5px solid ${isActive ? part.accentColor : "transparent"}`,
                  color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                  fontSize: 12,
                  fontWeight: isActive ? 800 : 600,
                  cursor: "pointer",
                  boxShadow: isActive ? `0 0 20px ${part.glowColor}` : "none",
                  transition: "all 0.25s ease",
                  letterSpacing: "0.04em"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#ffffff"
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"
                    e.currentTarget.style.background = "transparent"
                  }
                }}
              >
                <span style={{ fontSize: 14 }}>{part.icon}</span>
                <span>{part.title}</span>
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 5px",
                    borderRadius: 8,
                    background: isActive ? part.accentColor : "rgba(255, 255, 255, 0.12)",
                    color: isActive ? "#000000" : "#ffffff",
                    fontWeight: 700
                  }}
                >
                  {index + 1}
                </span>
              </button>
            )
          })}
        </div>

        {/* Action Controls & Return Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Reload / Re-reveal */}
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            title="Replay Reveal Animation"
          >
            🔄 Reset
          </button>

          {/* Return to Cosmos */}
          <button
            onClick={handleExit}
            style={{
              background: "linear-gradient(135deg, rgba(0, 216, 255, 0.35), rgba(168, 85, 247, 0.35))",
              border: "1.5px solid #00d8ff",
              color: "#ffffff",
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(0, 216, 255, 0.5)",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)"
              e.currentTarget.style.boxShadow = "0 0 28px rgba(0, 216, 255, 0.8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 216, 255, 0.5)"
            }}
          >
            <span>🌌</span>
            <span>Return to Cosmos (Esc)</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Telemetry & Keyboard Hint Bar */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          padding: "16px 32px",
          background: "linear-gradient(to top, rgba(5, 5, 18, 0.92) 0%, rgba(5, 5, 18, 0.5) 60%, transparent 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)"
        }}
      >
        {/* Continuous Scroll Story Progress & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.06)",
              padding: "4px 14px",
              borderRadius: 20,
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            <span style={{ fontSize: 10, color: "#38bdf8", fontWeight: 800, letterSpacing: "0.05em" }}>COSMIC CONTINUUM:</span>
            {CELESTIAL_PARTS.map((p, idx) => {
              const isPActive = p.id === activePartId
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {idx > 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>▾</span>}
                  <span
                    onClick={() => switchPart(p.id)}
                    style={{
                      fontSize: 10,
                      fontWeight: isPActive ? 800 : 500,
                      color: isPActive ? p.accentColor : "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      textShadow: isPActive ? `0 0 10px ${p.accentColor}` : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {idx + 1}. {p.title}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: 11, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📜 <b>Scroll ▾</b>: Deeper</span>
            <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>|</span>
            <span><b>Scroll ▴</b>: Return to Cosmos</span>
            <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>|</span>
            <span>🖱️ <b>Drag</b> to Orbit</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              color: currentPart.accentColor,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase"
            }}
          >
            ENGINE: THREE.JS WEBGPU TSL • 60-120 FPS NATIVE
          </span>
        </div>
      </div>
    </div>
  )
}
