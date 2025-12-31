import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// NetworkBadge Animation Config
// ============================================================================

/** Dropdown animation states */
export const DROPDOWN_HIDDEN = { opacity: 0, y: -8 };
export const DROPDOWN_VISIBLE = { opacity: 1, y: 0 };

/** Pulse animation states */
export const PULSE_NORMAL = { scale: 1 };
export const PULSE_SWITCHING = { scale: 0.95 };

/** Spring configs */
export const DROPDOWN_CONFIG: SpringConfig = { tension: 300, friction: 20 };
export const PULSE_CONFIG: SpringConfig = { tension: 300, friction: 20 };
