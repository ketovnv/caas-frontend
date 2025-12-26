import { useTrail, useSpring, animated, easings } from '@react-spring/web';
import { useState, useEffect, useRef, useCallback, useMemo, type CSSProperties } from 'react';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface AnimatedTextProps {
  /** Text to display */
  text: string;
  /** Gradient colors array */
  colors?: string[];
  /** Animation duration in ms */
  duration?: number;
  /** Delay between characters in ms */
  staggerDelay?: number;
  /** Auto-replay interval in ms (0 = disabled) */
  replayInterval?: number;
  /** Gradient animation speed (0 = static gradient) */
  gradientSpeed?: number;
  /** Gradient angle in degrees */
  gradientAngle?: number;
  /** Additional className */
  className?: string;
  /** Text element tag */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

// ============================================================================
// Default Colors (rainbow gradient)
// ============================================================================

const defaultColors = [
  'rgb(131, 179, 32)',   // lime
  'rgb(47, 195, 106)',   // green
  'rgb(42, 169, 210)',   // cyan
  'rgb(4, 112, 202)',    // blue
  'rgb(107, 10, 255)',   // violet
  'rgb(183, 0, 218)',    // purple
  'rgb(218, 0, 171)',    // magenta
  'rgb(230, 64, 92)',    // red
  'rgb(232, 98, 63)',    // orange
  'rgb(249, 129, 47)',   // yellow-orange
];

// ============================================================================
// Component
// ============================================================================

export function AnimatedText({
  text,
  colors = defaultColors,
  duration = 500,
  staggerDelay = 40,
  replayInterval = 3500,
  gradientSpeed = 2,
  gradientAngle = 75,
  className,
  as: Tag = 'div',
}: AnimatedTextProps) {
  const chars = text.split('');
  const [animKey, setAnimKey] = useState(0);
  const lastHiddenRef = useRef(0);
  const isMounted = useRef(true);

  // Build gradient string from colors
  const gradientColors = useMemo(() => {
    // Create smooth gradient with colors distributed evenly
    return colors.join(', ');
  }, [colors]);

  // Animated gradient position for flowing effect
  const [gradientSpring, gradientApi] = useSpring(() => ({
    position: 0,
    config: { duration: gradientSpeed * 1000 },
  }));

  // Character appearance trail animation
  const trail = useTrail(chars.length, {
    from: {
      opacity: 0,
      y: 8,
      scale: 0.95,
      blur: 8,
    },
    to: {
      opacity: 1,
      y: 0,
      scale: 1,
      blur: 0,
    },
    config: {
      duration,
      easing: easings.easeOutCubic,
    },
    delay: (key: string) => parseInt(key, 10) * staggerDelay,
    keys: chars.map((_, i) => `${animKey}-${i}`),
  });

  // Gradient animation loop
  useEffect(() => {
    if (gradientSpeed <= 0) return;

    isMounted.current = true;

    const animateGradient = () => {
      if (!isMounted.current) return;

      gradientApi.start({
        from: { position: 0 },
        to: { position: 100 },
        config: { duration: gradientSpeed * 1000 },
        onRest: () => {
          if (isMounted.current) {
            animateGradient();
          }
        },
      });
    };

    animateGradient();

    return () => {
      isMounted.current = false;
      gradientApi.stop();
    };
  }, [gradientSpeed, gradientApi]);

  // Replay animation trigger
  const triggerReplay = useCallback(() => {
    if (document.visibilityState === 'visible') {
      if (Date.now() - lastHiddenRef.current > 500) {
        setAnimKey((k) => k + 1);
      }
    } else {
      lastHiddenRef.current = Date.now();
    }
  }, []);

  // Auto-replay interval
  useEffect(() => {
    if (replayInterval <= 0) return;

    const intervalId = setInterval(triggerReplay, replayInterval);
    return () => clearInterval(intervalId);
  }, [replayInterval, triggerReplay]);

  // Calculate character position as percentage for gradient offset
  const getCharGradientStyle = useCallback((index: number): CSSProperties => {
    const totalChars = chars.length;
    // Each character shows a slice of the gradient
    // backgroundSize stretches gradient across all chars
    // backgroundPosition offsets to show correct slice for this char
    const sizeMultiplier = gradientSpeed > 0 ? totalChars * 2 : totalChars;
    const positionOffset = (index / totalChars) * 100;

    return {
      background: gradientSpeed > 0
        ? `linear-gradient(${gradientAngle}deg, ${gradientColors}, ${gradientColors})`
        : `linear-gradient(${gradientAngle}deg, ${gradientColors})`,
      backgroundSize: `${sizeMultiplier * 100}% 100%`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      backgroundPosition: `${positionOffset}% 0%`,
    };
  }, [chars.length, gradientColors, gradientSpeed, gradientAngle]);

  // Animated background position offset for flowing gradient
  const getAnimatedPosition = useCallback((index: number) => {
    const totalChars = chars.length;
    const baseOffset = (index / totalChars) * 100;

    return gradientSpring.position.to(
      (p) => `${baseOffset + p}% 0%`
    );
  }, [chars.length, gradientSpring.position]);

  return (
    <Tag className={cn('relative inline-flex', className)}>
      {trail.map((style, index) => (
        <animated.span
          key={`${animKey}-${index}`}
          style={{
            display: 'inline-block',
            ...getCharGradientStyle(index),
            backgroundPosition: gradientSpeed > 0 ? getAnimatedPosition(index) : undefined,
            // Animation styles
            opacity: (style as any).opacity,
            transform: (style as any).y?.to((y: number) => `translateY(${y}px)`),
            scale: (style as any).scale,
            filter: (style as any).blur?.to((b: number) => `blur(${b}px)`),
          }}
        >
          {chars[index] === ' ' ? '\u00A0' : chars[index]}
        </animated.span>
      ))}
    </Tag>
  );
}

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
