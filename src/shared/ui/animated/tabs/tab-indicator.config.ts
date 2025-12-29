import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Configs
// ============================================================================

/** Жёсткая пружина - быстрый отклик для индикатора табов */
export const stiffSpring: SpringConfig = {
  tension: 400,
  friction: 30,
};

// ============================================================================
// Tab Indicator State
// ============================================================================

export interface IndicatorState {
  x: number;
  width: number;
}

export const INDICATOR_INITIAL: IndicatorState = {
  x: 0,
  width: 0,
};

// ============================================================================
// Types
// ============================================================================

export interface TabItem {
  id: string;
  disabled?: boolean;
}
