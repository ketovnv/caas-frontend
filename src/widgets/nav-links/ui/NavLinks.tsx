import { observer } from 'mobx-react-lite';
import { router, type Route } from 'app/router';
import { FPSMonitor, ThemeToggle, MorphingTabs, type MorphingTab } from 'shared/ui';

const tabs: MorphingTab<Route>[] = [
  { id: 'home', label: 'Home' },
  // { id: 'showcase', label: 'Showcase' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'exchange', label: 'Exchange' },
  // { id: 'textures', label: 'Textures' },
  { id: 'settings', label: 'Settings' },
];

export const NavLinks = observer(function NavLinks() {
  const { currentRoute } = router;

  return (
    <nav className="relative flex items-center p-2 sm:p-4">
      {/* Left spacer - matches right controls for symmetry */}
      <div className="w-20 sm:w-24 flex-shrink-0" />

      {/* Center: tabs with padding to prevent clipping */}
      <div className="flex-1 flex justify-center px-4">
        <MorphingTabs
          tabs={tabs}
          activeTab={currentRoute}
          onTabChange={(route) => router.navigate(route)}
          margin={16}
          blurStdDeviation={6}
          tabClassName="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
        />
      </div>

      {/* Right controls - fixed width */}
      <div className="w-20 sm:w-24 flex-shrink-0 flex justify-end items-center gap-1 sm:gap-2">
        <ThemeToggle size="sm" />
        <FPSMonitor />
      </div>
    </nav>
  );
})
