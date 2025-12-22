/**
 * React Spring re-exports with convenient aliases
 * @see https://www.react-spring.dev/docs/getting-started
 */
export {
  // Core hooks
  useSpring,
  useSprings,
  useTrail,
  useTransition,
  useChain,
  useSpringRef,
  useSpringValue,
  useInView,
  
  // Animated components
  animated,
  
  // Configuration presets
  config,
  
  // Utilities
  to,
  easings,
  
  // Types
  type SpringValue,
  type SpringRef,
  type SpringConfig,
  type AnimatedProps,
} from '@react-spring/web';

// Re-export animated as 'a' for shorter syntax (like Framer Motion)
export { animated as a } from '@react-spring/web';

// Re-export animated as 'imp' for imperative-style naming
export { animated as imp } from '@react-spring/web';
