interface Props {
  size?: number
  className?: string
}

export function AppLogo({ size = 48, className = '' }: Props) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        {/* Rugby ball shape */}
        <ellipse
          cx="32"
          cy="32"
          rx="14"
          ry="22"
          transform="rotate(-30 32 32)"
          fill="currentColor"
          className="text-primary"
        />
        {/* Seam lines */}
        <path
          d="M25 18 L39 46"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M22 28 L34 24"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M30 40 L42 36"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M26 34 L38 30"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
