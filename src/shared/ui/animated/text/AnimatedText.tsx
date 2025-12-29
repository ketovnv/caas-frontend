import { useTrail, animated, config } from '@react-spring/web';
import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { cn } from 'shared/lib';
import { themeStore, core, type OklchTuple, type SpringConfig } from '@/shared';
import { AnimatedTextController } from './AnimatedTextController';
import {
  CHAR_HIDDEN,
  DEFAULT_DURATION,
  DEFAULT_STAGGER_DELAY,
  DEFAULT_GRADIENT_SPEED,
  DEFAULT_GRADIENT_ANGLE,
  injectGradientFlowStyle,
  type CharState,
} from './animated-text.config';

// ============================================================================
// Types
// ============================================================================

export interface AnimatedTextProps {
  /** Text to display */
  text: string;
  /** Gradient colors (static, ignores theme) */
  colors?: OklchTuple[];
  /** Light theme colors (used with darkColors for theme switching) */
  lightColors?: OklchTuple[];
  /** Dark theme colors (used with lightColors for theme switching) */
  darkColors?: OklchTuple[];
  /** Animation duration in ms */
  duration?: number;
  /** Delay between characters in ms */
  staggerDelay?: number;
  /** Auto-replay interval in ms (0 = disabled) */
  replayInterval?: number;
  /** Gradient animation speed in seconds (0 = static gradient) */
  gradientSpeed?: number;
  /** Gradient angle in degrees */
  gradientAngle?: number;
  /** Start animation on mount */
  autoStart?: boolean;
  /** Additional className */
  className?: string;
  /** Text element tag */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Spring config for color animations */
  colorSpringConfig?: SpringConfig;
}

export interface AnimatedTextRef {
  /** Play entrance animation */
  animateIn: () => Promise<void>;
  /** Play exit animation */
  animateOut: () => Promise<void>;
  /** Reset to initial (hidden) state */
  reset: () => void;
  /** Replay animation */
  replay: () => Promise<void>;
  /** Animate colors to new values */
  animateColors: (colors: OklchTuple[]) => Promise<void>;
  /** Access to controller */
  controller: AnimatedTextController;
}

// ============================================================================
// Component
// ============================================================================

