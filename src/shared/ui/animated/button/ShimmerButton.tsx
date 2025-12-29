import { forwardRef, useEffect, useRef, useImperativeHandle, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { ShimmerButtonController } from './ShimmerButtonController';
import {
  DEFAULT_SHIMMER_COLOR,
  DEFAULT_SHIMMER_SPREAD,
  DEFAULT_SHIMMER_SIZE,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_SHIMMER_DURATION,
  DEFAULT_BACKGROUND,
  DEFAULT_SHIMMER_BLUR,
} from './shimmer-button.config';

// ============================================================================
// Types
// ============================================================================

export interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Shimmer color (CSS color value) */
  shimmerColor?: string;
  /** Shimmer spread angle in degrees */
  shimmerSpread?: number;
  /** Border gap size for the shimmer */
  shimmerSize?: string;
  /** Border radius */
  borderRadius?: string;
  /** Animation duration in seconds */
  shimmerDuration?: number;
  /** Background color/gradient */
  background?: string;
  /** Blur amount for shimmer glow */
  shimmerBlur?: number;
}

export interface ShimmerButtonRef {
  /** Access to controller for external control */
  controller: ShimmerButtonController;
}

// ============================================================================
// Component
// ============================================================================

const ShimmerButtonInner = observer(
  forwardRef<ShimmerButtonRef, ShimmerButtonProps>(
    (
      {
        className,
        children,
        shimmerColor = DEFAULT_SHIMMER_COLOR,
        shimmerSpread = DEFAULT_SHIMMER_SPREAD,
        shimmerSize = DEFAULT_SHIMMER_SIZE,
        borderRadius = DEFAULT_BORDER_RADIUS,
        shimmerDuration = DEFAULT_SHIMMER_DURATION,
        background = DEFAULT_BACKGROUND,
        shimmerBlur = DEFAULT_SHIMMER_BLUR,
        disabled,
        ...props
      },
      ref
    ) => {
      // ─────────────────────────────────────────────────────────────────────────
      // Controller (single instance)
      // ─────────────────────────────────────────────────────────────────────────

      const ctrlRef = useRef<ShimmerButtonController | null>(null);
      if (!ctrlRef.current) {
        ctrlRef.current = new ShimmerButtonController({
          shimmerColor,
          shimmerSpread,
          shimmerDuration,
        });
      }
      const ctrl = ctrlRef.current;

      // ─────────────────────────────────────────────────────────────────────────
      // Lifecycle
      // ─────────────────────────────────────────────────────────────────────────

      useEffect(() => {
        ctrl.startAnimations();
        return () => ctrl.dispose();
      }, [ctrl]);

      // Sync disabled state
      useEffect(() => {
        ctrl.setDisabled(!!disabled);
      }, [ctrl, disabled]);

      // ─────────────────────────────────────────────────────────────────────────
      // Imperative Handle
      // ─────────────────────────────────────────────────────────────────────────

      useImperativeHandle(ref, () => ({
        controller: ctrl,
      }));

      // ─────────────────────────────────────────────────────────────────────────
      // Render
      // ─────────────────────────────────────────────────────────────────────────

      return (
        <animated.button
          disabled={disabled}
          className={cn(
            'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden',
            'whitespace-nowrap border border-white/10 px-6 py-3 text-white',
            'transform-gpu transition-transform duration-300 ease-in-out',
            'active:translate-y-px',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          style={{
            background,
            borderRadius,
            transform: ctrl.buttonTransform,
          }}
          onMouseEnter={ctrl.onMouseEnter}
          onMouseLeave={ctrl.onMouseLeave}
          onMouseDown={ctrl.onMouseDown}
          onMouseUp={ctrl.onMouseUp}
          {...props}
        >
          {/* Shimmer glow layer - blurred for ambient effect */}
          <div
            className="absolute -z-30 inset-0 overflow-visible pointer-events-none"
            style={{
              containerType: 'size',
              filter: `blur(${shimmerBlur}px)`,
            }}
          >
            <animated.div
              className="absolute inset-0"
              style={{
                height: '100cqh',
                aspectRatio: '1',
                transform: ctrl.shimmerSlideTransform,
              }}
            >
              <animated.div
                className="absolute -inset-full w-auto"
                style={{
                  background: ctrl.shimmerGradient,
                  transform: ctrl.shimmerRotation,
                }}
              />
            </animated.div>
          </div>

          {/* Sharp shimmer highlight layer - minimal blur for defined streak */}
          <div
            className="absolute -z-30 inset-0 overflow-visible pointer-events-none"
            style={{
              containerType: 'size',
              filter: `blur(${Math.max(2, shimmerBlur * 0.25)}px)`,
            }}
          >
            <animated.div
              className="absolute inset-0"
              style={{
                height: '100cqh',
                aspectRatio: '1',
                transform: ctrl.shimmerSlideTransform,
              }}
            >
              <animated.div
                className="absolute -inset-full w-auto"
                style={{
                  background: ctrl.highlightGradient,
                  transform: ctrl.shimmerRotation,
                }}
              />
            </animated.div>
          </div>

          {/* Inner shadow overlay for depth */}
          <animated.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{
              boxShadow: ctrl.innerShadow,
            }}
          />

          {/* Inner background - creates the glowing border gap effect */}
          <div
            className="absolute -z-20"
            style={{
              background,
              borderRadius,
              inset: shimmerSize,
            }}
          />

          {/* Content */}
          <span className="relative z-10">{children}</span>
        </animated.button>
      );
    }
  )
);

// ============================================================================
// Exports
// ============================================================================

export const ShimmerButton = ShimmerButtonInner;
ShimmerButton.displayName = 'ShimmerButton';
