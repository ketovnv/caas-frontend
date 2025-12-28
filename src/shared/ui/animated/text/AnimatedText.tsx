import {
  useTrail,
  useSpringRef,
  animated,
  config,
  type SpringValue,
  type Interpolation,
} from '@react-spring/web';
import {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { reaction } from 'mobx';
import { cn } from 'shared/lib';
import {
  RAINBOWGRADIENT,
  type OklchTuple,
  type SpringConfig,
  DynamicColorArraySpring,
  themeStore,
} from '@/shared';

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
  /** Spring config for color animations (defaults to themeStore.springConfig) */
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
}

// ============================================================================
// Spring Values Type
// ============================================================================

interface CharSpringValues {
  opacity: number;
  y: number;
  scale: number;
  blur: number;
}

type CharAnimatedValues = {
  [K in keyof CharSpringValues]: SpringValue<CharSpringValues[K]>;
};

// ============================================================================
// Default Colors
// ============================================================================

const defaultColors: OklchTuple[] = RAINBOWGRADIENT;

const HIDDEN: CharSpringValues = { opacity: 0, y: 8, scale: 0.95, blur: 8 };
const VISIBLE: CharSpringValues = { opacity: 1, y: 0, scale: 1, blur: 0 };

// ============================================================================
// Gradient Flow Animation (injected once)
// ============================================================================

const GRADIENT_FLOW_KEYFRAMES = `
@keyframes gradientFlow {
  0% { background-position: var(--start-pos) 0%; }
  100% { background-position: var(--end-pos) 0%; }
}
`;

let styleInjected = false;
function injectGradientFlowStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = GRADIENT_FLOW_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

// ============================================================================
// Component - Imperative useTrail with Theme Support
// ============================================================================

