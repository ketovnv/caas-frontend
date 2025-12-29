import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Config
// ============================================================================

export const morphingSpring: SpringConfig = {
  tension: 200,
  friction: 20,
};

// ============================================================================
// Animation States
// ============================================================================

export interface MorphingTextState {
  blur: number;
}

/** Static state - чёткий текст */
export const MORPH_IDLE: MorphingTextState = {
  blur: 0,
};

/** Morphing state - blur для эффекта перехода */
export const MORPH_ACTIVE: MorphingTextState = {
  blur: 0.6,
};

// ============================================================================
// Animation Timing
// ============================================================================

/** Default morph duration in seconds */
export const DEFAULT_MORPH_TIME = 1.5;

/** Default cooldown between morphs in seconds */
export const DEFAULT_COOLDOWN_TIME = 0.5;

/** Cycling interval in ms (for texts array mode) */
export const CYCLING_INTERVAL = 3000;
