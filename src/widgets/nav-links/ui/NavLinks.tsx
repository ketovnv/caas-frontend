import { observer } from 'mobx-react-lite';
import { router, type Route } from 'app/router';
import {FPSMonitor} from "shared/ui";


interface NavLink {
  route: Route;
  label: string;
}


const links: NavLink[] = [
  { route: 'home', label: 'Home' },
  { route: 'showcase', label: 'Showcase' },
  { route: 'wallet', label: 'Wallet' },
  { route: 'exchange', label: 'Exchange' },
  {route: 'textures', label: 'Textures'},
  { route: 'settings', label: 'Settings' },
];

export const NavLinks = observer(function NavLinks() {
  const { currentRoute } = router;

  return (
    <nav className="flex gap-4 p-4">
      {links.map(({ route, label }) => (
        <button
          key={route}
          onClick={() => router.navigate(route)}
          data-route={route}
          className={`
            px-4 py-2 rounded-lg transition-colors
            ${currentRoute === route
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          {label}
        </button>
      ))}
      <FPSMonitor/>
    </nav>
  );
})
