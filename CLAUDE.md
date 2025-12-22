# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CaaS (Crypto-as-a-Service) frontend - платформа для криптовалютных операций с фокусом на gas-providing для транзакций. Поддерживает:
- On/Off-ramp операции (EUR <-> USDC, KZT <-> crypto)
- OTC обмены через liquidity providers
- Cross-border переводы (KZT <-> EUR)
- KYC/KYB верификацию клиентов
- Управление криптокошельками и фиатными счетами

## Tech Stack

- **Runtime**: Bun
- **Build**: Vite
- **Framework**: React + TypeScript
- **Architecture**: Feature-Sliced Design (FSD)

## Development Commands

```bash
bun install              # Install dependencies
bun run dev              # Development server (Vite)
bun run build            # Production build
bun run preview          # Preview production build
bun run lint             # ESLint
bun run typecheck        # TypeScript check
bun run test             # Run tests
bun run test --watch     # Watch mode
bun run test path/to/file.test.ts  # Single file
```

## Architecture (Feature-Sliced Design)

Layers import rule: `app → pages → widgets → features → entities → shared`
Modules can only import from layers **below** them.

```
src/
├── app/              # App initialization, providers, routing, global styles
├── pages/            # Full pages, compose widgets and features
├── widgets/          # Complex UI blocks (Header, Sidebar, TransactionList)
├── features/         # User interactions (SendCrypto, CreateExchange, KYCForm)
├── entities/         # Business entities with their data and UI
└── shared/           # Reusable code without business logic
```

### Layer Details

**app/** - application entry point, providers, router config
**pages/** - route components, compose widgets/features, no business logic
**widgets/** - self-contained UI blocks, combine features and entities
**features/** - user scenarios and actions (one feature = one use case)
**entities/** - business domain objects with their model, api, ui
**shared/** - no business logic, pure utilities and UI kit

### Segments (inside each slice)

```
{slice}/
├── ui/       # React components, styles
├── model/    # State, stores, business logic, types
├── api/      # API requests for this slice
├── lib/      # Utilities specific to this slice
├── config/   # Constants, feature flags
└── index.ts  # Public API (only export what's needed)
```

### Public API Rule

Every slice must have `index.ts` that exports only public interface:
```typescript
// entities/client/index.ts
export { ClientCard } from './ui/ClientCard';
export { useClient } from './model/useClient';
export type { Client } from './model/types';
```

Import only through public API:
```typescript
// ✅ Correct
import { ClientCard } from 'entities/client';

// ❌ Wrong - accessing internals
import { ClientCard } from 'entities/client/ui/ClientCard';
```

### Cross-imports between entities

Use `@x` notation for explicit dependencies:
```typescript
// entities/account/@x/client.ts
export type { Account } from '../model/types';

// entities/client/model/types.ts
import type { Account } from 'entities/account/@x/client';
```

## Domain Entities

- **Client** - клиент (individual/corporate), KYC status
- **Account** - внутренний счет (привязан к Currency)
- **Currency** - валюта (fiat: EUR, KZT / crypto: USDC, USDT)
- **Wallet** - криптокошелек клиента
- **Exchange** - операция обмена валют
- **Deposit** - пополнение счета
- **Withdrawal** - вывод средств
- **RampOrder** - on-ramp/off-ramp ордер
- **LiquidityProvider** - провайдер ликвидности

## Core Business Flows

1. **Auth Flow**: Sign In → Create client `/Customer/otc/create` → Verify `/Customer/{id}` → KYC → Home
2. **Ramp Flow**: Home → Ramp → Enter amount → QR code → Complete
3. **Exchange Flow**: Check liquidity → Create Exchange → Tatum order → Complete
4. **Withdrawal Flow**: Request → 2FA → Balance check → Sumsub KYT → Execute

## Ledger System (Blnk)

Double-entry ledger:
- **Buckets**: Available, Reserved, Settlement
- **Transactions**: inflight → commit/void

## External Integrations

- **Sumsub** - KYC/KYT verification
- **Tatum** - crypto operations
- **Blnk** - ledger/balances
- **Utila** - crypto withdrawals

## Conventions

- TypeScript strict mode
- Денежные суммы: `string` или `Decimal` (не `number`)
- API types in `shared/api/`
- Path aliases: `@/` → `src/`
