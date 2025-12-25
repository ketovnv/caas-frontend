import type { Route, RouteConfig, TransitionConfig, TransitionType } from './types';

// Route configurations
export const routeConfigs: Record<Route, RouteConfig> = {
  // Public routes
  home: {
    requiresAuth: false,
    title: 'CaaS - Home',
  },
  showcase: {
    requiresAuth: false,
    title: 'CaaS - Components',
  },

  // Protected routes
  wallet: {
    requiresAuth: true,
    redirectTo: 'home',
    title: 'CaaS - Wallet',
  },
  exchange: {
    requiresAuth: true,
    redirectTo: 'home',
    title: 'CaaS - Exchange',
  },
  textures: {
    requiresAuth: true,
    title: 'CaaS - Textures',
  },
  settings: {
    requiresAuth: true,
    redirectTo: 'home',
    title: 'CaaS - Settings',
  },

  // Fallback
  'not-found': {
    requiresAuth: false,
    title: 'CaaS - Not Found',
  },
};

// Route hierarchy for determining transition direction
// Lower index = "earlier" in flow, higher = "deeper"
const routeOrder: Route[] = [
  'home',
  'showcase',
  'wallet',
  'exchange',
  'settings',
  'not-found',
];

/**
 * Get transition type based on route relationship
 */
export function getTransitionType(from: Route | null, to: Route): TransitionType {
  if (!from || from === to) return 'none';

  const fromIndex = routeOrder.indexOf(from);
  const toIndex = routeOrder.indexOf(to);

  // Forward = going deeper into app
  if (toIndex > fromIndex) return 'slide-left';

  // Back = going to earlier route
  if (toIndex < fromIndex) return 'slide-right';

  return 'fade';
}

/**
 * Get full transition config
 */
export function getTransitionConfig(from: Route | null, to: Route): TransitionConfig {
  const type = getTransitionType(from, to);

  return {
    type,
    duration: type === 'none' ? 0 : 300,
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
