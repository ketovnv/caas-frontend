// ============================================================================
// Network Store - Network Selection & Persistence
// ============================================================================

import { makeAutoObservable, runInAction } from 'mobx';
import {
  NETWORKS,
  DEFAULT_NETWORK,
  NETWORK_IDS,
  type NetworkId,
  type NetworkConfig,
} from 'entities/wallet/config/networks.config';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'caas_network';

// ============================================================================
// NetworkStore
// ============================================================================

class NetworkStore {
  /** Currently selected network */
  selectedNetwork: NetworkId = DEFAULT_NETWORK;

  /** Is network switching in progress */
  isSwitching = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────

  /** Get current network config */
  get config(): NetworkConfig {
    return NETWORKS[this.selectedNetwork];
  }

  /** Is mainnet selected */
  get isMainnet(): boolean {
    return !this.config.isTestnet;
  }

  /** Is testnet selected */
  get isTestnet(): boolean {
    return this.config.isTestnet;
  }

  /** Get network display name */
  get displayName(): string {
    return this.config.name;
  }

  /** Get short name for badge */
  get shortName(): string {
    return this.config.shortName;
  }

  /** Get badge color class */
  get badgeColor(): string {
    return this.config.badgeColor;
  }

  /** Get explorer URL */
  get explorerUrl(): string {
    return this.config.explorerUrl;
  }

  /** Get faucet URL (testnet only) */
  get faucetUrl(): string | undefined {
    return this.config.faucetUrl;
  }

  /** Get USDT contract address for current network */
  get usdtContract(): string {
    return this.config.tokens.usdt;
  }

  /** All available networks */
  get availableNetworks(): NetworkConfig[] {
    return NETWORK_IDS.map(id => NETWORKS[id]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Switch to a different network
   * @param networkId - Network to switch to
   * @param onSwitch - Callback after switch (e.g., refresh balances)
   */
  setNetwork = async (networkId: NetworkId, onSwitch?: () => Promise<void>) => {
    if (networkId === this.selectedNetwork) return;
    if (this.isSwitching) return;

    runInAction(() => {
      this.isSwitching = true;
    });

    try {
      // Update selection
      runInAction(() => {
        this.selectedNetwork = networkId;
      });

      // Persist to storage
      this.saveToStorage();

      // Call switch callback (e.g., reinitialize RPC, fetch balances)
      if (onSwitch) {
        await onSwitch();
      }

      console.log('[NetworkStore] Switched to:', networkId);

    } finally {
      runInAction(() => {
        this.isSwitching = false;
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && NETWORK_IDS.includes(stored as NetworkId)) {
        this.selectedNetwork = stored as NetworkId;
      }
    } catch (error) {
      console.warn('[NetworkStore] Failed to load from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, this.selectedNetwork);
    } catch (error) {
      console.warn('[NetworkStore] Failed to save to storage:', error);
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const networkStore = new NetworkStore();
