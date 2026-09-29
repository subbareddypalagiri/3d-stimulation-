import React, { useState, useEffect, useCallback, useRef } from "react"

const CELESTIAL_PARTS = [
  {
    id: "hands",
    title: "Helping Hands",
    icon: "✋",
    url: "/hands.html",
    accentColor: "#00d8ff",
    glowColor: "rgba(0, 216, 255, 0.5)"
  },
  {
    id: "unix-1",
    title: "UNIX-1",
    icon: null,
    url: "/unix-1.html",
    accentColor: "#ff0055",
    glowColor: "rgba(255, 0, 85, 0.5)"
  },
  {
    id: "commanders",
    title: "UNIX COMMANDERS",
    icon: null,
    url: "/commanders.html",
    accentColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)"
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
  // Scroll Down (wheel down) advances: Helping Hands -> UNIX-1 -> UNIX COMMANDERS
  // Scroll Up (wheel up) reverses: UNIX COMMANDERS -> UNIX-1 -> Helping Hands -> Return to Space!
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
        // At Stage 1: Helping Hands -> Scrolling up returns to space!
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

      {/* Top Glassmorphic Minimal HUD Header */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 28px",
          background: "linear-gradient(to bottom, rgba(5, 5, 18, 0.9) 0%, rgba(5, 5, 18, 0.4) 70%, transparent 100%)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
        }}
      >
        {/* Minimal Glowing Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: currentPart.accentColor,
              boxShadow: `0 0 12px ${currentPart.accentColor}, 0 0 24px ${currentPart.glowColor}`,
              transition: "all 0.3s ease"
            }}
          />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em" }}>
            🌌 CELESTIAL
          </span>
        </div>

        {/* The 3 Clean Tabs: [✋ Helping Hands] [UNIX-1] [UNIX COMMANDERS] */}
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
          {CELESTIAL_PARTS.map((part) => {
            const isActive = part.id === activePartId
            return (
              <button
                key={part.id}
                onClick={() => switchPart(part.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
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
                {part.icon && <span style={{ fontSize: 13 }}>{part.icon}</span>}
                <span>{part.title}</span>
              </button>
            )
          })}
        </div>

        {/* Minimal Return Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleExit}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              padding: "7px 16px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)"
              e.currentTarget.style.borderColor = "#00d8ff"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
            }}
          >
            <span>✕</span>
            <span>Return (Esc)</span>
          </button>
        </div>
      </div>

      {/* Sleek Floating Bottom Indicator */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          padding: "12px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(8, 8, 20, 0.75)",
            backdropFilter: "blur(14px)",
            padding: "6px 18px",
            borderRadius: 30,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 11,
            pointerEvents: "auto"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {partOrder.map((id) => (
              <div
                key={id}
                onClick={() => switchPart(id)}
                style={{
                  width: id === activePartId ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: id === activePartId ? currentPart.accentColor : "rgba(255, 255, 255, 0.25)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: id === activePartId ? `0 0 8px ${currentPart.accentColor}` : "none"
                }}
              />
            ))}
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>|</span>
          <span style={{ fontSize: 10, letterSpacing: "0.03em" }}>
            Scroll ▾ Next • Scroll ▴ Back
          </span>
        </div>
      </div>
    </div>
  )
}
