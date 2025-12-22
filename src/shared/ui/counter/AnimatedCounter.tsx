import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  type HTMLAttributes,
} from 'react';
import { useSpringValue, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface AnimatedCounterProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Target value */
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** Decimal separator */
  decimalSeparator?: string;
  /** Thousands separator */
  thousandsSeparator?: string;
  /** Prefix (e.g., "$", "€") */
  prefix?: string;
  /** Suffix (e.g., "%", " USD") */
  suffix?: string;
  /** Animation duration ms */
  duration?: number;
  /** Animation easing */
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'spring';
  /** Start animation on mount */
  autoStart?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface AnimatedCounterRef {
  /** Start animation to current value */
  start: () => Promise<void>;
  /** Animate to specific value */
  animateTo: (value: number) => Promise<void>;
  /** Get current animated value */
  getValue: () => number;
  /** Reset to 0 */
  reset: () => void;
}

// ============================================================================
// Component - Full Imperative useSpringValue
// ============================================================================

export const AnimatedCounter = forwardRef<AnimatedCounterRef, AnimatedCounterProps>(
  (
    {
      value,
      decimals = 0,
      decimalSeparator = '.',
      thousandsSeparator = ',',
      prefix = '',
      suffix = '',
      duration = 1000,
      easing = 'easeOut',
      autoStart = true,
      onComplete,
      className,
      ...props
    },
    ref
  ) => {
    const prevValue = useRef(0);
    const hasStarted = useRef(false);
    const animateToRef = useRef<((targetValue: number) => Promise<void>) | null>(null);

    // 🎯 Get spring config based on easing
    const getConfig = useCallback(() => {
      switch (easing) {
        case 'linear':
          return { duration, easing: (t: number) => t };
        case 'easeInOut':
          return { duration, easing: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 };
        case 'spring':
          return { ...config.gentle, duration: undefined };
        case 'easeOut':
        default:
          return { duration, easing: (t: number) => 1 - Math.pow(1 - t, 3) };
      }
    }, [duration, easing]);

    // 🎯 Imperative SpringValue for the counter
    const animatedValue = useSpringValue(0, {
      config: getConfig(),
      onChange: () => {}, // Will be set in formatValue
    });

    // 📊 Format number with separators
    const formatNumber = useCallback(
      (num: number): string => {
        const fixed = num.toFixed(decimals);
        const [intPart = '0', decPart] = fixed.split('.');

        // Add thousand separators
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

        return decPart
          ? `${prefix}${formattedInt}${decimalSeparator}${decPart}${suffix}`
          : `${prefix}${formattedInt}${suffix}`;
      },
      [decimals, decimalSeparator, thousandsSeparator, prefix, suffix]
    );

    // 🚀 Animate to value
    const animateTo = useCallback(
      async (targetValue: number) => {
        await animatedValue.start(targetValue);
        onComplete?.();
      },
      [animatedValue, onComplete]
    );

    // Keep ref in sync for use in effects without causing re-triggers
    animateToRef.current = animateTo;

    // 🎭 Expose imperative methods
    useImperativeHandle(ref, () => ({
      start: () => animateTo(value),
      animateTo,
      getValue: () => animatedValue.get(),
      reset: () => {
        animatedValue.set(0);
        prevValue.current = 0;
      },
    }));

    // 📈 Auto-animate on value change (use ref to avoid infinite loop)
    useEffect(() => {
      if (!autoStart && !hasStarted.current) return;

      hasStarted.current = true;

      if (value !== prevValue.current) {
        animateToRef.current?.(value);
        prevValue.current = value;
      }
    }, [value, autoStart]);

    // Initial auto-start (use ref to avoid infinite loop)
    useEffect(() => {
      if (autoStart && !hasStarted.current) {
        hasStarted.current = true;
        animateToRef.current?.(value);
        prevValue.current = value;
      }
    }, [autoStart, value]);

    return (
      <animated.span
        className={cn('tabular-nums', className)}
        {...props}
      >
        {animatedValue.to((v) => formatNumber(v))}
      </animated.span>
    );
  }
);

AnimatedCounter.displayName = 'AnimatedCounter';
