import { Suspense, lazy, type ComponentType } from 'react';
import { observer } from 'mobx-react-lite';
import { router, type Route } from 'app/router';

// Lazy loaded pages
const HomePage = lazy(() => import('pages/home').then(m => ({ default: m.HomePage })));
const ComponentsShowcase = lazy(() => import('pages/showcase').then(m => ({ default: m.ComponentsShowcase })));
const TextureGallery = lazy(() => import('pages/textures').then(m => ({ default: m.TextureGallery })));

// Placeholder pages
const WalletPage = lazy(() => Promise.resolve({ default: () => <div className="p-8 text-white">Wallet (TODO)</div> }));
const ExchangePage = lazy(() => Promise.resolve({ default: () => <div className="p-8 text-white">Exchange (TODO)</div> }));
const SettingsPage = lazy(() => Promise.resolve({ default: () => <div className="p-8 text-white">Settings (TODO)</div> }));
const NotFoundPage = lazy(() => Promise.resolve({ default: () => <div className="p-8 text-white">404 - Not Found</div> }));

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

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}

export const AppRouter = observer(function AppRouter() {
  const { currentRoute, isTransitioning, transitionConfig } = router;

  const PageComponent = routes[currentRoute];

  return (
    <div
      style={{
        opacity: isTransitioning ? 0.1 : 1,
        transition: `opacity ${transitionConfig.duration}ms ease-out`,
      }}
    >
      <Suspense fallback={<PageLoader />}>
        <PageComponent />
      </Suspense>
    </div>
  );
});
