import { Suspense, lazy, type ComponentType } from 'react';
import { observer } from 'mobx-react-lite';
import { useTransition, animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import {
  router,
  getRouteDistance,
  getNextRoute,
  getPrevRoute,
  type Route,
  type TransitionType,
} from 'app/router';

// Lazy loaded pages
const HomePage = lazy(() => import('pages/home').then(m => ({ default: m.HomePage })));
const ComponentsShowcase = lazy(() => import('pages/showcase').then(m => ({ default: m.ComponentsShowcase })));
const TextureGallery = lazy(() => import('pages/textures').then(m => ({ default: m.TextureGallery })));
const WalletPage = lazy(() => import('pages/wallet').then(m => ({ default: m.WalletPage })));
const ExchangePage = lazy(() => import('pages/exchange').then(m => ({ default: m.ExchangePage })));
const SettingsPage = lazy(() => import('pages/settings').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('pages/not-found').then(m => ({ default: m.NotFoundPage })));

// Route → Component mapping
const routes: Record<Route, ComponentType> = {
  home: HomePage,
  showcase: ComponentsShowcase,
  wallet: WalletPage,
  exchange: ExchangePage,
  settings: SettingsPage,
  textures: TextureGallery,
  'not-found': NotFoundPage,
};

// ─────────────────────────────────────────────────────────────
// Animation Configs
// ─────────────────────────────────────────────────────────────

interface AnimConfig {
  from: Record<string, unknown>;
  enter: Record<string, unknown>;
  leave: Record<string, unknown>;
}

/**
 * Neighbor pages: horizontal slide with scale effect
 * Uses percentage-based movement for responsive feel
 */
function getSlideAnimation(type: TransitionType): AnimConfig {
  // Use larger distance for more visible effect
  const distance = 400; // pixels - visible slide
  const scaleOut = 0.92; // slight scale down when leaving

  if (type === 'slide-left') {
    // Going forward (left): new page slides in from right
    return {
      from: { opacity: 0, x: distance, scale: 0.95 },
      enter: { opacity: 1, x: 0, scale: 1 },
      leave: { opacity: 0, x: -distance * 0.5, scale: scaleOut },
    };
  }

  if (type === 'slide-right') {
    // Going back (right): new page slides in from left
    return {
      from: { opacity: 0, x: -distance, scale: 0.95 },
      enter: { opacity: 1, x: 0, scale: 1 },
      leave: { opacity: 0, x: distance * 0.5, scale: scaleOut },
    };
  }

  return {
    from: { opacity: 0, x: 0, scale: 1 },
    enter: { opacity: 1, x: 0, scale: 1 },
    leave: { opacity: 0, x: 0, scale: 1 },
  };
}

/**
 * Far pages: 3D tumble/flip effect
 */
function getTumbleAnimation(fromIndex: number, toIndex: number): AnimConfig {
  const goingForward = toIndex > fromIndex;

  return {
    from: {
      opacity: 0,
      scale: 0.6,
      rotateY: goingForward ? 45 : -45,
      rotateX: 15,
      z: -200,
    },
    enter: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      z: 0,
    },
    leave: {
      opacity: 0,
      scale: 0.6,
      rotateY: goingForward ? -45 : 45,
      rotateX: -15,
      z: -200,
    },
  };
}

/**
 * Get animation config based on route distance
 */
function getAnimationConfig(
  from: Route | null,
  to: Route,
  transitionType: TransitionType
): AnimConfig {
  const distance = getRouteDistance(from, to);

  // Same page or initial load
  if (distance === 0) {
    return {
      from: { opacity: 1, x: 0, scale: 1, rotateY: 0, rotateX: 0, z: 0 },
      enter: { opacity: 1, x: 0, scale: 1, rotateY: 0, rotateX: 0, z: 0 },
      leave: { opacity: 0, x: 0, scale: 1, rotateY: 0, rotateX: 0, z: 0 },
    };
  }

  // Neighbors: slide with scale
  if (distance === 1) {
    const slide = getSlideAnimation(transitionType);
    return {
      from: { ...slide.from, rotateY: 0, rotateX: 0, z: 0 },
      enter: { ...slide.enter, rotateY: 0, rotateX: 0, z: 0 },
      leave: { ...slide.leave, rotateY: 0, rotateX: 0, z: 0 },
    };
  }

  // Far pages: tumble
  const fromIndex = from ? routes[from] ? Object.keys(routes).indexOf(from) : 0 : 0;
  const toIndex = Object.keys(routes).indexOf(to);
  const tumble = getTumbleAnimation(fromIndex, toIndex);
  return {
    from: { ...tumble.from, x: 0 },
    enter: { ...tumble.enter, x: 0 },
    leave: { ...tumble.leave, x: 0 },
  };
}

// ─────────────────────────────────────────────────────────────
// Loading
// ─────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-white/50 text-xl">Loading...</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Swipe Gesture Handler
// ─────────────────────────────────────────────────────────────

function useSwipeNavigation() {
  const [dragOffset, dragApi] = useSpring(() => ({
    dragX: 0,
    dragScale: 1,
    dragRotateY: 0,
  }));

  const SWIPE_THRESHOLD = 80;

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], velocity: [vx], cancel }) => {
      const currentRoute = router.currentRoute;

      // Check if we can navigate in this direction
      const canGoLeft = !!getPrevRoute(currentRoute);
      const canGoRight = !!getNextRoute(currentRoute);

      // Restrict drag if can't go that direction
      if (mx < 0 && !canGoRight) {
        dragApi.start({ dragX: mx * 0.2, dragScale: 1, dragRotateY: 0 });
        return;
      }
      if (mx > 0 && !canGoLeft) {
        dragApi.start({ dragX: mx * 0.2, dragScale: 1, dragRotateY: 0 });
        return;
      }

      if (active) {
        // During drag: move page and add subtle rotation
        const rotateY = mx * -0.02;
        const scale = 1 - Math.abs(mx) * 0.0005;
        dragApi.start({
          dragX: mx,
          dragScale: Math.max(0.95, scale),
          dragRotateY: Math.max(-10, Math.min(10, rotateY)),
        });
      } else {
        // On release: check if should navigate
        const shouldNavigate = Math.abs(mx) > SWIPE_THRESHOLD || vx > 0.5;

        if (shouldNavigate) {
          const nextRoute = dx > 0 ? getPrevRoute(currentRoute) : getNextRoute(currentRoute);

          if (nextRoute && router.canAccessRoute(nextRoute)) {
            cancel(); // Cancel gesture
            router.navigate(nextRoute);
          }
        }

        // Reset position
        dragApi.start({ dragX: 0, dragScale: 1, dragRotateY: 0 });
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    }
  );

  return { bind, dragOffset };
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export const AppRouter = observer(function AppRouter() {
  const { currentRoute, previousRoute, transitionConfig } = router;
  const { bind, dragOffset } = useSwipeNavigation();

  const animConfig = getAnimationConfig(
    previousRoute,
    currentRoute,
    transitionConfig.type
  );

  const transitions = useTransition(currentRoute, {
    key: currentRoute,
    from: animConfig.from,
    enter: animConfig.enter,
    leave: animConfig.leave,
    config: {
      tension: 280,
      friction: 30,
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
      className="relative w-full overflow-hidden"
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
              x: isCurrentPage ? style.x.to((v: number) => v + dragOffset.dragX.get()) : style.x,
              scale: isCurrentPage ? style.scale.to((v: number) => v * dragOffset.dragScale.get()) : style.scale,
              rotateY: isCurrentPage ? style.rotateY.to((v: number) => v + dragOffset.dragRotateY.get()) : style.rotateY,
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
