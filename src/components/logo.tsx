import { cn } from '../lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="text-accent text-xl leading-none">⬡</span>
      <span
        style={{ fontFamily: 'var(--font-display)' }}
        className="text-foreground text-lg font-bold tracking-tight"
      >
        DocVault
      </span>
    </div>
  )
}