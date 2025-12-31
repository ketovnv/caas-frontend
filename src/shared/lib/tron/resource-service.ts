// ============================================================================
// TRON Resource Service
// ============================================================================

import type {
  TronAccountResources,
  WalletResources,
  TransactionCostEstimate,
  TronConstants,
} from './types';
import {
  DEFAULT_TRON_CONSTANTS,
  sunToTrx,
} from './types';
import { rpcProviderManager } from './rpc-provider';

// ============================================================================
// TronResourceService
// ============================================================================

class TronResourceService {
  private _constants: TronConstants = DEFAULT_TRON_CONSTANTS;

  constructor() {
    // TronWeb instance is now managed by rpcProviderManager
  }

  /** Get current constants */
  get constants(): TronConstants {
    return this._constants;
  }

  /** Update constants from remote config */
  setConstants(constants: Partial<TronConstants>) {
    this._constants = { ...this._constants, ...constants, updatedAt: Date.now() };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Account Resources
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get raw account resources from TronWeb
   */
  async getAccountResources(address: string): Promise<TronAccountResources | null> {
    try {
      const resources = await rpcProviderManager.executeRequest(
        (tronWeb) => tronWeb.trx.getAccountResources(address)
      );
      return resources as TronAccountResources;
    } catch (error) {
      console.error('[TronResourceService] getAccountResources failed:', error);
      return null;
    }
  }

  /**
   * Get parsed wallet resources (energy & bandwidth)
   */
  async getWalletResources(address: string): Promise<WalletResources | null> {
    const raw = await this.getAccountResources(address);
    if (!raw) return null;

    const freeBandwidth = raw.freeNetLimit || 5000;
    const freeBandwidthUsed = raw.freeNetUsed || 0;
    const stakedBandwidth = raw.NetLimit || 0;
    const stakedBandwidthUsed = raw.NetUsed || 0;
    const energy = raw.EnergyLimit || 0;
    const energyUsed = raw.EnergyUsed || 0;

    return {
      freeBandwidth,
      freeBandwidthUsed,
      stakedBandwidth,
      stakedBandwidthUsed,
      totalBandwidth: (freeBandwidth - freeBandwidthUsed) + (stakedBandwidth - stakedBandwidthUsed),
      energy,
      energyUsed,
      totalEnergy: energy - energyUsed,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Energy Estimation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Check if recipient has USDT balance (affects energy cost)
   */
  async checkRecipientHasUsdt(
    recipientAddress: string,
    usdtContractAddress: string
  ): Promise<boolean> {
    try {
      const balance = await rpcProviderManager.executeRequest(async (tronWeb) => {
        const contract = await tronWeb.contract().at(usdtContractAddress);
        return (contract as any).methods.balanceOf(recipientAddress).call();
      });
      return Number(balance) > 0;
    } catch (error) {
      console.warn('[TronResourceService] checkRecipientHasUsdt failed:', error);
      // Assume no balance (higher energy estimate for safety)
      return false;
    }
  }

  /**
   * Estimate energy needed for TRC-20 transfer using triggerconstantcontract
   */
  async estimateTransferEnergy(
    ownerAddress: string,
    contractAddress: string,
    recipientAddress: string,
    amount: string,
    decimals: number = 6
  ): Promise<number> {
    try {
      // Convert amount to smallest unit
      const amountInSmallestUnit = Math.floor(
        parseFloat(amount) * Math.pow(10, decimals)
      );

      // Call triggerconstantcontract to estimate energy
      const result = await rpcProviderManager.executeRequest((tronWeb) =>
        tronWeb.transactionBuilder.triggerConstantContract(
          contractAddress,
          'transfer(address,uint256)',
          {},
          [
            { type: 'address', value: recipientAddress },
            { type: 'uint256', value: amountInSmallestUnit },
          ],
          ownerAddress
        )
      );

      if (result?.energy_used) {
        return result.energy_used;
      }

      // Fallback: check if recipient has USDT
      const hasUsdt = await this.checkRecipientHasUsdt(recipientAddress, contractAddress);
      return hasUsdt
        ? this._constants.energyPerUsdtTransferExisting
        : this._constants.energyPerUsdtTransferNew;

    } catch (error) {
      console.warn('[TronResourceService] estimateTransferEnergy failed:', error);
      // Fallback to constant-based estimate
      return this._constants.energyPerUsdtTransferNew;
    }
  }

  /**
   * Quick energy estimate based on recipient USDT balance
   */
  async quickEnergyEstimate(
    recipientAddress: string,
    usdtContractAddress: string
  ): Promise<number> {
    const hasUsdt = await this.checkRecipientHasUsdt(recipientAddress, usdtContractAddress);
    return hasUsdt
      ? this._constants.energyPerUsdtTransferExisting
      : this._constants.energyPerUsdtTransferNew;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Cost Calculation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calculate full transaction cost estimate
   */
  async calculateTransactionCost(
    senderAddress: string,
    recipientAddress: string,
    usdtContractAddress: string,
    _amount: string, // Reserved for future precise estimation
    senderTrxBalance: number
  ): Promise<TransactionCostEstimate> {
    // Get sender's resources
    const resources = await this.getWalletResources(senderAddress);

    // Estimate energy needed
    const energyNeeded = await this.quickEnergyEstimate(recipientAddress, usdtContractAddress);

    // Available resources (default to 0 if failed to fetch)
    const energyAvailable = resources?.totalEnergy || 0;
    const bandwidthAvailable = resources?.totalBandwidth || 0;

    // Calculate energy shortfall
    const energyToBuy = Math.max(0, energyNeeded - energyAvailable);
    const energyCostSun = energyToBuy * this._constants.energyUnitPrice;
    const energyCostTrx = sunToTrx(energyCostSun);

    // Calculate bandwidth shortfall
    const bandwidthNeeded = this._constants.bandwidthPerTrc20Transfer;
    const bandwidthToBurn = Math.max(0, bandwidthNeeded - bandwidthAvailable);
    const bandwidthCostSun = bandwidthToBurn * this._constants.bandwidthUnitPrice;
    const bandwidthCostTrx = sunToTrx(bandwidthCostSun);

    // Total cost
    const totalCostTrx = energyCostTrx + bandwidthCostTrx;

    return {
      energyNeeded,
      energyAvailable,
      energyToBuy,
      energyCostTrx,
      bandwidthNeeded,
      bandwidthAvailable,
      bandwidthToBurn,
      bandwidthCostTrx,
      totalCostTrx,
      hasEnoughResources: energyToBuy === 0 && bandwidthToBurn === 0,
      hasEnoughTrx: senderTrxBalance >= totalCostTrx,
    };
  }

  /**
   * Format cost as human-readable string
   */
  formatCost(estimate: TransactionCostEstimate): string {
    if (estimate.hasEnoughResources) {
      return 'Безкоштовно (достатньо ресурсів)';
    }

    const parts: string[] = [];

    if (estimate.energyCostTrx > 0) {
      parts.push(`${estimate.energyCostTrx.toFixed(2)} TRX (енергія)`);
    }

    if (estimate.bandwidthCostTrx > 0) {
      parts.push(`${estimate.bandwidthCostTrx.toFixed(4)} TRX (bandwidth)`);
    }

    return parts.join(' + ') || '0 TRX';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chain Parameters (for updating constants)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch current chain parameters from network
   */
  async getChainParameters(): Promise<Record<string, number> | null> {
    try {
      const params = await rpcProviderManager.executeRequest((tronWeb) =>
        tronWeb.trx.getChainParameters()
      );
      const result: Record<string, number> = {};

      for (const param of params) {
        result[param.key] = param.value;
      }

      return result;
    } catch (error) {
      console.error('[TronResourceService] getChainParameters failed:', error);
      return null;
    }
  }

  /**
   * Update energy unit price from chain
   */
  async updateEnergyPrice(): Promise<number | null> {
    const params = await this.getChainParameters();
    if (!params) return null;

    // getEnergyFee returns sun per energy unit
    const energyFee = params['getEnergyFee'];
    if (energyFee) {
      this._constants.energyUnitPrice = energyFee;
      this._constants.updatedAt = Date.now();
      return energyFee;
    }

    return null;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const tronResourceService = new TronResourceService();
