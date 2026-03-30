import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** compact = icon only, used in tight spaces */
  compact?: boolean
  /** invert = white text for dark backgrounds */
  invert?: boolean
}

export function Logo({ className, compact = false, invert = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* SVG logo mark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 160"
        className="shrink-0"
        style={{ width: 36, height: 29 }}
        aria-label="Brian M Muimi Books and Publications logo"
      >
        {/* Green circle — person / knowledge */}
        <circle cx="100" cy="20" r="18" fill="#4CAF50"/>

        {/* Purple outer waves — left */}
        <path d="M5 85 Q28 58 58 72 Q45 92 5 85Z"   fill="#6B2D8B"/>
        <path d="M8 100 Q33 70 62 85 Q49 108 8 100Z" fill="#6B2D8B"/>
        <path d="M12 115 Q38 83 67 100 Q53 122 12 115Z" fill="#6B2D8B"/>

        {/* Purple outer waves — right */}
        <path d="M195 85 Q172 58 142 72 Q155 92 195 85Z"  fill="#6B2D8B"/>
        <path d="M192 100 Q167 70 138 85 Q151 108 192 100Z" fill="#6B2D8B"/>
        <path d="M188 115 Q162 83 133 100 Q147 122 188 115Z" fill="#6B2D8B"/>

        {/* Green inner waves — left */}
        <path d="M22 88 Q47 63 77 77 Q64 97 22 88Z"  fill="#4CAF50"/>
        <path d="M26 103 Q52 76 82 92 Q68 112 26 103Z" fill="#4CAF50"/>

        {/* Green inner waves — right */}
        <path d="M178 88 Q153 63 123 77 Q136 97 178 88Z"  fill="#4CAF50"/>
        <path d="M174 103 Q148 76 118 92 Q132 112 174 103Z" fill="#4CAF50"/>

        {/* Spine */}
        <path d="M100 130 Q93 104 100 78 Q107 104 100 130Z" fill="#4CAF50"/>
      </svg>

      {!compact && (
        <div className="leading-tight">
          <p
            style={{ fontFamily: 'var(--font-display)' }}
            className={cn('font-bold tracking-tight leading-none text-base', invert ? 'text-white' : 'text-foreground')}
          >
            Brian M Muimi
          </p>
          <p className={cn('text-[10px] font-medium tracking-wide uppercase', invert ? 'text-white/60' : 'text-muted-foreground')}>
            Books &amp; Publications
          </p>
        </div>
      )}
    </div>
  )
}