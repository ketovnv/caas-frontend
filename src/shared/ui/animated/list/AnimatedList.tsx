import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { useTrail, useSpringRef, animated, config, type SpringValue } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

type AnimationPreset = 'fadeIn' | 'slideUp' | 'slideLeft' | 'scaleUp' | 'flipIn';

export interface AnimatedListProps<T> extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Key extractor */
  keyExtractor: (item: T, index: number) => string | number;
  /** Animation preset */
  animation?: AnimationPreset;
  /** Stagger delay between items (ms) */
  staggerDelay?: number;
  /** Start animation on mount */
  autoStart?: boolean;
  /** Reverse animation direction */
  reverse?: boolean;
  /** Item wrapper className */
  itemClass?: string;
  /** Callback when all animations complete */
  onAnimationComplete?: () => void;
}

export interface AnimatedListRef {
  /** Play entrance animation */
  animateIn: () => Promise<void>;
  /** Play exit animation */
  animateOut: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
  /** Animate specific item */
  highlightItem: (index: number) => Promise<void>;
}

// ============================================================================
// Animation Presets
// ============================================================================

interface TrailSpringValues {
  opacity: number;
  x: number;
  y: number;
  scale: number;
  rotateX: number;
}

type TrailAnimatedValues = {
  [K in keyof TrailSpringValues]: SpringValue<TrailSpringValues[K]>;
};

const presets: Record<AnimationPreset, { from: TrailSpringValues; to: TrailSpringValues }> = {
  fadeIn: {
    from: { opacity: 0, x: 0, y: 0, scale: 1, rotateX: 0 },
    to: { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 },
  },
  slideUp: {
    from: { opacity: 0, x: 0, y: 40, scale: 1, rotateX: 0 },
    to: { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 },
  },
  slideLeft: {
    from: { opacity: 0, x: 60, y: 0, scale: 1, rotateX: 0 },
    to: { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 },
  },
  scaleUp: {
    from: { opacity: 0, x: 0, y: 0, scale: 0.8, rotateX: 0 },
    to: { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 },
  },
  flipIn: {
    from: { opacity: 0, x: 0, y: 0, scale: 1, rotateX: -90 },
    to: { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 },
  },
};

// ============================================================================
// Component - Imperative useTrail
// ============================================================================

function AnimatedListInner<T>(
  {
    items,
    renderItem,
    keyExtractor,
    animation = 'slideUp',
    staggerDelay = 50,
    autoStart = true,
    reverse = false,
    itemClass,
    onAnimationComplete,
    className,
    ...props
  }: AnimatedListProps<T>,
  ref: React.ForwardedRef<AnimatedListRef>
) {
  const hasAnimated = useRef(false);
  const animateInRef = useRef<(() => Promise<void>) | null>(null);
  const preset = presets[animation];

  // 🎯 Imperative trail ref for full control
  const trailRef = useSpringRef();

  // 🎨 Trail animation with imperative API
  const [trail, trailApi] = useTrail<TrailSpringValues>(items.length, () => ({
    ref: trailRef,
    from: preset.from,
    to: preset.from, // Start hidden
    config: { ...config.gentle, duration: undefined },
  }), [items.length, animation]);

  // 🚀 Animate in
  const animateIn = useCallback(async () => {
    await trailApi.start((i) => ({
      to: preset.to,
      delay: (reverse ? (items.length - 1 - i) : i) * staggerDelay,
    }));
    onAnimationComplete?.();
  }, [trailApi, preset.to, reverse, items.length, staggerDelay, onAnimationComplete]);

  // Keep ref in sync for use in effects without causing re-triggers
  animateInRef.current = animateIn;

  // 🚀 Animate out
  const animateOut = useCallback(async () => {
    await trailApi.start((i) => ({
      to: preset.from,
      delay: (reverse ? i : (items.length - 1 - i)) * staggerDelay,
    }));
  }, [trailApi, preset.from, reverse, items.length, staggerDelay]);

  // 🔄 Reset
  const reset = useCallback(() => {
    trailApi.set(preset.from);
    hasAnimated.current = false;
  }, [trailApi, preset.from]);

  // ✨ Highlight single item
  const highlightItem = useCallback(async (index: number) => {
    // Scale up and back
    await trailApi.start((i) => {
      if (i !== index) return;
      return {
        to: async (next) => {
          await next({ scale: 1.05 });
          await next({ scale: 1 });
        },
      };
    });
  }, [trailApi]);

  // 🎭 Expose imperative methods
  useImperativeHandle(ref, () => ({
    animateIn,
    animateOut,
    reset,
    highlightItem,
  }));

  // 📈 Auto-animate on mount
  useEffect(() => {
    if (autoStart && !hasAnimated.current && items.length > 0) {
      hasAnimated.current = true;
      animateIn();
    }
  }, [autoStart, items.length, animateIn]);

  // 🔄 Re-animate when items change (use ref to avoid infinite loop)
  useEffect(() => {
    if (hasAnimated.current && items.length > 0) {
      animateInRef.current?.();
    }
  }, [items]);

  // Get transform function based on animation type
  const getTransform = (style: TrailAnimatedValues) => {
    switch (animation) {
      case 'slideUp':
        return style.y.to((y) => `translateY(${y}px)`);
      case 'slideLeft':
        return style.x.to((x) => `translateX(${x}px)`);
      case 'scaleUp':
        return style.scale.to((s) => `scale(${s})`);
      case 'flipIn':
        return style.rotateX.to((r) => `perspective(600px) rotateX(${r}deg)`);
      default:
        return undefined;
    }
  };

  return (
    <ul className={cn('space-y-2', className)} {...props}>
      {trail.map((style, index) => {
        const item = items[index];
        if (!item) return null;

        return (
          <animated.li
            key={keyExtractor(item, index)}
            className={cn('will-change-transform', itemClass)}
            style={{
              opacity: style.opacity,
              transform: getTransform(style),
            }}
          >
            {renderItem(item, index)}
          </animated.li>
        );
      })}
    </ul>
  );
}

// Typed forwardRef wrapper
export const AnimatedList = forwardRef(AnimatedListInner) as <T>(
  props: AnimatedListProps<T> & { ref?: React.ForwardedRef<AnimatedListRef> }
) => ReturnType<typeof AnimatedListInner>;

// @ts-expect-error - displayName for debugging
AnimatedList.displayName = 'AnimatedList';
