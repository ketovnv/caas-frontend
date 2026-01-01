 # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CaaS (Crypto-as-a-Service) frontend - a platform for cryptocurrency operations. Currently implements:
- Web3Auth social login (Google, Facebook, Twitter, Discord, Email, SMS)
- Tron wallet with TRX and USDT (TRC-20) support
- Animated UI component library built on React Spring
- Minimal two-page UI: Home (with WalletCard) and Settings

## Tech Stack

- **Runtime**: Bun
- **Build**: Vite (dev server on http://127.0.0.1:3000)
- **Framework**: React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Animation**: React Spring (@react-spring/web) + Motion
- **State**: MobX (stores + makeAutoObservable)
- **Auth**: Web3Auth No-Modal SDK
- **Blockchain**: TronWeb (Nile testnet default, Mainnet available)
- **Mobile**: Capacitor (Android target)

## Development Commands

```bash
bun install              # Install dependencies
bun run dev              # Development server (http://127.0.0.1:3000)
bun run build            # Production build (runs tsc first)
bun run preview          # Preview production build
bun run lint             # ESLint
bun run typecheck        # TypeScript check (tsc --noEmit)
bun run test             # Run tests (vitest)
bun run test --watch     # Watch mode
bun run test path/to/file.test.ts  # Single file

# Capacitor (mobile)
bunx cap sync            # Sync web assets to native projects
bunx cap run android     # Run on Android device/emulator
bunx cap open android    # Open Android project in Android Studio
```

## Architecture (Feature-Sliced Design)

Strict layer imports: `app → pages → widgets → features → entities → shared`

```
src/
├── app/              # App entry, providers (Web3Auth, Router, ErrorBoundary)
├── pages/            # Route components (home, settings, not-found)
├── widgets/          # Complex UI blocks (global-header, nav-links)
├── features/         # User interactions (auth, error)
├── entities/         # Business entities (wallet with WalletCard)
└── shared/           # Reusable UI kit and utilities
    ├── ui/animated/  # React Spring animation components
    ├── lib/          # cn(), gradient utilities, React Spring re-exports
    ├── model/        # Core stores (ThemeStore, CoreStore)
    └── config/       # Theme configs (OKLCH color system)
```

### Path Aliases

Configured in both vite.config.ts and tsconfig.json:
- `@/` → `src/`
- `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/` → `src/{layer}/`

### Public API Pattern

Each slice exports through `index.ts`:
```typescript
// features/auth/index.ts
export { LoginButton } from './ui/LoginButton';
export { web3AuthContextConfig } from './config/web3auth';
```

Import only from public API, never internal paths.

## State Management (MobX)

Two core stores power the app:

### ThemeStore (`shared/model/theme.ts`)
Central hub for animated theming. Uses Spring classes for smooth OKLCH color transitions:
```typescript
themeStore.toggle();                    // Switch light/dark
themeStore.colorScheme                  // 'light' | 'dark'
themeStore.backgroundGradient.value     // Animated CSS gradient string
themeStore.color.value                  // Animated OKLCH interpolation
```

### CoreStore (`shared/model/core.ts`)
Animation loop synchronization and FPS tracking:
```typescript
core.scheduleWrite(() => {...});        // Batch DOM writes
core.scheduleRead(() => {...});         // Batch DOM reads
core.onFrame(callback);                 // Subscribe to animation frames
core.createThrottledUpdater(handler);   // Throttle to animation frames
```

### NetworkStore (`shared/model/network.store.ts`)
Network selection with persistence (Mainnet/Nile):
```typescript
networkStore.selectedNetwork            // 'mainnet' | 'nile'
networkStore.config                     // Full NetworkConfig
networkStore.usdtContract               // Dynamic USDT address per network
networkStore.setNetwork('mainnet')      // Switch networks
```

### SettingsStore (`shared/model/settings.store.ts`)
UI settings with localStorage persistence:
```typescript
settingsStore.showNetworkBadge          // Toggle network badge in header
settingsStore.showFpsMonitor            // Toggle FPS monitor overlay
```

## Environment Variables

```bash
VITE_WEB3AUTH_CLIENT_ID=...  # Required for Web3Auth (Sapphire Devnet)
```

## Key Integrations

### Web3Auth
- Config: `features/auth/config/` and `shared/lib/web3auth/`
- Uses Sapphire Devnet

### Wallet Connections (Reown AppKit)
- `shared/lib/reown/` - Reown AppKit integration for WalletConnect
- Supports MetaMask (`shared/lib/metamask/`) and TronLink (`shared/lib/tronlink/`)

### Tron Wallet (`entities/wallet/`)
- `model/wallet.store.ts` - MobX store for balances, tokens, transactions
- `model/types.ts` - Types: `ChainId = 'tron'`, `TokenId = 'native' | 'usdt'`
- `ui/WalletCard.tsx` - Flippable card showing TRX (front) / USDT (back)
- `ui/TransactionForm.tsx` - Send transaction form
- `config/tokens.ts` - TRC-20 token config (USDT address from networkStore)
- `config/networks.config.ts` - Network definitions (Mainnet, Nile testnet)

### WalletCardController (`entities/wallet/model/WalletCardController.ts`)
Encapsulates flip animation and interaction logic:
- Spring-based 3D flip with scale effect (`wallet-card.config.ts`)
- Desktop: hover to preview, click to lock
- Mobile: tap to toggle
- Syncs with `walletStore.selectedToken` via MobX reaction

### TransactionFormStore (`entities/wallet/model/TransactionFormStore.ts`)
Form state management with AnimatedInputController integration:
- Amount/address validation with error messages
- Quick amount buttons (25%, 50%, 75%, MAX)
- Transaction submission with loading/error/success states

### Tron Integration
- TronLink wallet adapter in `shared/lib/tronlink/`
- Network-aware: uses `networkStore` for dynamic RPC endpoints

### RPC Provider Manager (`shared/lib/tron/rpc-provider.ts`)
Multi-provider system with rate limiting, health checks, and automatic fallback:
```typescript
rpcProviderManager.initialize(networkStore.config.rpcProviders);  // From network config
rpcProviderManager.executeRequest((tronWeb) => ...);              // Auto rate-limit & fallback
rpcProviderManager.stats                                          // Health & request stats
```
- Rate limiting per provider (e.g., TronGrid: 15 req/s)
- Automatic fallback to next healthy provider on errors
- Health checks every 30 seconds

### Tron Resources (`shared/lib/tron/`)
- `TronResourceService` - Calculates energy/bandwidth costs for transactions
- `types.ts` - `TronConstants`, `WalletResources`, `TransactionCostEstimate` types
- Cost estimation for USDT transfers: ~65,000 energy (new recipient), ~29,000 (existing)
- Sun/TRX conversion helpers: `sunToTrx()`, `trxToSun()`

### ResourceStore (`entities/wallet/model/resource.store.ts`)
Manages wallet energy/bandwidth state and transaction cost estimation:
```typescript
resourceStore.fetchResources(address);     // Get energy & bandwidth
resourceStore.estimateCost(sender, recipient, amount, trxBalance);
resourceStore.formattedCost                // "Free" or "~0.5 TRX"
```

### Remote Config (`shared/lib/remote-config/`)
Fetches chain constants (energy prices, fees) from server with caching:
```typescript
remoteConfigStore.tron           // TRON network constants
initRemoteConfig(endpoint)       // Initialize on app start
```
- 5-minute cache TTL with localStorage persistence
- Falls back to `DEFAULT_TRON_CONSTANTS` when offline

### Capacitor (Mobile)
- `shared/lib/haptics/` - Haptic feedback wrapper
- Android target configured in `capacitor.config.ts`

## Animated UI Components

Located in `shared/ui/animated/`:
- **Card** - Animated card with gradient effects
- **FlipCard** - 3D flip animation
- **AnimatedText** - Gradient text with animation
- **ShimmerButton, MagneticButton, RippleButton** - Interactive buttons
- **AnimatedInput, SpotlightInput, VanishInput** - Form inputs
- **AnimatedList, AnimatedTabs, AnimatedCounter** - List/navigation
- **Skeleton** - Loading states
- **AsphaltBackground** - Animated background effect

React Spring re-exports and `createControllerAPI()` helper available in `shared/lib/animated.ts`

## Spring Classes (`shared/lib/`)

### Color Springs (`gradient.ts`)
Core building blocks for animated OKLCH colors:
- `ColorSpring` — single animated OKLCH color
- `GradientSpring` — 4-color gradient (radial/linear/conic)
- `ColorArraySpring` — array of 4 independent animated colors
- `MultiStopGradientSpring` — gradient with arbitrary number of colors (rainbow)
- `DynamicColorArraySpring` — resizable array of animated colors

### Icon Spring (`icon-spring.ts`)
Animated SVG icon system with gesture support:
- `IconSpring` — base class for animated icons with spring transforms
- Supports press/hover states with configurable spring configs

## Conventions

- TypeScript strict mode with `noUncheckedIndexedAccess`
- Money amounts: use `string` (never `number` for precision)
- Color system: OKLCH format for theme colors
- Russian UI text for error messages

## Animation Architecture (Imperative Controllers)

**Core principle:** Class-based controllers instead of multiple React Spring hooks.

### Controller Pattern

```typescript
// ❌ Multiple hooks, hard to read
const [spring1, api1] = useSpring(() => ({...}));
const [spring2, api2] = useSpring(() => ({...}));

// ✅ Single controller with clean API
class ToggleController {
  private ctrl: Controller<State>;
  get thumbTransform() { return this.ctrl.springs.x.to(...); }
  animateTo(isDark: boolean) { this.ctrl.start({...}); }
}
```

### Config + Controller Pattern

Animation states in `*.config.ts`, logic in `*Controller.ts`:
```typescript
// balance-display.config.ts
export const HIDDEN_STATE = { opacity: 0, y: 20 };
export const VISIBLE_STATE = { opacity: 1, y: 0 };

// BalanceDisplayController.ts
export class BalanceDisplayController {
  show() {...}
  hide() {...}
  dispose() {...}
}
```

### Controller Examples

- `ColorSpring`, `GradientSpring` — OKLCH color animations (`shared/lib/gradient.ts`)
- `IconSpring` — SVG icons with hover/press states (`shared/lib/icon-spring.ts`)
- `WalletCardController` — card flip animation (`entities/wallet/`)
- `AnimatedInputController` — input field animations

### Principles

1. States in constants (`HIDDEN_STATE`, `VISIBLE_STATE` in `*.config.ts`)
2. Getters for animated values (`get mainStyle()`)
3. Methods for transitions (`show()`, `hide()`, `reset()`)
4. Required `dispose()` method for cleanup
5. MobX: use `makeAutoObservable` with controller exclusions

## Routing (`app/router/`)

Minimal two-page routing with swipe-based navigation:
- `NAVIGATION_ORDER`: home → settings
- `getTransitionType()` returns `slide-left`, `slide-right`, or `scale` based on distance
- Settings accessed via gear icon in header (no navbar)

## Testing

Tests use Vitest. Place test files next to source files with `.test.ts` suffix:
```
src/shared/lib/gradient.test.ts
src/features/auth/model/auth.store.test.ts
```

## Reference Examples (gitignored)

The `examples/` folder contains reference materials (not part of build):
- **inspira-ui/** - Inspira UI components for reference
- **web3auth/** - Web3Auth integration examples
- **react-spring/** - React Spring source for studying API
