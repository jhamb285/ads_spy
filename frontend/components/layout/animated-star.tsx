'use client'

export function AnimatedStar() {
  return (
    <svg
      className="h-6 w-6 star-container"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow layer */}
      <g className="star-glow-outer">
        <path
          d="M50 10 L58 38 L88 38 L64 56 L72 84 L50 66 L28 84 L36 56 L12 38 L42 38 Z"
          fill="currentColor"
          opacity="0.2"
          filter="blur(4px)"
        />
      </g>

      {/* Middle glow layer */}
      <g className="star-glow-middle">
        <path
          d="M50 15 L56 36 L78 36 L60 50 L66 71 L50 57 L34 71 L40 50 L22 36 L44 36 Z"
          fill="currentColor"
          opacity="0.4"
          filter="blur(2px)"
        />
      </g>

      {/* Main star */}
      <g className="star-main">
        <path
          d="M50 18 L55 35 L73 35 L59 47 L64 64 L50 52 L36 64 L41 47 L27 35 L45 35 Z"
          fill="currentColor"
        />
      </g>

      {/* Sparkle points */}
      <g className="star-sparkles">
        <circle cx="50" cy="10" r="1.5" fill="currentColor" opacity="0.8" />
        <circle cx="88" cy="38" r="1.5" fill="currentColor" opacity="0.8" />
        <circle cx="72" cy="84" r="1.5" fill="currentColor" opacity="0.8" />
        <circle cx="28" cy="84" r="1.5" fill="currentColor" opacity="0.8" />
        <circle cx="12" cy="38" r="1.5" fill="currentColor" opacity="0.8" />
      </g>
    </svg>
  )
}
