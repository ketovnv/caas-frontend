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
    <nav className="flex items-center gap-4 p-4">
      <MorphingTabs
        tabs={tabs}
        activeTab={currentRoute}
        onTabChange={(route) => router.navigate(route)}
        margin={16}
        blurStdDeviation={6}
      />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle size="md" />
        <FPSMonitor />
      </div>
    </nav>
  );
})
