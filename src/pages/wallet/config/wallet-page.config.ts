import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Wallet Page Config - Tab states, constants, and types
// ============================================================================

export type WalletTabId = 'send' | 'notes' | 'stats';

export interface HeightState {
  height: number;
}

export const DEFAULT_HEIGHT = 350;

export const HEIGHT_SPRING_CONFIG: SpringConfig = {
  tension: 170,
  friction: 26,
  clamp: true,
};

export const TAB_TITLES: Record<WalletTabId, string> = {
  send: 'Send',
  notes: 'My Notes',
  stats: 'Overview',
};

export const TAB_LABELS: Record<WalletTabId, string> = {
  send: 'Send',
  notes: 'Notes',
  stats: 'Stats',
};

export const DEFAULT_TAB: WalletTabId = 'send';
