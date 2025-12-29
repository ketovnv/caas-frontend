 CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CaaS (Crypto-as-a-Service) frontend - a platform for cryptocurrency operations. Currently implements:
- Web3Auth social login (Google, Facebook, Twitter, Discord, Email, SMS)
- Tron blockchain integration via TronWeb
- Animated UI component library built on React Spring

## Tech Stack

- **Runtime**: Bun
- **Build**: Vite (dev server on http://127.0.0.1:3000)
- **Framework**: React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Animation**: React Spring (@react-spring/web) + Motion
- **Auth**: Web3Auth Modal
- **Blockchain**: TronWeb (Shasta testnet)
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
```

## Architecture (Feature-Sliced Design)

Strict layer imports: `app → pages → widgets → features → entities → shared`

```
src/
├── app/              # App entry, providers (Web3Auth, Router, ErrorBoundary)
├── pages/            # Route components (home, showcase, wallet, exchange, settings)
├── widgets/          # Complex UI blocks (global-header, nav-links)
├── features/         # User interactions (auth, error, wallet)
├── entities/         # Business entities (empty - use .gitkeep)
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

## Key Integrations

### Web3Auth
- Config: `features/auth/config/` and `shared/lib/web3auth/`
- Uses Sapphire Devnet
- Requires `VITE_WEB3AUTH_CLIENT_ID` env variable

### Wallet Connections (Reown AppKit)
- `shared/lib/reown/` - Reown AppKit integration for WalletConnect
- Supports MetaMask (`shared/lib/metamask/`) and TronLink (`shared/lib/tronlink/`)

### Tron Integration
- RPC helpers in `features/auth/lib/tronRpc.ts` (Shasta testnet)
- TronLink wallet adapter in `shared/lib/tronlink/`

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

## Color Spring Classes (`shared/lib/gradient.ts`)

Core building blocks for animated OKLCH colors:
- `ColorSpring` — single animated OKLCH color
- `GradientSpring` — 4-color gradient (radial/linear/conic)
- `ColorArraySpring` — array of 4 independent animated colors
- `MultiStopGradientSpring` — gradient with arbitrary number of colors (rainbow)
- `DynamicColorArraySpring` — resizable array of animated colors

## Conventions

- TypeScript strict mode with `noUncheckedIndexedAccess`
- Money amounts: use `string` (never `number` for precision)
- Color system: OKLCH format for theme colors
- Russian UI text for error messages

## Animation Architecture (Imperative Controllers)

**Главный принцип:** Вместо армии React хуков — элегантные классы-контроллеры.

### Паттерн Controller

```typescript
// ❌ ПЛОХО: Много хуков, сложно читать
const [spring1, api1] = useSpring(() => ({...}));
const [spring2, api2] = useSpring(() => ({...}));
const [spring3, api3] = useSpring(() => ({...}));
// ... и так 7 раз

// ✅ ХОРОШО: Один контроллер с чистым API
class ToggleController {
  private ctrl: Controller<State>;

  get thumbTransform() { return this.ctrl.springs.x.to(...); }
  get background() { return this.ctrl.springs.bg; }

  animateTo(isDark: boolean) { this.ctrl.start({...}); }
}

// Использование в компоненте:
const ctrl = new ToggleController(translate);
<animated.div style={{ transform: ctrl.thumbTransform }} />
```

### Примеры контроллеров

- `ColorSpring` — один OKLCH цвет с анимацией
- `GradientSpring` — 4-цветный градиент (radial/linear/conic)
- `DynamicColorArraySpring` — массив произвольного числа цветов
- `ToggleController` — все анимации переключателя темы

### Принципы

1. **Состояния в константах** — `LIGHT_STATE`, `DARK_STATE` вне компонента
2. **Геттеры для значений** — `get thumbTransform()`, `get sunStyle()`
3. **Методы для анимаций** — `toLight()`, `toDark()`, `animateTo()`
4. **Один Controller** — вместо множества `useSpring`
5. **themeStore.springConfig** — единый конфиг для синхронизации

## Reference Examples (gitignored)

Папка `examples/` содержит справочные материалы (не входит в сборку):
- **inspira-ui/** - компоненты Inspira UI для референса
- **web3auth/** - примеры интеграции Web3Auth
- **react-spring/** - исходники React Spring для изучения API
