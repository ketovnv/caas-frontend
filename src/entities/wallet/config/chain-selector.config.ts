import type { SpringConfig } from '@react-spring/web';
import type { ChainId } from '../model/types.ts';

// ============================================================================
// Chain Selector Config - Animation states and constants
// ============================================================================

export interface ChainButtonState {
  scale: number;
  opacity: number;
  borderOpacity: number;
}

export const ACTIVE_STATE: ChainButtonState = {
  scale: 1,
  opacity: 1,
  borderOpacity: 1,
};

export const INACTIVE_STATE: ChainButtonState = {
  scale: 0.95,
  opacity: 0.6,
  borderOpacity: 0.3,
};

export const CHAIN_BUTTON_CONFIG: SpringConfig = {
  tension: 300,
  friction: 20,
};

export interface ChainButtonData {
  id: ChainId;
  symbol: string;
  name: string;
}