function AnimatedTextInner(
  {
    text,
    colors,
    lightColors,
    darkColors,
    duration = 400,
    staggerDelay = 30,
    replayInterval = 0,
    gradientSpeed = 5,
    gradientAngle = 75,
    autoStart = true,
    className,
    as: Tag = 'div',
    onAnimationComplete,
    colorSpringConfig,
  }: AnimatedTextProps,
  ref: React.ForwardedRef<AnimatedTextRef>
) {
  const chars = useMemo(() => text.split(''), [text]);
  const hasAnimated = useRef(false);
  const isMounted = useRef(true);

  // Inject gradient flow keyframes once
  useEffect(() => {
    if (gradientSpeed > 0) {
      injectGradientFlowStyle();
    }
  }, [gradientSpeed]);

  // ─────────────────────────────────────────────────────────────────────────
  // Determine color mode and initial colors
  // ─────────────────────────────────────────────────────────────────────────

  const isThemed = !!(lightColors && darkColors);
  const initialColors = useMemo(() => {
    if (isThemed) {
      return themeStore.isDark ? darkColors! : lightColors!;
    }
    return colors ?? defaultColors;
  }, [isThemed, colors, lightColors, darkColors]);

  // ─────────────────────────────────────────────────────────────────────────
  // Color Spring Controller (for animated gradient)
  // ─────────────────────────────────────────────────────────────────────────

  const colorSpringRef = useRef<DynamicColorArraySpring | null>(null);

  // Initialize color spring once (uses theme's spring config by default)
  if (!colorSpringRef.current) {
    colorSpringRef.current = new DynamicColorArraySpring(
      initialColors,
      colorSpringConfig ?? themeStore.springConfig
    );
  }

  const colorSpring = colorSpringRef.current;

  // Get animated gradient string
  const gradientColorsInterpolation: Interpolation<string> = useMemo(
    () => colorSpring.gradientString(gradientAngle),
    [colorSpring, gradientAngle]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Theme Reaction (animate colors on theme change)
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isThemed) return;

    // React to theme changes
    const dispose = reaction(
      () => themeStore.isDark,
      (isDark) => {
        const targetColors = isDark ? darkColors! : lightColors!;
        colorSpring.animateTo(targetColors);
      }
    );

    return () => dispose();
  }, [isThemed, lightColors, darkColors, colorSpring]);

  // Update colors when props change (non-themed mode)
  useEffect(() => {
    if (isThemed) return;
    const targetColors = colors ?? defaultColors;
    colorSpring.animateTo(targetColors);
  }, [isThemed, colors, colorSpring]);

  // ─────────────────────────────────────────────────────────────────────────
  // Imperative Trail API
  // ─────────────────────────────────────────────────────────────────────────

  const trailRef = useSpringRef();

  const [trail, trailApi] = useTrail<CharSpringValues>(
    chars.length,
    () => ({
      ref: trailRef,
      from: HIDDEN,
      to: HIDDEN,
      config: { ...config.gentle, duration },
    }),
    [chars.length, duration]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Imperative Methods
  // ─────────────────────────────────────────────────────────────────────────

  const animateIn = useCallback(async () => {
    await trailApi.start((i) => ({
      to: VISIBLE,
      delay: i * staggerDelay,
    }));
    onAnimationComplete?.();
  }, [trailApi, staggerDelay, onAnimationComplete]);

  const animateOut = useCallback(async () => {
    await trailApi.start((i) => ({
      to: HIDDEN,
      delay: (chars.length - 1 - i) * staggerDelay,
    }));
  }, [trailApi, chars.length, staggerDelay]);

  const reset = useCallback(() => {
    trailApi.set(HIDDEN);
    hasAnimated.current = false;
  }, [trailApi]);

  const replay = useCallback(async () => {
    trailApi.set(HIDDEN);
    await animateIn();
  }, [trailApi, animateIn]);

  const animateColors = useCallback(
    async (newColors: OklchTuple[]) => {
      await colorSpring.animateTo(newColors);
    },
    [colorSpring]
  );

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    animateIn,
    animateOut,
    reset,
    replay,
    animateColors,
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-start & Replay
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoStart && !hasAnimated.current && chars.length > 0) {
      hasAnimated.current = true;
      animateIn();
    }
  }, [autoStart, chars.length, animateIn]);

  useEffect(() => {
    if (replayInterval <= 0) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        replay();
      }
    }, replayInterval);

    return () => clearInterval(intervalId);
  }, [replayInterval, replay]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      colorSpring.stop();
    };
  }, [colorSpring]);

  // ─────────────────────────────────────────────────────────────────────────
  // Gradient Styles (using animated interpolation)
  // ─────────────────────────────────────────────────────────────────────────

  // Animated background gradient
  const getAnimatedBackground = useCallback(
    () => {
      if (gradientSpeed > 0) {
        // Flowing gradient - double the colors for seamless loop
        return gradientColorsInterpolation.to(
          (colors) =>
            `linear-gradient(${gradientAngle}deg, ${colors}, ${colors})`
        );
      }

      // Static gradient
      return gradientColorsInterpolation.to(
        (colors) => `linear-gradient(${gradientAngle}deg, ${colors})`
      );
    },
    [gradientSpeed, gradientAngle, gradientColorsInterpolation]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Tag className={cn('relative inline-flex', className)}>
      {trail.map((style: CharAnimatedValues, index: number) => {
        // Calculate position for this character in the gradient
        const charPosition = (index / chars.length) * 100;
        // For animation: shift by one full text width (100%)
        const startPos = `${charPosition}%`;
        const endPos = `${charPosition + 100}%`;

        return (
          <animated.span
            key={index}
            style={
              {
                display: 'inline-block',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                // Double width for seamless animation loop
                backgroundSize: `${chars.length * 200}% 100%`,
                backgroundPosition: gradientSpeed > 0 ? undefined : `${charPosition}% 0%`,
                backgroundImage: getAnimatedBackground(),
                // CSS custom properties for animation keyframes
                '--start-pos': startPos,
                '--end-pos': endPos,
                animation: gradientSpeed > 0 ? `gradientFlow ${gradientSpeed}s linear infinite` : undefined,
                opacity: style.opacity,
                transform: style.y.to((y) => `translateY(${y}px)`),
                scale: style.scale,
                filter: style.blur.to((b) => `blur(${b}px)`),
              } as unknown as React.CSSProperties
            }
          >
            {chars[index] === ' ' ? '\u00A0' : chars[index]}
          </animated.span>
        );
      })}
    </Tag>
  );
}

// ============================================================================
// Exports
// ============================================================================

export const AnimatedText = forwardRef(AnimatedTextInner);
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
