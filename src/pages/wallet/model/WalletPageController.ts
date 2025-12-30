import { Controller, type SpringConfig } from '@react-spring/web';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  DEFAULT_HEIGHT,
  HEIGHT_SPRING_CONFIG,
  TAB_TITLES,
  DEFAULT_TAB,
  type WalletTabId,
  type HeightState,
} from '../config/wallet-page.config';
import { walletStore } from 'features/wallet';

// ============================================================================
// Wallet Page Controller - Tab state + height animation
// ============================================================================

export class WalletPageController {
  // MobX observable state
  activeTab: WalletTabId = DEFAULT_TAB;
  contentHeight: number = DEFAULT_HEIGHT;

  // ResizeObserver reference
  private resizeObserver: ResizeObserver | null = null;

  // Animation controller
  private heightCtrl: Controller<HeightState>;

  constructor(config?: SpringConfig) {
    this.heightCtrl = new Controller({
      height: DEFAULT_HEIGHT,
      config: config ?? HEIGHT_SPRING_CONFIG,
    });

    // MobX: exclude non-observable fields
    makeAutoObservable<this, 'heightCtrl' | 'resizeObserver'>(this, {
      heightCtrl: false,
      resizeObserver: false,
    });
  }

  // ─────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────

  get activeTitle(): string {
    // Use currentSymbol which handles both native and tokens
    const symbol = walletStore.currentSymbol;
    if (this.activeTab === 'send') {
      return `Send ${symbol}`;
    }
    return TAB_TITLES[this.activeTab] ?? 'Wallet';
  }

  // ─────────────────────────────────────────────────────────
  // Getters for animated values
  // ─────────────────────────────────────────────────────────

  get heightSpring() {
    return this.heightCtrl.springs.height;
  }

  get heightStyle() {
    return {
      height: this.heightCtrl.springs.height,
      overflow: 'hidden' as const,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────

  setActiveTab = (tab: WalletTabId) => {
    this.activeTab = tab;
  };

  setContentHeight = (height: number) => {
    if (height > 0 && height !== this.contentHeight) {
      this.contentHeight = height;
      this.heightCtrl.start({
        height,
        config: HEIGHT_SPRING_CONFIG,
      });
    }
  };

  // ─────────────────────────────────────────────────────────
  // ResizeObserver management
  // ─────────────────────────────────────────────────────────

  observeElement(element: HTMLElement | null) {
    // Cleanup previous observer
    this.disconnectObserver();

    if (!element) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        runInAction(() => {
          this.setContentHeight(height);
        });
      }
    });

    this.resizeObserver.observe(element);
  }

  disconnectObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────

  fetchBalances = () => {
    walletStore.fetchBalances();
  };

  // ─────────────────────────────────────────────────────────
  // Transaction handling
  // ─────────────────────────────────────────────────────────

  handleSend = async (amount: string, address: string) => {
    try {
      const txHash = await walletStore.sendTransaction(address, amount);
      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────

  dispose() {
    this.disconnectObserver();
    this.heightCtrl.stop();
  }
}

// ============================================================================
// Singleton instance for the wallet page
// ============================================================================

export const walletPageController = new WalletPageController();
