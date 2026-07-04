/** Logo « radar » — cercles concentriques au dégradé violet -> magenta. */
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rr-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-violet)" />
          <stop offset="1" stopColor="var(--color-magenta)" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="15" stroke="url(#rr-logo)" strokeWidth="2.5" opacity="0.45" />
      <circle cx="20" cy="20" r="9" stroke="url(#rr-logo)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="3.5" fill="url(#rr-logo)" />
    </svg>
  )
}
