import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { makeAutoObservable } from 'mobx';

// ============================================================================
// Types
// ============================================================================

type HapticType =
  | 'tap'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

type Web3HapticType =
  | 'connectStart'
  | 'connectSuccess'
  | 'connectError'
  | 'disconnect'
  | 'providerSelect'
  | 'providerHover'
  | 'invalidInput'
  | 'modalOpen'
  | 'modalClose';

// ============================================================================
// Haptics Store
// ============================================================================

class HapticsStore {
  enabled = true;
  private isNative = Capacitor.isNativePlatform();

  constructor() {
    makeAutoObservable(this);
  }

  // ─────────────────────────────────────────────────────────
  // Basic Haptics
  // ─────────────────────────────────────────────────────────

  async play(type: HapticType): Promise<void> {
    if (!this.enabled || !this.isNative) return;

    try {
      switch (type) {
        case 'tap':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionEnd();
          break;
      }
    } catch (error) {
      console.warn('[Haptics] Failed:', error);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Web3 Auth Haptics
  // ─────────────────────────────────────────────────────────

  async playWeb3(type: Web3HapticType): Promise<void> {
    if (!this.enabled || !this.isNative) return;

    try {
      switch (type) {
        case 'connectStart':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;

        case 'connectSuccess':
          // Double tap for success
          await Haptics.notification({ type: NotificationType.Success });
          setTimeout(() => {
            Haptics.impact({ style: ImpactStyle.Light });
          }, 100);
          break;

        case 'connectError':
          await Haptics.notification({ type: NotificationType.Error });
          break;

        case 'disconnect':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;

        case 'providerSelect':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;

        case 'providerHover':
          await Haptics.selectionChanged();
          break;

        case 'invalidInput':
          await Haptics.notification({ type: NotificationType.Warning });
          break;

        case 'modalOpen':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;

        case 'modalClose':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
      }
    } catch (error) {
      console.warn('[Haptics] Web3 haptic failed:', error);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Settings
  // ─────────────────────────────────────────────────────────

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  toggle(): void {
    this.enabled = !this.enabled;
  }
}

// Export singleton
export const hapticsStore = new HapticsStore();
