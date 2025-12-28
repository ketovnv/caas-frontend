import { observer } from 'mobx-react-lite';
import { router, type Route } from 'app/router';
import { FPSMonitor, ThemeToggle, MorphingTabs, type MorphingTab } from 'shared/ui';

const tabs: MorphingTab<Route>[] = [
  { id: 'home', label: 'Home' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'exchange', label: 'Exchange' },
  { id: 'textures', label: 'Textures' },
  { id: 'settings', label: 'Settings' },
];

export const NavLinks = observer(function NavLinks() {
  const { currentRoute } = router;

  return (
    <nav className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4">
      {/* Scrollable tabs container */}
      <div className="flex-1 overflow-x-auto scrollbar-hide -mx-2 px-2">
        <MorphingTabs
          tabs={tabs}
          activeTab={currentRoute}
          onTabChange={(route) => router.navigate(route)}
          margin={16}
          blurStdDeviation={6}
          className="min-w-max"
          tabClassName="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
        />
      </div>
      {/* Fixed right controls */}
      <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
        <ThemeToggle size="sm" />
        <FPSMonitor />
      </div>
    </nav>
  );
})
