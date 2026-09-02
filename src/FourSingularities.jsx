import React from "react"
import BlackHoleSingularity from "./BlackHoleSingularity"

export default function FourSingularities({ flyTo }) {
  return (
    <group>
      {/* 1. THE ARCHITECT: SUBBAREDDY PALAGIRI (Near Sol / Earth) */}
      <BlackHoleSingularity
        position={[280, 45, 140]}
        color="#00d8ff"
        badge="THE ARCHITECT"
        title="Subbareddy Palagiri"
        subtitle="Full-Stack & AI/LLM Architect • CGPA 9.0/10.0"
        description="B.Tech Computer Science at Mohan Babu University (CGPA 9.0). Hands-on experience architecting full-stack web applications and AI/LLM-integrated systems. Strong academic discipline across computer science fundamentals."
        techStack={["React.js", "Node.js", "Python", "Java", "Next.js", "Three.js", "PostgreSQL"]}
        links={[
          { label: "Contact Mail", url: "mailto:subbareddy123sub@gmail.com", primary: true, icon: "✉️" },
          { label: "GitHub", url: "https://github.com/subbareddypalagiri", icon: "🐙" }
        ]}
        flyTo={flyTo}
      />

      {/* 2. HAAPPY: FLAGSHIP PLATFORM (Alpha Centauri Sector) */}
      <BlackHoleSingularity
        position={[820, 95, -460]}
        color="#ffaa00"
        badge="FLAGSHIP ECOSYSTEM"
        title="Haappy Platform"
        subtitle="Student Networking & Mentorship Network"
        description="Engineered a scalable student networking platform featuring algorithmic mentor matching and low-latency messaging. Refactored MongoDB schemas to eliminate concurrency issues, automated testing with GitHub Actions CI/CD, and coordinated a 4-5 person team."
        techStack={["React.js", "Node.js", "MongoDB", "REST APIs", "GitHub Actions CI/CD"]}
        links={[
          { label: "GitHub Repo", url: "https://github.com/subbareddypalagiri", primary: true, icon: "🐙" }
        ]}
        flyTo={flyTo}
      />

      {/* 3. YAMA AI & SARA: NEURAL SYSTEMS (Sirius Sector) */}
      <BlackHoleSingularity
        position={[1750, 220, -1150]}
        color="#aa66ff"
        badge="INTELLIGENT AI"
        title="Yama AI & SARA"
        subtitle="Context-Retrieval NLP & Token Optimization"
        description="• Yama AI: Built an NLP assistant using OpenAI & Gemini APIs with context-retrieval steps to eliminate unsupported claims and explain legal questions. • SARA: Spot-fix writing assistant that selectively rewrites small text sections with RAG, slashing token regeneration waste."
        techStack={["Python", "OpenAI API", "Gemini API", "RAG Retrieval", "NLP", "Prompt Engineering"]}
        links={[
          { label: "GitHub Repos", url: "https://github.com/subbareddypalagiri", primary: true, icon: "🐙" }
        ]}
        flyTo={flyTo}
      />

      {/* 4. SYN-NEX & GLOBAL OPEN SOURCE (Vega Sector) */}
      <BlackHoleSingularity
        position={[-3850, 320, -2750]}
        color="#00ffaa"
        badge="GLOBAL MASTERY"
        title="Syn-Nex & Open Source"
        subtitle="Chrome Extension AI & 479K+ Star Merge"
        description="• Syn-Nex: Real-time Chrome extension intercepting raw prompts client-side with zero typing latency to structure inputs before AI submission. • Open Source: Merged PR (#4278) in sindresorhus/awesome (479K+ ⭐ global repo) & LeetCode 100 Days Badge."
        techStack={["Chrome Extension API", "JavaScript", "Tailwind CSS", "LeetCode 100 Days"]}
        links={[
          { label: "Awesome Repo (479K+ ⭐)", url: "https://github.com/sindresorhus/awesome", primary: true, icon: "⭐" },
          { label: "GitHub", url: "https://github.com/subbareddypalagiri", icon: "🐙" }
        ]}
        flyTo={flyTo}
      />
    </group>
  )
}
