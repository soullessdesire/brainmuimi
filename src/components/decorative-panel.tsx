export function DecorativePanel() {
  return (
    <div className="hidden lg:flex flex-1 relative bg-[#0f1a0f] items-center justify-center overflow-hidden">
      {/* Green radial glow */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 30% 65%, rgba(76,175,80,0.18), transparent 65%)' }} />
      {/* Purple radial glow */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 75% 25%, rgba(107,45,139,0.15), transparent 60%)' }} />
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #4CAF50 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Vertical accent lines */}
      <div className="absolute left-[12%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#4CAF50]/10 to-transparent hidden xl:block" />
      <div className="absolute left-[88%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#6B2D8B]/10 to-transparent hidden xl:block" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-16 text-center select-none">
        {/* Large logo mark only */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" style={{ width: 120, height: 96, opacity: 0.9 }}>
          <circle cx="100" cy="20" r="18" fill="#4CAF50"/>
          <path d="M5 85 Q28 58 58 72 Q45 92 5 85Z"       fill="#6B2D8B"/>
          <path d="M8 100 Q33 70 62 85 Q49 108 8 100Z"     fill="#6B2D8B"/>
          <path d="M12 115 Q38 83 67 100 Q53 122 12 115Z"  fill="#6B2D8B"/>
          <path d="M195 85 Q172 58 142 72 Q155 92 195 85Z" fill="#6B2D8B"/>
          <path d="M192 100 Q167 70 138 85 Q151 108 192 100Z" fill="#6B2D8B"/>
          <path d="M188 115 Q162 83 133 100 Q147 122 188 115Z" fill="#6B2D8B"/>
          <path d="M22 88 Q47 63 77 77 Q64 97 22 88Z"      fill="#4CAF50"/>
          <path d="M26 103 Q52 76 82 92 Q68 112 26 103Z"   fill="#4CAF50"/>
          <path d="M178 88 Q153 63 123 77 Q136 97 178 88Z" fill="#4CAF50"/>
          <path d="M174 103 Q148 76 118 92 Q132 112 174 103Z" fill="#4CAF50"/>
          <path d="M100 130 Q93 104 100 78 Q107 104 100 130Z" fill="#4CAF50"/>
        </svg>

        <div>
          <p style={{ fontFamily: 'var(--font-display)' }}
            className="text-3xl font-bold text-white leading-tight mb-1">
            Brian M Muimi
          </p>
          <p className="text-sm font-medium text-[#4CAF50] uppercase tracking-[0.2em]">
            Books &amp; Publications
          </p>
        </div>

        <div className="flex flex-col gap-2 text-center">
          {['Free to read', 'Curated knowledge', 'Professionally written'].map(t => (
            <p key={t} className="text-xs text-white/30 tracking-wide flex items-center gap-2 justify-center">
              <span className="w-1 h-1 rounded-full bg-[#4CAF50] inline-block" />
              {t}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}