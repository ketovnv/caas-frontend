import type { SpringConfig } from '@react-spring/web';
import {
  INPUT_FOCUSED,
  INPUT_BLURRED,
  type AnimatedInputState,
} from 'shared/ui/animated/input/animated-input.config';

// ============================================================================
// Transaction Input Config
// ============================================================================

/** Пружина для транзакций - более резкая */
export const transactionSpring: SpringConfig = {
  tension: 300,
  friction: 28,
};

// ============================================================================
// Input Presets
// (spotlight/particle colors default to themeStore.accentColor in controller)
// ============================================================================

/** Настройки для инпута суммы */
export const AMOUNT_INPUT_PROPS = {
  placeholder: '0.00 TRX',
  spotlightRadius: 80,
  showSubmitButton: false,
  step: 1,
  min: 0,
  quickAmounts: [10, 100],
} as const;

/** Настройки для инпута адреса */
export const ADDRESS_INPUT_PROPS = {
  placeholders: [
    'Адрес получателя...',
    'T... или имя...',
  ] as string[],
  spotlightRadius: 120,
  showSubmitButton: false,
};

// ============================================================================
// Custom States (более яркое свечение для транзакций)
// ============================================================================

export const TRANSACTION_FOCUSED: Partial<AnimatedInputState> = {
  ...INPUT_FOCUSED,
  shadowSpread: 12,
};

export const TRANSACTION_BLURRED: Partial<AnimatedInputState> = {
  ...INPUT_BLURRED,
};
