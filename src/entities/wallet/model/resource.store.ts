// ============================================================================
// Resource Store - Energy & Bandwidth Management
// ============================================================================

import { makeAutoObservable, runInAction } from 'mobx';
import {
  tronResourceService,
  type WalletResources,
  type TransactionCostEstimate,
} from 'shared/lib/tron';
import { remoteConfigStore } from 'shared/lib/remote-config';
import { getTokenAddress } from '../config/tokens';

// ============================================================================
// ResourceStore
// ============================================================================

class ResourceStore {
  // Current wallet resources
  resources: WalletResources | null = null;
  isLoadingResources = false;
  resourcesError: string | null = null;

  // Current transaction cost estimate
  costEstimate: TransactionCostEstimate | null = null;
  isEstimating = false;
  estimateError: string | null = null;

  // Last addresses used (for caching/debouncing)
  private _lastWalletAddress: string | null = null;
  private _lastRecipientAddress: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────

  /** Available energy */
  get availableEnergy(): number {
    return this.resources?.totalEnergy || 0;
  }

  /** Available bandwidth */
  get availableBandwidth(): number {
    return this.resources?.totalBandwidth || 0;
  }

  /** Free bandwidth remaining */
  get freeBandwidthRemaining(): number {
    if (!this.resources) return 5000; // Default
    return this.resources.freeBandwidth - this.resources.freeBandwidthUsed;
  }

  /** Has any staked resources */
  get hasStakedResources(): boolean {
    if (!this.resources) return false;
    return this.resources.stakedBandwidth > 0 || this.resources.energy > 0;
  }

  /** Transaction can be sent without TRX burn */
  get canSendFree(): boolean {
    return this.costEstimate?.hasEnoughResources ?? false;
  }

  /** Total TRX cost for current transaction */
  get totalCostTrx(): number {
    return this.costEstimate?.totalCostTrx ?? 0;
  }

  /** Formatted cost string */
  get formattedCost(): string {
    if (!this.costEstimate) return '—';
    return tronResourceService.formatCost(this.costEstimate);
  }

  /** TRX burn for bandwidth only */
  get bandwidthBurnTrx(): number {
    return this.costEstimate?.bandwidthCostTrx ?? 0;
  }

  /** Energy cost in TRX */
  get energyCostTrx(): number {
    return this.costEstimate?.energyCostTrx ?? 0;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch wallet resources (energy & bandwidth)
   */
  fetchResources = async (walletAddress: string): Promise<WalletResources | null> => {
    if (!walletAddress) return null;

    // Skip if same address and already loaded
    if (walletAddress === this._lastWalletAddress && this.resources) {
      return this.resources;
    }

    runInAction(() => {
      this.isLoadingResources = true;
      this.resourcesError = null;
    });

    try {
      // Update constants from remote config
      tronResourceService.setConstants(remoteConfigStore.tron);

      const resources = await tronResourceService.getWalletResources(walletAddress);

      runInAction(() => {
        this.resources = resources;
        this._lastWalletAddress = walletAddress;
        this.isLoadingResources = false;
      });

      return resources;

    } catch (error) {
      runInAction(() => {
        this.resourcesError = (error as Error).message;
        this.isLoadingResources = false;
      });
      return null;
    }
  };

  /**
   * Estimate cost for USDT transfer
   */
  estimateCost = async (
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    senderTrxBalance: number
  ): Promise<TransactionCostEstimate | null> => {
    if (!senderAddress || !recipientAddress || !amount) {
      return null;
    }

    // Skip if same parameters
    if (
      senderAddress === this._lastWalletAddress &&
      recipientAddress === this._lastRecipientAddress &&
      this.costEstimate
    ) {
      return this.costEstimate;
    }

    runInAction(() => {
      this.isEstimating = true;
      this.estimateError = null;
    });

    try {
      // Update constants from remote config
      tronResourceService.setConstants(remoteConfigStore.tron);

      // Get USDT contract address
      const usdtContract = getTokenAddress('usdt', 'tron');
      if (!usdtContract) {
        throw new Error('USDT contract not configured');
      }

      const estimate = await tronResourceService.calculateTransactionCost(
        senderAddress,
        recipientAddress,
        usdtContract,
        amount,
        senderTrxBalance
      );

      runInAction(() => {
        this.costEstimate = estimate;
        this._lastRecipientAddress = recipientAddress;
        this.isEstimating = false;
      });

      return estimate;

    } catch (error) {
      runInAction(() => {
        this.estimateError = (error as Error).message;
        this.isEstimating = false;
      });
      return null;
    }
  };

  /**
   * Refresh all data
   */
  refresh = async (walletAddress: string, recipientAddress?: string, amount?: string, trxBalance?: number) => {
    // Clear cache to force refresh
    this._lastWalletAddress = null;
    this._lastRecipientAddress = null;

    await this.fetchResources(walletAddress);

    if (recipientAddress && amount && trxBalance !== undefined) {
      await this.estimateCost(walletAddress, recipientAddress, amount, trxBalance);
    }
  };

  /**
   * Clear cost estimate (when recipient changes)
   */
  clearEstimate = () => {
    this.costEstimate = null;
    this._lastRecipientAddress = null;
    this.estimateError = null;
  };

  /**
   * Reset all state
   */
  reset = () => {
    this.resources = null;
    this.costEstimate = null;
    this.isLoadingResources = false;
    this.isEstimating = false;
    this.resourcesError = null;
    this.estimateError = null;
    this._lastWalletAddress = null;
    this._lastRecipientAddress = null;
  };
}

// ============================================================================
// Singleton Export
// ============================================================================

export const resourceStore = new ResourceStore();
