import { type ReactNode } from 'react';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface GlowBorderProps {
  children: ReactNode;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Glow color(s) - single color or array for gradient */
  colors?: string | string[];
  /** Border width in pixels */
  borderWidth?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Additional className for container */
  className?: string;
  /** Additional className for glow element */
  glowClassName?: string;
  /** Glow blur amount */
  blur?: number;
}

// ============================================================================
// Keyframes (injected once)
// ============================================================================

const GLOW_KEYFRAMES = `
@keyframes glowBorderSpin {
  from { --glow-angle: 0deg; }
  to { --glow-angle: 360deg; }
}

@property --glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
`;

let styleInjected = false;
function injectGlowStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = GLOW_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

// ============================================================================
// Component
// ============================================================================

export function GlowBorder({
  children,
  borderRadius = 12,
  colors = ['#0ea5e9', '#06b6d4', '#14b8a6'],
  borderWidth = 2,
  duration = 4,
  className,
  glowClassName,
  blur = 8,
}: GlowBorderProps) {
  // Inject keyframes on first render
  if (typeof document !== 'undefined') {
    injectGlowStyle();
  }

  const colorArray = Array.isArray(colors) ? colors : [colors];
  // Create conic gradient color stops
  const colorStops = [...colorArray, colorArray[0]!]
    .map((color, i, arr) => `${color} ${(i / (arr.length - 1)) * 100}%`)
    .join(', ');

  return (
    <div
      className={cn('relative', className)}
      style={{
        borderRadius,
        // CSS custom property for animation
        ['--glow-duration' as string]: `${duration}s`,
      }}
    >
      {/* Animated glow border */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-[inherit] overflow-hidden',
          glowClassName
        )}
        style={{
          padding: borderWidth,
          background: `conic-gradient(from var(--glow-angle, 0deg) at 50% 50%, ${colorStops})`,
          animation: `glowBorderSpin ${duration}s linear infinite`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Glow effect (blur) - behind everything */}
      {blur > 0 && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-60 -z-10"
          style={{
            background: `conic-gradient(from var(--glow-angle, 0deg) at 50% 50%, ${colorStops})`,
            animation: `glowBorderSpin ${duration}s linear infinite`,
            filter: `blur(${blur}px)`,
          }}
        />
      )}

      {/* Content - fills container height */}
      <div className="relative z-10 rounded-[inherit] h-full">
        {children}
      </div>
    </div>
  );
}

GlowBorder.displayName = 'GlowBorder';
