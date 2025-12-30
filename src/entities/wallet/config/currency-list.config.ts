import type { OklchTuple } from 'shared/lib';

// ============================================================================
// Stagger Timing
// ============================================================================

export const STAGGER_DELAY = 80; // ms between items

// ============================================================================
// Currency Colors (OKLCH) - TRX + USDT only
// ============================================================================

export const CURRENCY_COLORS: Record<string, {
  primary: OklchTuple;
  glow: OklchTuple;
}> = {
  tron: {
    primary: [0.55, 0.22, 25],
    glow: [0.6, 0.25, 25],
  },
  usdt: {
    primary: [0.6, 0.18, 165],
    glow: [0.65, 0.2, 165],
  },
  'usdt-trc20': {
    primary: [0.55, 0.12, 175],
    glow: [0.6, 0.15, 175],
  },
  native: {
    primary: [0.55, 0.22, 25], // Same as tron (TRX)
    glow: [0.6, 0.25, 25],
  },
};
