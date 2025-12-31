// ============================================================================
// Multi-Chain Wallet Types
// ============================================================================

/** Supported blockchain networks */
export type ChainId = 'tron';

/** Supported tokens */
export type TokenId = 'native' | 'usdt';

/** Composite key for chain + token */
export type AssetKey = `${ChainId}:${TokenId}`;

/** Chain configuration */
export interface ChainConfig {
  id: ChainId;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
}

/** Token configuration */
export interface TokenConfig {
  id: TokenId;
  symbol: string;
  name: string;
  decimals: number;
  contracts: Partial<Record<ChainId, string>>;
  icon?: string;
}

/** Balance info for a single chain (native currency) */
export interface ChainBalance {
  chainId: ChainId;
  address: string;
  balance: string; // Always string for precision
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

/** Balance info for a token on a specific chain */
export interface TokenBalance {
  chainId: ChainId;
  tokenId: TokenId;
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
  contractAddress: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

/** Transaction record */
export interface Transaction {
  id: string;
  chainId: ChainId;
  tokenId: TokenId;
  hash: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  contractAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

/** Send transaction params */
export interface SendTransactionParams {
  toAddress: string;
  amount: string;
  chainId: ChainId;
  tokenId: TokenId;
}

/** Helper to create asset key */
export function createAssetKey(chainId: ChainId, tokenId: TokenId): AssetKey {
  return `${chainId}:${tokenId}`;
}

/** Helper to parse asset key */
export function parseAssetKey(key: AssetKey): { chainId: ChainId; tokenId: TokenId } {
  const [chainId, tokenId] = key.split(':') as [ChainId, TokenId];
  return { chainId, tokenId };
}
