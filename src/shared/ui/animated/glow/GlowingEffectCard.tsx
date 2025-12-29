import { type ReactNode } from 'react';
import { cn } from 'shared/lib';
import { GlowingEffect, type GlowingEffectProps } from './GlowingEffect';

// ============================================================================
// Types
// ============================================================================

export interface GlowingEffectCardProps extends Partial<GlowingEffectProps> {
  children: ReactNode;
  /** Container className */
  className?: string;
  /** Inner content className */
  contentClassName?: string;
}

// ============================================================================
// Component
// ============================================================================

export function GlowingEffectCard({
  children,
  className,
  contentClassName,
  blur = 0,
  inactiveZone = 0.01,
  proximity = 64,
  spread = 50,
  variant = 'default',
  glow = false,
  movementDuration = 2,
  borderWidth = 2,
  disabled = false,
}: GlowingEffectCardProps) {
  return (
    <div className={cn('relative rounded-2xl', className)}>
      <GlowingEffect
        blur={blur}
        inactiveZone={inactiveZone}
        proximity={proximity}
        spread={spread}
        variant={variant}
        glow={glow}
        movementDuration={movementDuration}
        borderWidth={borderWidth}
        disabled={disabled}
      />
      {/* Inner container with thin border rim and shadow */}
      <div
        className={cn(
          'relative flex h-full flex-col justify-between gap-6',
          'overflow-hidden rounded-xl',
          'border border-zinc-700/50',
          'bg-zinc-900',
          'p-6',
          'shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]',
          'dark:shadow-[0px_0px_27px_0px_#2D2D2D]',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

GlowingEffectCard.displayName = 'GlowingEffectCard';
