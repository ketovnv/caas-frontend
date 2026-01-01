import type { ChainId } from '../model/types';
import { networkStore } from 'shared/model';

// Token Configuration - TRC-20 tokens (Tron only)

export type TokenId = 'native' | 'usdt';

export interface TokenConfig {
  id: TokenId;
  symbol: string;
  name: string;
  decimals: number;
  /** Contract addresses per chain (null for native) */
  contracts: Partial<Record<ChainId, string>>;
  /** Logo URL or icon identifier */
  icon?: string;
}

// Token Definitions

export const NATIVE_TOKEN: TokenConfig = {
  id: 'native',
  symbol: 'TRX',
  name: 'TRON',
  decimals: 6, // TRX uses 6 decimals (SUN)
  contracts: {},
};

export const USDT_TOKEN: TokenConfig = {
  id: 'usdt',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  contracts: {
    // Dynamic - see getTokenAddress()
    tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Mainnet default
  },
};

// Token Registry

export const TOKENS: Record<TokenId, TokenConfig> = {
  native: NATIVE_TOKEN,
  usdt: USDT_TOKEN,
};

/** Get tokens available on a specific chain */
export function getTokensForChain(chainId: ChainId): TokenConfig[] {
  return Object.values(TOKENS).filter(
    (token) => token.id === 'native' || token.contracts[chainId]
  );
}

/** Get token contract address for a chain */
export function getTokenContract(tokenId: TokenId, chainId: ChainId): string | null {
  if (tokenId === 'native') return null;
  return TOKENS[tokenId]?.contracts[chainId] ?? null;
}

/** Get token by ID */
export function getTokenConfig(tokenId: TokenId): TokenConfig {
  return TOKENS[tokenId] ?? NATIVE_TOKEN;
}

// Dynamic Token Address (uses networkStore)

/**
 * Get the appropriate token address based on current network
 * Uses networkStore to determine mainnet/testnet
 */
export function getTokenAddress(tokenId: TokenId, _chainId: ChainId): string | null {
  if (tokenId === 'native') return null;

  // Get USDT address from current network config
  if (tokenId === 'usdt') {
    return networkStore.usdtContract;
  }

  return null;
}
