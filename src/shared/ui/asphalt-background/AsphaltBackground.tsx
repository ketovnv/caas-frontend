import { type ReactNode } from 'react';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

type BackgroundVariant = 'dark' | 'light';

export interface AsphaltBackgroundProps {
  children?: ReactNode;
  className?: string;
  /** Color variant */
  variant?: BackgroundVariant;
  /** Unique ID for SVG filters (required if multiple on page) */
  id?: string;
}

// ============================================================================
// Component
// ============================================================================

export function AsphaltBackground({
  children,
  className,
  variant = 'dark',
  id = 'asphalt',
}: AsphaltBackgroundProps) {
  const noiseId = `${id}-noise`;
  const grainId = `${id}-grain`;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* SVG Noise Filters */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={noiseId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              seed="2"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.15 0"
            />
            <feComposite operator="in" in2="SourceGraphic" />
            <feBlend mode="multiply" in2="SourceGraphic" />
          </filter>

          <filter id={grainId}>
            <feTurbulence
              type="turbulence"
              baseFrequency="0.65"
              numOctaves="3"
              seed="5"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0 0 0.05" />
            </feComponentTransfer>
            <feBlend mode="overlay" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* Base gradient */}
      <div
        className={cn(
          'absolute inset-0',
          variant === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700'
        )}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          filter: `url(#${noiseId})`,
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.1) 3px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.1) 3px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{ filter: `url(#${grainId})` }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

AsphaltBackground.displayName = 'AsphaltBackground';
