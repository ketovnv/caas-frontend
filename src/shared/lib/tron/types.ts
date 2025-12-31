// ============================================================================
// TRON Resource Types
// ============================================================================

/** Account resources from TronWeb */
export interface TronAccountResources {
  freeNetLimit: number;      // Free bandwidth limit (default 5000)
  freeNetUsed?: number;      // Used free bandwidth
  NetLimit?: number;         // Staked bandwidth limit
  NetUsed?: number;          // Used staked bandwidth
  EnergyLimit?: number;      // Available energy from staking
  EnergyUsed?: number;       // Used energy
  TotalNetLimit: number;     // Total network bandwidth
  TotalNetWeight: number;    // Total staked TRX for bandwidth
  TotalEnergyLimit: number;  // Total network energy
  TotalEnergyWeight: number; // Total staked TRX for energy
}

/** Parsed wallet resources */
export interface WalletResources {
  // Bandwidth
  freeBandwidth: number;        // Available free bandwidth
  freeBandwidthUsed: number;    // Used free bandwidth
  stakedBandwidth: number;      // Available staked bandwidth
  stakedBandwidthUsed: number;  // Used staked bandwidth
  totalBandwidth: number;       // Total available bandwidth

  // Energy
  energy: number;               // Available energy
  energyUsed: number;           // Used energy
  totalEnergy: number;          // Total available energy
}

/** Transaction cost estimate */
export interface TransactionCostEstimate {
  // Energy
  energyNeeded: number;         // Energy required for transaction
  energyAvailable: number;      // Energy available in wallet
  energyToBuy: number;          // Energy to purchase (if any)
  energyCostTrx: number;        // TRX cost for energy (if buying/burning)

  // Bandwidth
  bandwidthNeeded: number;      // Bandwidth required (~350 for TRC-20)
  bandwidthAvailable: number;   // Bandwidth available in wallet
  bandwidthToBurn: number;      // Bandwidth to cover with TRX
  bandwidthCostTrx: number;     // TRX cost for bandwidth burn

  // Total
  totalCostTrx: number;         // Total TRX cost
  hasEnoughResources: boolean;  // Can send without TRX burn
  hasEnoughTrx: boolean;        // Has enough TRX to cover costs
}

/** TRON chain constants (fetched from server) */
export interface TronConstants {
  // Energy
  energyUnitPrice: number;      // sun per energy (currently 420 sun = 0.00042 TRX)
  energyPerUsdtTransferNew: number;    // ~65,000 for new recipient
  energyPerUsdtTransferExisting: number; // ~29,000 for existing recipient

  // Bandwidth
  bandwidthUnitPrice: number;   // sun per bandwidth (1000 sun = 0.001 TRX)
  bandwidthPerTrc20Transfer: number;   // ~350 bytes

  // Activation
  accountActivationFee: number; // 1 TRX for new account

  // Rental (if using energy rental service)
  energyRentalPricePerUnit?: number;  // TRX per energy unit from rental
  minEnergyRental?: number;           // Minimum energy rental amount

  // Timestamps
  updatedAt: number;            // When constants were last updated
}

/** Default TRON constants (Shasta testnet values) */
export const DEFAULT_TRON_CONSTANTS: TronConstants = {
  energyUnitPrice: 420,                    // 420 sun = 0.00042 TRX
  energyPerUsdtTransferNew: 65000,         // New recipient
  energyPerUsdtTransferExisting: 29000,    // Existing recipient
  bandwidthUnitPrice: 1000,                // 1000 sun = 0.001 TRX
  bandwidthPerTrc20Transfer: 350,          // ~350 bytes
  accountActivationFee: 1_000_000,         // 1 TRX in sun
  updatedAt: Date.now(),
};

/** Sun to TRX conversion */
export const SUN_PER_TRX = 1_000_000;

/** Convert sun to TRX */
export function sunToTrx(sun: number): number {
  return sun / SUN_PER_TRX;
}

/** Convert TRX to sun */
export function trxToSun(trx: number): number {
  return trx * SUN_PER_TRX;
}
