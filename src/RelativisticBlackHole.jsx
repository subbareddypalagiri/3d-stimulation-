import React, { useEffect, useRef, useState } from "react"
import { createRenderer } from "./black-hole-utils/renderer"

export default function RelativisticBlackHole({
  onClose,
  title = "M87: Post-Milky Way Relativistic Singularity",
  subtitle = "Einstein General Relativity • Raymarched Null Geodesics & Doppler Accretion",
  isFullscreen = false
}) {
  const canvasRef = useRef(null)
  const [isSupported, setIsSupported] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!navigator.gpu) {
      console.warn("WebGPU not supported on this browser context.")
      setIsSupported(false)
      return
    }

    let renderer
    try {
      renderer = createRenderer({ canvas })
      renderer.ready
        .then(() => {
          setIsReady(true)
        })
        .catch((err) => {
          console.warn("WebGPU renderer ready rejected:", err)
          setIsSupported(false)
        })
    } catch (err) {
      console.warn("WebGPU createRenderer failed:", err)
      setIsSupported(false)
    }

    return () => {
      try {
        if (renderer) renderer.dispose()
      } catch (e) {
        console.warn("dispose error:", e)
      }
    }
  }, [])

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000000",
        overflow: "hidden",
        borderRadius: isFullscreen ? 0 : 16,
        border: isFullscreen ? "none" : "1px solid rgba(255, 140, 40, 0.45)",
        boxShadow: isFullscreen ? "none" : "0 0 50px rgba(255, 120, 20, 0.35)",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {isSupported ? (
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            touchAction: "none",
            cursor: "grab"
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 30,
            textAlign: "center",
            color: "#ffbb66"
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌀</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            WebGPU Hardware Acceleration Required
          </div>
          <div style={{ fontSize: 13, color: "#aaa", maxWidth: 420, lineHeight: 1.6 }}>
            This hyper-realistic black hole computes raymarched null geodesics & relativistic Doppler beaming directly on the GPU via WGSL. Please ensure WebGPU is enabled in Chrome or Edge.
          </div>
        </div>
      )}

      {/* Holographic Header Telemetry */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 20,
          pointerEvents: "none",
          background: "rgba(5, 10, 20, 0.8)",
          padding: "10px 18px",
          borderRadius: 12,
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 140, 40, 0.35)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff7700",
              boxShadow: "0 0 10px #ff7700",
              display: "inline-block"
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 800, color: "#ffaa44", letterSpacing: 1 }}>
            {title}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#8899aa", marginTop: 4 }}>
          {subtitle}
        </div>
      </div>

      {/* Interaction Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "6px 18px",
          borderRadius: 20,
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontSize: 11,
          color: "#ffcc88",
          letterSpacing: "0.5px"
        }}
      >
        ✦ Drag mouse to orbit spacetime & bend starlight ✦
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255, 60, 60, 0.25)",
            border: "1px solid rgba(255, 60, 60, 0.5)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            backdropFilter: "blur(10px)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 60, 60, 0.6)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 60, 60, 0.25)")}
        >
          ✕ Return to Space Flight
        </button>
      )}
    </div>
  )
}
