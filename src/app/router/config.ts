import type { Route, RouteConfig, TransitionConfig, TransitionType } from './types';

// Route configurations
export const routeConfigs: Record<Route, RouteConfig> = {
  // Public routes
  home: {
    requiresAuth: false,
    title: 'CaaS - Home',
    displayTitle: 'CaaS Platform',
    subtitle: 'Crypto as a Service',
  },
  showcase: {
    requiresAuth: false,
    title: 'CaaS - Components',
    displayTitle: 'Components',
    subtitle: 'UI Component Library',
  },
  textures: {
    requiresAuth: false,
    title: 'CaaS - Textures',
    displayTitle: 'Textures',
    subtitle: 'Visual Effects Gallery',
  },

  // Protected routes (temporarily public for development)
  wallet: {
    requiresAuth: false,
    title: 'CaaS - Wallet',
    displayTitle: 'Wallet',
    subtitle: 'Manage your crypto assets',
  },
  exchange: {
    requiresAuth: false,
    title: 'CaaS - Exchange',
    displayTitle: 'Exchange',
    subtitle: 'Trade & Swap',
  },
  settings: {
    requiresAuth: false,
    title: 'CaaS - Settings',
    displayTitle: 'Settings',
    subtitle: 'Customize your experience',
  },

  // Fallback
  'not-found': {
    requiresAuth: false,
    title: 'CaaS - Not Found',
    displayTitle: '404',
    subtitle: 'Page not found',
  },
};

/**
 * Navigation order for swipe gestures
 * Pages are arranged in a horizontal line for swipe navigation
 */
export const NAVIGATION_ORDER: Route[] = [
  'home',
  'showcase',
  'textures',
  'wallet',
  'exchange',
  'settings',
];

/**
 * Get index of route in navigation order
 */
export function getRouteIndex(route: Route): number {
  const index = NAVIGATION_ORDER.indexOf(route);
  return index === -1 ? 0 : index;
}

/**
 * Get distance between two routes (for animation type selection)
 * Returns: 0 = same, 1 = neighbor, 2+ = far
 */
export function getRouteDistance(from: Route | null, to: Route): number {
  if (!from || from === to) return 0;

  const fromIndex = getRouteIndex(from);
  const toIndex = getRouteIndex(to);

  return Math.abs(toIndex - fromIndex);
}

/**
 * Check if routes are neighbors (distance = 1)
 */
export function areNeighbors(from: Route | null, to: Route): boolean {
  return getRouteDistance(from, to) === 1;
}

/**
 * Get next route in navigation order
 */
export function getNextRoute(current: Route): Route | null {
  const index = getRouteIndex(current);
  const next = NAVIGATION_ORDER[index + 1];
  return next ?? null;
}

/**
 * Get previous route in navigation order
 */
export function getPrevRoute(current: Route): Route | null {
  const index = getRouteIndex(current);
  const prev = NAVIGATION_ORDER[index - 1];
  return prev ?? null;
}

/**
 * Get transition type based on route relationship
 */
export function getTransitionType(from: Route | null, to: Route): TransitionType {
  if (!from || from === to) return 'none';

  const distance = getRouteDistance(from, to);
  const fromIndex = getRouteIndex(from);
  const toIndex = getRouteIndex(to);
  const direction = toIndex > fromIndex ? 1 : -1;

  // Neighbors: simple slide
  if (distance === 1) {
    return direction > 0 ? 'slide-left' : 'slide-right';
  }

  // Far pages: scale/flip effect
  return 'scale';
}

/**
 * Get full transition config
 */
export function getTransitionConfig(from: Route | null, to: Route): TransitionConfig {
  const type = getTransitionType(from, to);
  const distance = getRouteDistance(from, to);

  return {
    type,
    duration: type === 'none' ? 0 : distance === 1 ? 250 : 400,
  };
}

/**
 * Default route when accessing root
 */
export const DEFAULT_ROUTE: Route = 'home';

/**
 * Route to redirect unauthenticated users
 */
export const AUTH_REDIRECT_ROUTE: Route = 'home';
