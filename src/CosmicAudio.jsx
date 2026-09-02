import React, { useEffect, useRef, useState } from "react"

export default function CosmicAudio({ currentDistance = 150 }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const ctxRef = useRef(null)
  const masterGainRef = useRef(null)
  const filterRef = useRef(null)
  const oscsRef = useRef([])

  const initAndPlayAudio = async () => {
    try {
      let ctx = ctxRef.current
      if (!ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        ctx = new AudioContext()
        ctxRef.current = ctx
      }

      if (ctx.state === "suspended") {
        await ctx.resume()
      }

      // If already playing, stop smoothly
      if (isPlaying && masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3)
        setTimeout(() => {
          setIsPlaying(false)
        }, 500)
        return
      }

      // Clean up previous nodes if any
      oscsRef.current.forEach(o => {
        try { o.stop(); o.disconnect(); } catch (e) {}
      })
      oscsRef.current = []

      // Master Gain
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime)
      masterGain.gain.setTargetAtTime(0.4, ctx.currentTime, 0.2) // Solid audible volume!
      masterGain.connect(ctx.destination)
      masterGainRef.current = masterGain

      // Warm Resonant Lowpass Filter (850 Hz cutoff - perfectly audible on all laptop speakers!)
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(750, ctx.currentTime)
      filter.Q.setValueAtTime(2.0, ctx.currentTime)
      filter.connect(masterGain)
      filterRef.current = filter

      const activeNodes = []

      // 1. Initial Celestial Starlight Activation Bell (528 Hz Solfeggio Frequency)
      // Instant clear feedback that sound is working!
      const chimeOsc = ctx.createOscillator()
      const chimeGain = ctx.createGain()
      chimeOsc.type = "sine"
      chimeOsc.frequency.setValueAtTime(528, ctx.currentTime)
      chimeGain.gain.setValueAtTime(0.3, ctx.currentTime)
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)
      chimeOsc.connect(chimeGain)
      chimeGain.connect(masterGain)
      chimeOsc.start()
      chimeOsc.stop(ctx.currentTime + 2.6)
      activeNodes.push(chimeOsc)

      // 2. Audible Lush Celestial Pad Chord (Hans Zimmer Interstellar Style)
      // Frequencies: F3 (174.6Hz), A3 (220Hz), C4 (261.6Hz), E4 (329.6Hz), G4 (392Hz)
      const chordFreqs = [174.61, 220.00, 261.63, 329.63, 392.00]
      chordFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = i % 2 === 0 ? "sawtooth" : "triangle" // Rich harmonics
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        // Analog chorusing detune
        osc.detune.setValueAtTime((i - 2) * 4.5, ctx.currentTime)
        
        g.gain.setValueAtTime(0.06, ctx.currentTime)
        osc.connect(g)
        g.connect(filter)
        osc.start()
        activeNodes.push(osc)
      })

      // 3. Deep Warm Sub-Bass (87.3 Hz F2 - audible on phones and laptops!)
      const subOsc = ctx.createOscillator()
      const subGain = ctx.createGain()
      subOsc.type = "triangle"
      subOsc.frequency.setValueAtTime(87.31, ctx.currentTime)
      subGain.gain.setValueAtTime(0.22, ctx.currentTime)
      subOsc.connect(subGain)
      subGain.connect(filter)
      subOsc.start()
      activeNodes.push(subOsc)

      // 4. Ethereal Cosmic Solar Wind (Filtered Pink/White Noise)
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = "bandpass"
      noiseFilter.frequency.setValueAtTime(320, ctx.currentTime)
      noiseFilter.Q.setValueAtTime(3.0, ctx.currentTime)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.04, ctx.currentTime)

      whiteNoise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(masterGain)
      whiteNoise.start()
      activeNodes.push(whiteNoise)

      // 5. Gentle 15-second breathing LFO on filter
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.type = "sine"
      lfo.frequency.setValueAtTime(0.07, ctx.currentTime)
      lfoGain.gain.setValueAtTime(140, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      lfo.start()
      activeNodes.push(lfo)

      oscsRef.current = activeNodes
      setIsPlaying(true)
    } catch (err) {
      console.error("Audio error:", err)
    }
  }

  // Modulate sound dynamically with scale:
  useEffect(() => {
    if (!filterRef.current || !ctxRef.current || !isPlaying) return
    const ctx = ctxRef.current
    const logDist = Math.log10(Math.max(10, currentDistance))
    // Starlight highs at Level 1 (~850Hz) down to deep mysterious rumble at Level 6 (~280Hz)
    const targetFreq = Math.max(280, 850 - (logDist - 2) * 70)
    filterRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 1.2)
  }, [currentDistance, isPlaying])

  return (
    <div style={{
      position: "absolute",
      bottom: 24,
      right: 24,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      <button
        onClick={initAndPlayAudio}
        style={{
          background: isPlaying 
            ? "linear-gradient(135deg, rgba(0, 119, 255, 0.9), rgba(0, 216, 255, 0.9))" 
            : "rgba(15, 20, 35, 0.85)",
          color: "#ffffff",
          border: isPlaying ? "1px solid #ffffff" : "1px solid rgba(0, 216, 255, 0.4)",
          padding: "12px 24px",
          borderRadius: 30,
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          backdropFilter: "blur(20px)",
          boxShadow: isPlaying 
            ? "0 0 28px rgba(0, 216, 255, 0.6), 0 4px 16px rgba(0,0,0,0.5)" 
            : "0 4px 20px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          letterSpacing: "0.5px"
        }}
      >
        <span style={{ fontSize: 16 }}>{isPlaying ? "🔊" : "🎵"}</span>
        <span>{isPlaying ? "COSMIC SOUND: ON" : "START COSMIC SOUND"}</span>
        
        {/* Animated Equalizer */}
        {isPlaying ? (
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 6 }}>
            {[16, 24, 12, 20, 15].map((h, i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: h,
                  background: "#ffffff",
                  borderRadius: 2,
                  animation: `pulseEq 1.0s ease-in-out infinite alternate ${i * 0.15}s`
                }}
              />
            ))}
          </div>
        ) : (
          <span style={{ 
            fontSize: 10, 
            background: "rgba(0, 216, 255, 0.2)", 
            color: "#00d8ff", 
            padding: "2px 8px", 
            borderRadius: 10,
            marginLeft: 4
          }}>
            CLICK
          </span>
        )}
      </button>

      <style>{`
        @keyframes pulseEq {
          0% { transform: scaleY(0.25); opacity: 0.6; }
          100% { transform: scaleY(1.4); opacity: 1.0; }
        }
      `}</style>
    </div>
  )
}
