import type { ChainConfig, ChainId } from '../model/types';

// ============================================================================
// Chain Configurations
// ============================================================================

/** Tron Shasta Testnet */
export const TRON_CONFIG: ChainConfig = {
  id: 'tron',
  name: 'TRON',
  symbol: 'TRX',
  decimals: 6, // 1 TRX = 1,000,000 SUN
  rpcUrl: 'https://api.shasta.trongrid.io',
  explorerUrl: 'https://shasta.tronscan.org',
  faucetUrl: 'https://shasta.tronex.io/',
};

/** Ethereum Sepolia Testnet */
export const ETHEREUM_CONFIG: ChainConfig = {
  id: 'ethereum',
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18, // 1 ETH = 10^18 wei
  rpcUrl: 'https://rpc.sepolia.org',
  explorerUrl: 'https://sepolia.etherscan.io',
  faucetUrl: 'https://sepoliafaucet.com',
};

/** All supported chains */
export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  tron: TRON_CONFIG,
  ethereum: ETHEREUM_CONFIG,
};

/** Default chain */
export const DEFAULT_CHAIN: ChainId = 'tron';

/** Get explorer URL for transaction */
export function getExplorerTxUrl(chainId: ChainId, txHash: string): string {
  const config = CHAIN_CONFIGS[chainId];
  if (chainId === 'tron') {
    return `${config.explorerUrl}/#/transaction/${txHash}`;
  }
  return `${config.explorerUrl}/tx/${txHash}`;
}

/** Get explorer URL for address */
export function getExplorerAddressUrl(chainId: ChainId, address: string): string {
  const config = CHAIN_CONFIGS[chainId];
  if (chainId === 'tron') {
    return `${config.explorerUrl}/#/address/${address}`;
  }
  return `${config.explorerUrl}/address/${address}`;
}
