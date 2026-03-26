export function DecorativePanel() {
  return (
    <div className="hidden lg:flex flex-1 relative bg-foreground items-center justify-center overflow-hidden">
      {/* Radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,hsl(35_70%_35%/0.22),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(35_70%_35%/0.12),transparent_50%)]" />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(35 20% 97%) 1px, transparent 1px), linear-gradient(90deg, hsl(35 20% 97%) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative z-10 text-center px-12 select-none">
        <p
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-[clamp(72px,10vw,130px)] font-bold leading-[0.88] text-white/[0.04] tracking-tighter"
        >
          DOC
          <br />
          VAULT
        </p>
        <p className="text-white/25 text-xs mt-8 tracking-[0.22em] uppercase font-medium">
          Secure · Verified · Premium
        </p>
      </div>
    </div>
  )
}