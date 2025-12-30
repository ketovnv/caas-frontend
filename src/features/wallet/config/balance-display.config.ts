import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Balance Display Config - Animation states and constants
// ============================================================================

export interface BalanceDisplayState {
  opacity: number;
  y: number;
}

export interface TrailItemState {
  opacity: number;
  y: number;
}

export const HIDDEN_STATE: BalanceDisplayState = {
  opacity: 0,
  y: 20,
};

export const VISIBLE_STATE: BalanceDisplayState = {
  opacity: 1,
  y: 0,
};

export const TRAIL_HIDDEN: TrailItemState = {
  opacity: 0,
  y: 10,
};

export const TRAIL_VISIBLE: TrailItemState = {
  opacity: 1,
  y: 0,
};

export const TRAIL_CONFIG: SpringConfig = {
  tension: 300,
  friction: 20,
};

export const COPY_FEEDBACK_DURATION = 2000;