const AnimatedTextInner = observer(forwardRef<AnimatedTextRef, AnimatedTextProps>(
  function AnimatedText(
    {
      text,
      colors,
      lightColors,
      darkColors,
      duration = DEFAULT_DURATION,
      staggerDelay = DEFAULT_STAGGER_DELAY,
      replayInterval = 0,
      gradientSpeed = DEFAULT_GRADIENT_SPEED,
      gradientAngle = DEFAULT_GRADIENT_ANGLE,
      autoStart = true,
      className,
      as: Tag = 'div',
      onAnimationComplete,
      colorSpringConfig,
    },
    ref
  ) {
    // ─────────────────────────────────────────────────────────────────────────
    // Controller (single instance)
    // ─────────────────────────────────────────────────────────────────────────

    const ctrlRef = useRef<AnimatedTextController | null>(null);
    if (!ctrlRef.current) {
      ctrlRef.current = new AnimatedTextController({
        text,
        colors,
        lightColors,
        darkColors,
        staggerDelay,
        gradientSpeed,
        gradientAngle,
        colorSpringConfig,
      });
    }
    const ctrl = ctrlRef.current;

    // Get chars from controller (observable)
    const chars = ctrl.chars;

    // ─────────────────────────────────────────────────────────────────────────
    // Inject gradient flow keyframes
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
      if (gradientSpeed > 0) {
        injectGradientFlowStyle();
      }
    }, [gradientSpeed]);

    // ─────────────────────────────────────────────────────────────────────────
    // Trail Animation
    // ─────────────────────────────────────────────────────────────────────────

    const [trail, trailApi] = useTrail<CharState>(
      chars.length,
      () => ({
        from: CHAR_HIDDEN,
        to: CHAR_HIDDEN,
        config: { ...config.gentle, duration },
      }),
      [chars.length, duration]
    );

    // Connect trail API to controller
    useEffect(() => {
      ctrl.setTrailApi(trailApi);
    }, [ctrl, trailApi]);

    // ─────────────────────────────────────────────────────────────────────────
    // Text Change Handling - replay animation on text change
    // ─────────────────────────────────────────────────────────────────────────

    const prevTextRef = useRef(text);
    const isFirstRender = useRef(true);

    useEffect(() => {
      // Skip first render (auto-start handles it)
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (text !== prevTextRef.current) {
        prevTextRef.current = text;
        // Update controller text and replay animation
        ctrl.updateText(text);
        // Small delay to ensure trail is updated with new chars (synced with core loop)
        core.scheduleWrite(() => {
          ctrl.replay().then(() => {
            onAnimationComplete?.();
          });
        });
      }
    }, [text, ctrl, onAnimationComplete]);

    // ─────────────────────────────────────────────────────────────────────────
    // Theme Reaction
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
      if (!ctrl.isThemed) return;

      const dispose = reaction(
        () => themeStore.isDark,
        () => ctrl.animateToThemeColors()
      );

      return () => dispose();
    }, [ctrl]);

    // ─────────────────────────────────────────────────────────────────────────
    // Auto-start
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
      if (autoStart && !ctrl.hasAnimated && chars.length > 0) {
        ctrl.animateIn().then(() => {
          onAnimationComplete?.();
        });
      }
    }, [autoStart, chars.length, ctrl, onAnimationComplete]);

    // ─────────────────────────────────────────────────────────────────────────
    // Auto-replay
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
      if (replayInterval <= 0) return;

      const intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          ctrl.replay();
        }
      }, replayInterval);

      return () => clearInterval(intervalId);
    }, [replayInterval, ctrl]);

    // ─────────────────────────────────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
      return () => ctrl.dispose();
    }, [ctrl]);

    // ─────────────────────────────────────────────────────────────────────────
    // Imperative Handle
    // ─────────────────────────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      animateIn: () => ctrl.animateIn(),
      animateOut: () => ctrl.animateOut(),
      reset: () => ctrl.reset(),
      replay: () => ctrl.replay(),
      animateColors: (newColors) => ctrl.animateColors(newColors),
      controller: ctrl,
    }));

    // ─────────────────────────────────────────────────────────────────────────
    // Gradient Background
    // ─────────────────────────────────────────────────────────────────────────

    const getAnimatedBackground = useMemo(() => {
      if (gradientSpeed > 0) {
        return ctrl.gradientString.to(
          (colorsStr) => `linear-gradient(${gradientAngle}deg, ${colorsStr}, ${colorsStr})`
        );
      }
      return ctrl.gradientString.to(
        (colorsStr) => `linear-gradient(${gradientAngle}deg, ${colorsStr})`
      );
    }, [ctrl.gradientString, gradientSpeed, gradientAngle]);

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
      <Tag className={cn('relative inline-flex', className)}>
        {trail.map((style, index) => {
          const charPosition = (index / chars.length) * 100;
          const startPos = `${charPosition}%`;
          const endPos = `${charPosition + 100}%`;

          return (
            <animated.span
              key={index}
              style={{
                display: 'inline-block',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                backgroundSize: `${chars.length * 200}% 100%`,
                backgroundPosition: gradientSpeed > 0 ? undefined : `${charPosition}% 0%`,
                backgroundImage: getAnimatedBackground,
                '--start-pos': startPos,
                '--end-pos': endPos,
                animation: gradientSpeed > 0 ? `gradientFlow ${gradientSpeed}s linear infinite` : undefined,
                opacity: style.opacity,
                transform: style.y.to((y) => `translateY(${y}px)`),
                scale: style.scale,
                filter: style.blur.to((b) => `blur(${b}px)`),
              } as unknown as React.CSSProperties}
            >
              {chars[index] === ' ' ? '\u00A0' : chars[index]}
            </animated.span>
          );
        })}
      </Tag>
    );
  }
));

// ============================================================================
// Exports
// ============================================================================

export const AnimatedText = AnimatedTextInner;
AnimatedText.displayName = 'AnimatedText';

// ============================================================================
// Preset Variants
// ============================================================================

export function GradientText({
  text,
  colors,
  className,
  ...props
}: Omit<AnimatedTextProps, 'gradientSpeed' | 'replayInterval'>) {
  return (
    <AnimatedText
      text={text}
      colors={colors}
      gradientSpeed={0}
      replayInterval={0}
      className={className}
      {...props}
    />
  );
}

export function FlowingGradientText({
  text,
  colors,
  className,
  gradientSpeed = 4,
  ...props
}: AnimatedTextProps) {
  return (
    <AnimatedText
      text={text}
      colors={colors}
      gradientSpeed={gradientSpeed}
      replayInterval={0}
      className={className}
      {...props}
    />
  );
}

// ============================================================================
// Themed Variant
// ============================================================================

export function ThemedGradientText({
  text,
  lightColors,
  darkColors,
  className,
  ...props
}: Omit<AnimatedTextProps, 'colors' | 'gradientSpeed' | 'replayInterval'> & {
  lightColors: OklchTuple[];
  darkColors: OklchTuple[];
}) {
  return (
    <AnimatedText
      text={text}
      lightColors={lightColors}
      darkColors={darkColors}
      gradientSpeed={0}
      replayInterval={0}
      className={className}
      {...props}
    />
  );
}
