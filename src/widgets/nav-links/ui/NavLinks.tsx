import { observer } from 'mobx-react-lite';
import { router, type Route } from 'app/router';
import { core } from 'shared/model/core';

interface NavLink {
  route: Route;
  label: string;
}

function FPSMonitor() {

  return (
      <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.8)",
            color: "#3388FF",
            padding: "10px",
            fontFamily: "monospace",
          }}
      >
        <div>Monitor: {core.fps} FPS</div>
        <div style={{ color: core.fps > 100 ? "#1FB" : "#F54" }}>
          {core.fps < 100 ? "⚠️ React lagging" : "✅ Smooth"}
        </div>
      </div>
  );
}

const links: NavLink[] = [
  { route: 'home', label: 'Home' },
  { route: 'showcase', label: 'Showcase' },
  { route: 'wallet', label: 'Wallet' },
  { route: 'exchange', label: 'Exchange' },
  // {route: 'textures', label: 'Textures'},
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
