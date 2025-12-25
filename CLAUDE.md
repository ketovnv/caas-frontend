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

### Tron RPC
- Helper functions in `features/auth/lib/tronRpc.ts`
- Uses Shasta testnet (`api.shasta.trongrid.io`)
- Functions: `getTronAccount`, `getTronBalance`, `signMessage`, `sendTransaction`

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

React Spring re-exports available in `shared/lib/animated.ts` with aliases: `animated`, `a`, `imp`

## Conventions

- TypeScript strict mode with `noUncheckedIndexedAccess`
- Money amounts: use `string` (never `number` for precision)
- Color system: OKLCH format for theme colors
- Russian UI text for error messages
