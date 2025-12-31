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

/** Controller options for note/message input */
export const MESSAGE_INPUT_PROPS = {
  placeholders: [
    'Добавить заметку...',
    'Комментарий к транзакции...',
    'Memo...',
  ],
  spotlightRadius: 100,
};
