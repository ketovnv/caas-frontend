import type { ChainId } from '../model/types';

// ============================================================================
// Token Configuration - TRC-20 and ERC-20 tokens
// ============================================================================

export type TokenId = 'native' | 'usdt' | 'usdc';

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
  symbol: 'NATIVE',
  name: 'Native Currency',
  decimals: 18,
  contracts: {},
};

export const USDT_TOKEN: TokenConfig = {
  id: 'usdt',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  contracts: {
    // Tron USDT
    tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Mainnet
    // For Shasta testnet, we'll use a mock or deploy our own
    // tron: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', // Shasta test token

    // Ethereum USDT
    ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Mainnet
    // ethereum: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia
  },
};

export const USDC_TOKEN: TokenConfig = {
  id: 'usdc',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  contracts: {
    // Tron USDC
    tron: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', // Mainnet

    // Ethereum USDC
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet
    // ethereum: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia
  },
};

// ============================================================================
// Token Registry
// ============================================================================

export const TOKENS: Record<TokenId, TokenConfig> = {
  native: NATIVE_TOKEN,
  usdt: USDT_TOKEN,
  usdc: USDC_TOKEN,
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
    // Shasta testnet - these may need to be deployed or found
    usdt: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', // Example test token
  },
  ethereum: {
    // Sepolia testnet
    usdt: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
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
