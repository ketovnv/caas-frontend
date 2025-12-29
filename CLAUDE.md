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
├── pages/            # Route components (home, showcase)
├── widgets/          # Complex UI blocks (empty - use .gitkeep)
├── features/         # User interactions (auth, error)
├── entities/         # Business entities (empty - use .gitkeep)
└── shared/           # Reusable UI kit and utilities
    ├── ui/animated/  # React Spring animation components
    ├── lib/          # cn(), gradient utilities, React Spring re-exports
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

## Key Integrations

### Web3Auth
- Config: `features/auth/config/web3auth.ts`
- Uses Sapphire Devnet
- Requires `VITE_WEB3AUTH_CLIENT_ID` env variable

### Tron Integration
- RPC helpers in `features/auth/lib/tronRpc.ts` (Shasta testnet)
- TronLink wallet adapter in `shared/lib/tronlink/`

### Shared Libraries
- `shared/lib/haptics/` - Capacitor haptic feedback wrapper
- `shared/lib/web3auth/` - Web3Auth adapters and config

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


# PROJECT_PLAN Integration
# Added by Claude Config Manager Extension

When working on this project, always refer to and maintain the project plan located at `PROJECT_PLAN.md` in the workspace root.

**Instructions for Claude Code:**
1. **Read the project plan first** - Always check `PROJECT_PLAN.md` when starting work to understand the project context, architecture, and current priorities.
2. **Update the project plan regularly** - When making significant changes, discoveries, or completing major features, update the relevant sections in PROJECT_PLAN.md to keep it current.
3. **Use it for context** - Reference the project plan when making architectural decisions, understanding dependencies, or explaining code to ensure consistency with project goals.

**Plan Mode Integration:**
- **When entering plan mode**: Read the current PROJECT_PLAN.md to understand existing context and priorities
- **During plan mode**: Build upon and refine the existing project plan structure
- **When exiting plan mode**: ALWAYS update PROJECT_PLAN.md with your new plan details, replacing or enhancing the relevant sections (Architecture, TODO, Development Workflow, etc.)
- **Plan persistence**: The PROJECT_PLAN.md serves as the permanent repository for all planning work - plan mode should treat it as the single source of truth

This ensures better code quality and maintains project knowledge continuity across different Claude Code sessions and plan mode iterations.
