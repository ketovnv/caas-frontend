import type { ChainId } from '../model/types';

// ============================================================================
// Token Configuration - TRC-20 tokens (Tron only)
// ============================================================================

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

// ============================================================================
// Token Definitions
// ============================================================================

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
    // Tron USDT (Mainnet)
    tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    // For Shasta testnet, use test token address
    // tron: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
  },
};

// ============================================================================
// Token Registry
// ============================================================================

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

// ============================================================================
// Testnet Token Addresses (for development)
// ============================================================================

export const TESTNET_TOKENS: Partial<Record<ChainId, Record<string, string>>> = {
  tron: {
    // Shasta testnet
    usdt: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
  },
};

/** Check if we should use testnet tokens */
export const USE_TESTNET_TOKENS = true; // Toggle for development

/** Get the appropriate token address (mainnet or testnet) */
export function getTokenAddress(tokenId: TokenId, chainId: ChainId): string | null {
  if (tokenId === 'native') return null;

  if (USE_TESTNET_TOKENS) {
    const testnetAddr = TESTNET_TOKENS[chainId]?.[tokenId];
    if (testnetAddr) return testnetAddr;
  }

  return TOKENS[tokenId]?.contracts[chainId] ?? null;
}
