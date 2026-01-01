import type { SpringConfig } from '@react-spring/web';
import type { Route, TransitionType } from 'app/router/types';


// Spring Configs

/** Main transition spring - smooth page changes */
export const transitionSpring: SpringConfig = {
  tension: 280,
  friction: 30,
};

/** Drag spring - responsive swipe feel */
export const dragSpring: SpringConfig = {
  tension: 400,
  friction: 30,
};

/** Rubber band spring - bouncy edge resistance */
export const rubberBandSpring: SpringConfig = {
  tension: 500,
  friction: 35,
};


// Swipe Settings

/** Minimum distance (px) to trigger navigation */
export const SWIPE_THRESHOLD = 80;

/** Minimum velocity to trigger navigation */
export const SWIPE_VELOCITY_THRESHOLD = 0.5;

/** Rubber band factor when dragging past edge */
export const RUBBER_BAND_FACTOR = 0.2;

/** Maximum rotation during drag (degrees) */
export const MAX_DRAG_ROTATION = 10;

/** Rotation multiplier for drag distance */
export const DRAG_ROTATION_FACTOR = 0.02;

/** Scale reduction per pixel of drag */
export const DRAG_SCALE_FACTOR = 0.0005;

/** Minimum scale during drag */
export const MIN_DRAG_SCALE = 0.95;

// Slide Animation Settings

/** Slide distance for neighbor pages (px) */
export const SLIDE_DISTANCE = 400;

/** Scale when leaving during slide */
export const SLIDE_SCALE_OUT = 0.92;

/** Scale when entering during slide */
export const SLIDE_SCALE_IN = 0.95;

/** Leave distance multiplier (less than enter for parallax) */
export const SLIDE_LEAVE_FACTOR = 0.5;

// Tumble Animation Settings (far pages)

/** Scale for tumble animation */
export const TUMBLE_SCALE = 0.6;

/** Y-axis rotation (degrees) */
export const TUMBLE_ROTATE_Y = 45;

/** X-axis rotation (degrees) */
export const TUMBLE_ROTATE_X = 15;

/** Z-depth for tumble */
export const TUMBLE_Z_DEPTH = -200;


// Animation State Types


export interface TransitionAnimState {
  [key: string]: number; // Index signature for React Spring compatibility
  opacity: number;
  x: number;
  scale: number;
  rotateY: number;
  rotateX: number;
  z: number;
}

export interface DragAnimState {
  dragX: number;
  dragScale: number;
  dragRotateY: number;
}

export interface AnimConfig {
  from: TransitionAnimState;
  enter: TransitionAnimState;
  leave: TransitionAnimState;
}

// Animation States

export const DRAG_IDLE: DragAnimState = {
  dragX: 0,
  dragScale: 1,
  dragRotateY: 0,
};

export const TRANSITION_IDLE: TransitionAnimState = {
  opacity: 1,
  x: 0,
  scale: 1,
  rotateY: 0,
  rotateX: 0,
  z: 0,
};

// Animation Generators

/**
 * Neighbor pages: horizontal slide with scale effect
 */
export function getSlideAnimation(type: TransitionType): AnimConfig {
  const base: TransitionAnimState = { ...TRANSITION_IDLE, rotateY: 0, rotateX: 0, z: 0 };

  if (type === 'slide-left') {
    // Going forward (left): new page slides in from right
    return {
      from: { ...base, opacity: 0, x: SLIDE_DISTANCE, scale: SLIDE_SCALE_IN },
      enter: { ...base },
      leave: { ...base, opacity: 0, x: -SLIDE_DISTANCE * SLIDE_LEAVE_FACTOR, scale: SLIDE_SCALE_OUT },
    };
  }

  if (type === 'slide-right') {
    // Going back (right): new page slides in from left
    return {
      from: { ...base, opacity: 0, x: -SLIDE_DISTANCE, scale: SLIDE_SCALE_IN },
      enter: { ...base },
      leave: { ...base, opacity: 0, x: SLIDE_DISTANCE * SLIDE_LEAVE_FACTOR, scale: SLIDE_SCALE_OUT },
    };
  }

  // Default: fade only
  return {
    from: { ...base, opacity: 0 },
    enter: { ...base },
    leave: { ...base, opacity: 0 },
  };
}

/**
 * Far pages: 3D tumble/flip effect
 */
export function getTumbleAnimation(goingForward: boolean): AnimConfig {
  const rotateY = goingForward ? TUMBLE_ROTATE_Y : -TUMBLE_ROTATE_Y;

  return {
    from: {
      opacity: 0,
      x: 0,
      scale: TUMBLE_SCALE,
      rotateY: rotateY,
      rotateX: TUMBLE_ROTATE_X,
      z: TUMBLE_Z_DEPTH,
    },
    enter: { ...TRANSITION_IDLE },
    leave: {
      opacity: 0,
      x: 0,
      scale: TUMBLE_SCALE,
      rotateY: -rotateY,
      rotateX: -TUMBLE_ROTATE_X,
      z: TUMBLE_Z_DEPTH,
    },
  };
}

/**
 * Get animation config based on route distance
 */
export function getAnimationConfig(
  from: Route | null,
  to: Route,
  transitionType: TransitionType,
  routeOrder: Route[],
  getRouteDistance: (from: Route | null, to: Route) => number
): AnimConfig {
  const distance = getRouteDistance(from, to);

  // Same page or initial load
  if (distance === 0) {
    return {
      from: { ...TRANSITION_IDLE },
      enter: { ...TRANSITION_IDLE },
      leave: { ...TRANSITION_IDLE, opacity: 0 },
    };
  }

  // Neighbors: slide with scale
  if (distance === 1) {
    return getSlideAnimation(transitionType);
  }

  // Far pages: tumble
  const fromIndex = from ? routeOrder.indexOf(from) : 0;
  const toIndex = routeOrder.indexOf(to);
  const goingForward = toIndex > fromIndex;

  return getTumbleAnimation(goingForward);
}
