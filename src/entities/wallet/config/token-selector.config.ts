import type { SpringConfig } from '@react-spring/web';
import type { TokenId } from '../model/types.ts';

// ============================================================================
// Token Selector Config - Animation states and constants
// ============================================================================

export interface TokenButtonState {
  scale: number;
  opacity: number;
  y: number;
}

export const ACTIVE_STATE: TokenButtonState = {
  scale: 1,
  opacity: 1,
  y: 0,
};

export const INACTIVE_STATE: TokenButtonState = {
  scale: 0.95,
  opacity: 0.5,
  y: 0,
};

export const TOKEN_BUTTON_CONFIG: SpringConfig = {
  tension: 150,
  friction:100,
  mass: 100
};

/** Token display info */
export const TOKEN_DISPLAY: Record<TokenId, { color: string; bgClass: string }> = {
  native: {
    color: 'text-red-400',
    bgClass: 'bg-red-500/20',
  },
  usdt: {
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/20',
  },
};
