import type { SpringConfig } from '@react-spring/core';
import type { OklchTuple } from 'shared/lib';

// ============================================================================
// Animation States
// ============================================================================

export interface CurrencyItemState {
  opacity: number;
  y: number;
  scale: number;
  glowOpacity: number;
  // Background gradient
  bgL: number;
  bgC: number;
  bgH: number;
}

export const ITEM_HIDDEN: CurrencyItemState = {
  opacity: 0,
  y: 30,
  scale: 0.95,
  glowOpacity: 0,
  bgL: 0.15,
  bgC: 0.01,
  bgH: 0,
};

export const ITEM_VISIBLE: CurrencyItemState = {
  opacity: 1,
  y: 0,
  scale: 1,
  glowOpacity: 0,
  bgL: 0.18,
  bgC: 0.01,
  bgH: 0,
};

export const ITEM_SELECTED: Partial<CurrencyItemState> = {
  scale: 1.02,
  glowOpacity: 1,
  bgL: 0.22,
  bgC: 0.02,
  bgH: 280,
};

export const ITEM_HOVER: Partial<CurrencyItemState> = {
  scale: 1.01,
  glowOpacity: 0.5,
  bgL: 0.2,
};

// ============================================================================
// Spring Configs
// ============================================================================

export const LIST_SPRING_CONFIG: SpringConfig = {
  tension: 280,
  friction: 24,
  mass: 1,
};

export const ITEM_SPRING_CONFIG: SpringConfig = {
  tension: 320,
  friction: 28,
  mass: 0.8,
};

export const COUNTER_SPRING_CONFIG: SpringConfig = {
  tension: 200,
  friction: 30,
  mass: 1,
};

// ============================================================================
// Currency Colors (OKLCH)
// ============================================================================

export const CURRENCY_COLORS: Record<string, {
  primary: OklchTuple;
  glow: OklchTuple;
}> = {
  tron: {
    primary: [0.55, 0.22, 25],
    glow: [0.6, 0.25, 25],
  },
  ethereum: {
    primary: [0.6, 0.15, 265],
    glow: [0.65, 0.18, 265],
  },
  usdt: {
    primary: [0.6, 0.18, 165],
    glow: [0.65, 0.2, 165],
  },
  usdc: {
    primary: [0.55, 0.2, 260],
    glow: [0.6, 0.22, 260],
  },
  native: {
    primary: [0.7, 0.12, 60],
    glow: [0.75, 0.15, 60],
  },
};

// ============================================================================
// Stagger Timing
// ============================================================================

export const STAGGER_DELAY = 60; // ms between items
export const ENTRANCE_DELAY = 100; // ms before first item
