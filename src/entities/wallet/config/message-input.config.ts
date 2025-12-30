import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Message Input Config
// ============================================================================

/** Мягкая пружина для чата */
export const messageSpring: SpringConfig = {
  tension: 200,
  friction: 24,
};

// ============================================================================
// Input Preset
// (spotlight/particle colors default to themeStore.accentColor in controller)
// ============================================================================

export const MESSAGE_INPUT_PROPS = {
  placeholders: [
    'Добавить заметку...',
    'Комментарий к транзакции...',
    'Memo...',
  ] as string[],
  spotlightRadius: 100,
  showSubmitButton: true,
};
