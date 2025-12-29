// Router - Public API
export { router, swipeController, SwipeController } from 'app/router/model';
export { AppRouter } from 'app/router/ui';
export {
  routeConfigs,
  getTransitionConfig,
  getRouteDistance,
  getNextRoute,
  getPrevRoute,
  NAVIGATION_ORDER,
  DEFAULT_ROUTE,
} from 'app/router/config';

export type {
  Route,
  RouteConfig,
  RouteParams,
  NavigateOptions,
  TransitionType,
  TransitionDirection,
  TransitionConfig,
} from 'app/router/types';
