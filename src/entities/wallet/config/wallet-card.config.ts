import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// WalletCard Animation Config
// ============================================================================

/**
 * Flip animation config
 * - tension: сила пружини (більше = швидше)
 * - friction: тертя (більше = менше коливань)
 * - mass: маса (більше = повільніше, інертніше)
 */
export const CARD_FLIP_CONFIG: SpringConfig = {
  tension: 350,
  friction: 100,
  mass: 15,
};

/** Scale when card is flipped */
export const CARD_FLIPPED_SCALE = 1.02;

/** Scale when card is not flipped */
export const CARD_DEFAULT_SCALE = 1;
