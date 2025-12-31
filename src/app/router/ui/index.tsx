import { Suspense, lazy, useEffect, type ComponentType } from 'react';
import { observer } from 'mobx-react-lite';
import { useTransition, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import {
  router,
  swipeController,
  getRouteDistance,
  getNextRoute,
  getPrevRoute,
  NAVIGATION_ORDER,
  type Route,
} from 'app/router';
import {
  transitionSpring,
  getAnimationConfig,
} from '../config/router-transition.config';

// ─────────────────────────────────────────────────────────────
// Lazy loaded pages
// ─────────────────────────────────────────────────────────────

const HomePage = lazy(() => import('pages/home').then(m => ({ default: m.HomePage })));
const SettingsPage = lazy(() => import('pages/settings').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('pages/not-found').then(m => ({ default: m.NotFoundPage })));

// Route → Component mapping
const routes: Record<Route, ComponentType> = {
  home: HomePage,
  settings: SettingsPage,
  'not-found': NotFoundPage
};

// ─────────────────────────────────────────────────────────────
// Loading
// ─────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      {/*<div className="text-white/50 text-xl">Loading...</div>*/}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Swipe Gesture Hook (uses SwipeController)
// ─────────────────────────────────────────────────────────────

function useSwipeNavigation() {
  const ctrl = swipeController;

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], velocity: [vx], cancel }) => {
      const currentRoute = router.currentRoute;

      // Check if we can navigate in this direction
      const canGoLeft = !!getPrevRoute(currentRoute);
      const canGoRight = !!getNextRoute(currentRoute);

      if (active) {
        // During drag: update controller
        ctrl.updateDrag(mx, canGoLeft, canGoRight);
      } else {
        // On release: check if should navigate
        const navigateDirection = ctrl.shouldNavigate(mx, vx, dx, canGoLeft, canGoRight);

        if (navigateDirection) {
          const nextRoute = navigateDirection === 'left'
            ? getPrevRoute(currentRoute)
            : getNextRoute(currentRoute);

          if (nextRoute && router.canAccessRoute(nextRoute)) {
            cancel(); // Cancel gesture
            router.navigate(nextRoute);
          }
        }

        // Reset position
        ctrl.reset();
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    }
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => ctrl.dispose();
  }, [ctrl]);

  return { bind, ctrl };
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export const AppRouter = observer(function AppRouter() {
  const { currentRoute, previousRoute, transitionConfig } = router;
  const { bind, ctrl } = useSwipeNavigation();

  const animConfig = getAnimationConfig(
    previousRoute,
    currentRoute,
    transitionConfig.type,
    NAVIGATION_ORDER,
    getRouteDistance
  );

  const transitions = useTransition(currentRoute, {
    keys: currentRoute,
    from: animConfig.from,
    enter: animConfig.enter,
    leave: animConfig.leave,
    config: {
      ...transitionSpring,
      duration: transitionConfig.duration,
    },
    exitBeforeEnter: false,
    onRest: (_result, _spring, item) => {
      // Only call when the entering item finishes
      if (item === currentRoute) {
        router.onTransitionEnd();
      }
    },
  });

  return (
    <div
      className="relative w-full"
      style={{ perspective: '1200px' }}
    >
      {transitions((style, route) => {
        const PageComponent = routes[route];
        const isCurrentPage = route === currentRoute;

        return (
          <animated.div
            {...(isCurrentPage ? bind() : {})}
            style={{
              ...style,
              // Only apply drag offset to current page, ADD to existing transform
              x: isCurrentPage && style.x
                ? (style.x as any).to((v: number) => v + ctrl.dragX.get())
                : style.x,
              scale: isCurrentPage && style.scale
                ? (style.scale as any).to((v: number) => v * ctrl.dragScale.get())
                : style.scale,
              rotateY: isCurrentPage && style.rotateY
                ? (style.rotateY as any).to((v: number) => v + ctrl.dragRotateY.get())
                : style.rotateY,
              position: isCurrentPage ? 'relative' : 'absolute',
              width: '100%',
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
              touchAction: 'pan-y',
            }}
          >
            <Suspense fallback={<PageLoader />}>
              <PageComponent />
            </Suspense>
          </animated.div>
        );
      })}
    </div>
  );
});
