// Router types for CaaS

export type Route =
  | 'home'
  | 'showcase'
  | 'wallet'
  | 'exchange'
  | 'textures'
  | 'settings'
  | 'not-found';

export interface RouteConfig {
  /** Requires Web3Auth authentication */
  requiresAuth: boolean;
  /** Route to redirect if auth check fails */
  redirectTo?: Route;
  /** Page title for browser/app */
  title?: string;
}

export type TransitionType =
  | 'slide-left'    // Forward navigation
  | 'slide-right'   // Back navigation
  | 'fade'          // Modal-like or same-level
  | 'scale'         // Zoom in/out
  | 'none';         // Instant, no animation

export type TransitionDirection = 'forward' | 'back' | 'none';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // ms
}

export interface RouteParams {
  [key: string]: string;
}

export interface NavigateOptions {
  /** Replace current history entry instead of pushing */
  replace?: boolean;
  /** Skip transition animation */
  skipAnimation?: boolean;
}
