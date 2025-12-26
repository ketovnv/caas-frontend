import { type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';

export interface AnimatedThemeBackgroundProps {
  children?: ReactNode;
  className?: string;
  /** Unique ID for SVG filters */
  id?: string;
  /** Show noise texture */
  noise?: boolean;
  /** Show vignette */
  vignette?: boolean;
  /** Fixed position (fullscreen) */
  fixed?: boolean;
}

export const AnimatedThemeBackground = observer(function AnimatedThemeBackground({
  children,
  className,
  id = 'theme-bg',
  noise = true,
  vignette = true,
  fixed = false,
}: AnimatedThemeBackgroundProps) {
  const noiseId = `${id}-noise`;
  const { springs } = themeStore;

  // Get progress spring (might be a number if controller not ready)
  const progress = springs.progress;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fixed && 'fixed inset-0 min-h-screen',
        className
      )}
    >
      {/* SVG Noise Filter */}
      {noise && (
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id={noiseId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="4"
                seed="2"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0.12 0"
              />
              <feComposite operator="in" in2="SourceGraphic" />
              <feBlend mode="multiply" in2="SourceGraphic" />
            </filter>
          </defs>
        </svg>
      )}

      {/* Animated gradient background */}
      <animated.div
        className="absolute inset-0"
        style={{
          background:
            typeof progress === 'number'
              ? themeStore.getBackgroundAtProgress(progress)
              : (progress as any).to((t: number) => themeStore.getBackgroundAtProgress(t)),
        }}
      />

      {/* Noise texture overlay */}
      {noise && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            filter: `url(#${noiseId})`,
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.08) 3px),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.08) 3px)
            `,
            backgroundSize: '25px 25px',
          }}
        />
      )}

      {/* Vignette */}
      {vignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
          }}
        />
      )}

      {/* Content - scrollable when fixed */}
      <div className={cn(
        'relative z-10',
        fixed && 'h-screen overflow-y-auto overflow-x-hidden'
      )}>
        {children}
      </div>
    </div>
  );
});

AnimatedThemeBackground.displayName = 'AnimatedThemeBackground';
