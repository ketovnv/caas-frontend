// Network Configuration

import type { RpcProviderConfig } from 'shared/lib/tron';

// Types

export type NetworkId = 'mainnet' | 'nile';

export interface NetworkConfig {
  /** Unique network ID */
  id: NetworkId;
  /** Display name */
  name: string;
  /** Short display name */
  shortName: string;
  /** RPC providers for this network */
  rpcProviders: RpcProviderConfig[];
  /** Block explorer URL */
  explorerUrl: string;
  /** Token addresses per token ID */
  tokens: {
    usdt: string;
  };
  /** Is this a testnet */
  isTestnet: boolean;
  /** Faucet URL (testnet only) */
  faucetUrl?: string;
  /** Badge color (Tailwind class) */
  badgeColor: string;
}

// RPC Providers

/** Nile Testnet providers */
const NILE_PROVIDERS: RpcProviderConfig[] = [
  {
    id: 'trongrid-nile',
    name: 'TronGrid Nile',
    url: 'https://nile.trongrid.io',
    rateLimit: 15,
    priority: 1,
    enabled: true,
  },
  {
    id: 'nileex',
    name: 'NileEx',
    url: 'https://api.nileex.io',
    rateLimit: 10,
    priority: 2,
    enabled: true,
  },
];

/** Mainnet providers */
const MAINNET_PROVIDERS: RpcProviderConfig[] = [
  {
    id: 'trongrid-mainnet',
    name: 'TronGrid Mainnet',
    url: 'https://api.trongrid.io',
    rateLimit: 15,
    priority: 1,
    enabled: true,
  },
];


// Network Definitions


export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: 'mainnet',
    name: 'Mainnet',
    shortName: 'Main',
    rpcProviders: MAINNET_PROVIDERS,
    explorerUrl: 'https://tronscan.org',
    tokens: {
      usdt: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    },
    isTestnet: false,
    badgeColor: 'bg-emerald-500',
  },
  nile: {
    id: 'nile',
    name: 'Nile Testnet',
    shortName: 'Nile',
    rpcProviders: NILE_PROVIDERS,
    explorerUrl: 'https://nile.tronscan.org',
    tokens: {
      usdt: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
    },
    isTestnet: true,
    faucetUrl: 'https://nileex.io/join/getJoinPage',
    badgeColor: 'bg-orange-500',
  },
};

/** Default network */
export const DEFAULT_NETWORK: NetworkId = 'nile';

/** All network IDs */
export const NETWORK_IDS: NetworkId[] = ['mainnet', 'nile'];


// Helpers


/** Get network config by ID */
export function getNetworkConfig(networkId: NetworkId): NetworkConfig {
  return NETWORKS[networkId];
}

/** Get explorer URL for transaction */
export function getExplorerTxUrl(networkId: NetworkId, txHash: string): string {
  const network = NETWORKS[networkId];
  return `${network.explorerUrl}/#/transaction/${txHash}`;
}

/** Get explorer URL for address */
export function getExplorerAddressUrl(networkId: NetworkId, address: string): string {
  const network = NETWORKS[networkId];
  return `${network.explorerUrl}/#/address/${address}`;
}
