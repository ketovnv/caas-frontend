import { makeAutoObservable, runInAction } from 'mobx';
import type {
  ChainId,
  TokenId,
  AssetKey,
  ChainBalance,
  TokenBalance,
  Transaction,
} from './types';
import { createAssetKey } from './types';
import { CHAIN_CONFIGS, DEFAULT_CHAIN } from '../config/chains';
import { TOKENS, getTokenAddress, getTokenConfig } from '../config/tokens';
import {
  authStore,
  getTronAccount,
  getTronBalance,
  sendTransaction as sendTronTx,
  getTrc20Balance,
  sendTrc20,
} from 'features/auth';
import {
  getEvmAccount,
  getEvmBalance,
  sendEvmTransaction,
  getErc20Balance,
  sendErc20,
} from '../lib/evmRpc';
import { web3AuthService } from 'shared/lib/web3auth';
import { hapticsStore } from 'shared/lib/haptics';

// ============================================================================
// Wallet Store - Multi-Chain & Multi-Token Balance & Transaction Management
// ============================================================================

class WalletStore {
  // ─────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────

  /** Native balances per chain */
  balances: Map<ChainId, ChainBalance> = new Map();

  /** Token balances per chain:token key */
  tokenBalances: Map<AssetKey, TokenBalance> = new Map();

  /** Currently selected chain */
  selectedChain: ChainId = DEFAULT_CHAIN;

  /** Currently selected token */
  selectedToken: TokenId = 'native';

  /** Transaction history */
  transactions: Transaction[] = [];

  /** Global refresh state */
  isRefreshing = false;

  /** Transaction sending state */
  isSending = false;
  sendError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ─────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────

  /** Current chain balance (native) */
  get currentBalance(): ChainBalance | undefined {
    return this.balances.get(this.selectedChain);
  }

  /** Current token balance */
  get currentTokenBalance(): TokenBalance | undefined {
    if (this.selectedToken === 'native') {
      // Return native as TokenBalance format
      const native = this.currentBalance;
      if (!native) return undefined;
      const config = this.currentChainConfig;
      return {
        chainId: this.selectedChain,
        tokenId: 'native',
        address: native.address,
        balance: native.balance,
        symbol: config.symbol,
        decimals: config.decimals,
        contractAddress: null,
        isLoading: native.isLoading,
        error: native.error,
        lastUpdated: native.lastUpdated,
      };
    }

    const key = createAssetKey(this.selectedChain, this.selectedToken);
    return this.tokenBalances.get(key);
  }

  /** Current chain config */
  get currentChainConfig() {
    return CHAIN_CONFIGS[this.selectedChain];
  }

  /** Current token config */
  get currentTokenConfig() {
    return getTokenConfig(this.selectedToken);
  }

  /** Current display symbol */
  get currentSymbol(): string {
    if (this.selectedToken === 'native') {
      return this.currentChainConfig.symbol;
    }
    return this.currentTokenConfig.symbol;
  }

  /** All balances as array */
  get allBalances(): ChainBalance[] {
    return Array.from(this.balances.values());
  }

  /** Current wallet address for selected chain */
  get currentAddress(): string | null {
    return this.currentBalance?.address || null;
  }

  /** Formatted balance with symbol */
  get formattedBalance(): string {
    const balance = this.currentTokenBalance;
    if (!balance) return '0.00';
    const num = parseFloat(balance.balance);
    return `${num.toFixed(4)} ${balance.symbol}`;
  }

  /** Check if any balance is loading */
  get isLoading(): boolean {
    return (
      this.isRefreshing || Array.from(this.balances.values()).some((b) => b.isLoading)
    );
  }

  /** Available tokens for current chain */
  get availableTokens(): TokenId[] {
    const chainId = this.selectedChain;
    return Object.entries(TOKENS)
      .filter(([id, token]) => id === 'native' || token.contracts[chainId])
      .map(([id]) => id as TokenId);
  }

  // ─────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────

  /** Select active chain */
  setSelectedChain = (chain: ChainId) => {
    this.selectedChain = chain;
    // Reset token to native if current token not available on new chain
    if (!this.availableTokens.includes(this.selectedToken)) {
      this.selectedToken = 'native';
    }
    hapticsStore.play('tap');
  };

  /** Select active token */
  setSelectedToken = (token: TokenId) => {
    this.selectedToken = token;
    hapticsStore.play('tap');
  };

  /** Fetch balances for all chains and tokens */
  fetchBalances = async () => {
    if (!authStore.isConnected) return;

    // Only Web3Auth has access to private key for both chains
    if (authStore.walletType !== 'web3auth') {
      console.warn('[WalletStore] Multi-chain balance requires Web3Auth');
      return;
    }

    const provider = web3AuthService.provider;
    if (!provider) return;

    runInAction(() => {
      this.isRefreshing = true;
    });

    // Fetch native balances in parallel
    await Promise.all([
      this.fetchTronBalance(provider),
      this.fetchEvmBalance(provider),
    ]);

    // Fetch token balances
    await Promise.all([
      this.fetchTokenBalance(provider, 'tron', 'usdt'),
      this.fetchTokenBalance(provider, 'tron', 'usdc'),
      this.fetchTokenBalance(provider, 'ethereum', 'usdt'),
      this.fetchTokenBalance(provider, 'ethereum', 'usdc'),
    ]);

    runInAction(() => {
      this.isRefreshing = false;
    });
  };

  /** Fetch Tron balance */
  private fetchTronBalance = async (provider: any) => {
    runInAction(() => {
      const existing = this.balances.get('tron');
      this.balances.set('tron', {
        chainId: 'tron',
        address: existing?.address || '',
        balance: existing?.balance || '0',
        isLoading: true,
        error: null,
        lastUpdated: Date.now(),
      });
    });

    try {
      const address = await getTronAccount(provider);
      const balance = await getTronBalance(provider);

      runInAction(() => {
        this.balances.set('tron', {
          chainId: 'tron',
          address,
          balance,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      });
    } catch (error) {
      runInAction(() => {
        this.balances.set('tron', {
          chainId: 'tron',
          address: '',
          balance: '0',
          isLoading: false,
          error: (error as Error).message,
          lastUpdated: Date.now(),
        });
      });
    }
  };

  /** Fetch EVM balance */
  private fetchEvmBalance = async (provider: any) => {
    runInAction(() => {
      const existing = this.balances.get('ethereum');
      this.balances.set('ethereum', {
        chainId: 'ethereum',
        address: existing?.address || '',
        balance: existing?.balance || '0',
        isLoading: true,
        error: null,
        lastUpdated: Date.now(),
      });
    });

    try {
      const address = await getEvmAccount(provider);
      const balance = await getEvmBalance(provider);

      runInAction(() => {
        this.balances.set('ethereum', {
          chainId: 'ethereum',
          address,
          balance,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      });
    } catch (error) {
      runInAction(() => {
        this.balances.set('ethereum', {
          chainId: 'ethereum',
          address: '',
          balance: '0',
          isLoading: false,
          error: (error as Error).message,
          lastUpdated: Date.now(),
        });
      });
    }
  };

  /** Fetch token balance for a specific chain and token */
  private fetchTokenBalance = async (
    provider: any,
    chainId: ChainId,
    tokenId: TokenId
  ) => {
    if (tokenId === 'native') return;

    const contractAddress = getTokenAddress(tokenId, chainId);
    if (!contractAddress) return;

    const key = createAssetKey(chainId, tokenId);
    const tokenConfig = getTokenConfig(tokenId);
    const nativeBalance = this.balances.get(chainId);

    runInAction(() => {
      this.tokenBalances.set(key, {
        chainId,
        tokenId,
        address: nativeBalance?.address || '',
        balance: '0',
        symbol: tokenConfig.symbol,
        decimals: tokenConfig.decimals,
        contractAddress,
        isLoading: true,
        error: null,
        lastUpdated: Date.now(),
      });
    });

    try {
      let balance: string;

      if (chainId === 'tron') {
        balance = await getTrc20Balance(provider, contractAddress, tokenConfig.decimals);
      } else {
        balance = await getErc20Balance(provider, contractAddress, tokenConfig.decimals);
      }

      runInAction(() => {
        this.tokenBalances.set(key, {
          chainId,
          tokenId,
          address: nativeBalance?.address || '',
          balance,
          symbol: tokenConfig.symbol,
          decimals: tokenConfig.decimals,
          contractAddress,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      });
    } catch (error) {
      runInAction(() => {
        this.tokenBalances.set(key, {
          chainId,
          tokenId,
          address: nativeBalance?.address || '',
          balance: '0',
          symbol: tokenConfig.symbol,
          decimals: tokenConfig.decimals,
          contractAddress,
          isLoading: false,
          error: (error as Error).message,
          lastUpdated: Date.now(),
        });
      });
    }
  };

  /** Send transaction on selected chain/token */
  sendTransaction = async (toAddress: string, amount: string): Promise<string> => {
    if (!authStore.isConnected) {
      throw new Error('Not connected');
    }

    const provider = web3AuthService.provider;
    if (!provider) {
      throw new Error('Provider not found');
    }

    runInAction(() => {
      this.isSending = true;
      this.sendError = null;
    });

    hapticsStore.play('tap');

    try {
      let txHash: string;
      const symbol = this.currentSymbol;
      const tokenConfig = this.currentTokenConfig;
      const contractAddress = getTokenAddress(this.selectedToken, this.selectedChain);

      if (this.selectedChain === 'tron') {
        // Validate Tron address
        if (!toAddress.startsWith('T') || toAddress.length !== 34) {
          throw new Error('Invalid TRON address (must start with T)');
        }

        if (this.selectedToken === 'native') {
          // Native TRX transfer
          const result = await sendTronTx(provider, toAddress, Number(amount));
          const parsed = JSON.parse(result);
          txHash = parsed.txid || parsed.transaction?.txID || result;
        } else {
          // TRC-20 transfer
          if (!contractAddress) throw new Error('Token not available on this chain');
          txHash = await sendTrc20(
            provider,
            contractAddress,
            toAddress,
            amount,
            tokenConfig.decimals
          );
        }
      } else {
        // Validate EVM address
        if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
          throw new Error('Invalid Ethereum address (must start with 0x)');
        }

        if (this.selectedToken === 'native') {
          // Native ETH transfer
          txHash = await sendEvmTransaction(provider, toAddress, amount);
        } else {
          // ERC-20 transfer
          if (!contractAddress) throw new Error('Token not available on this chain');
          txHash = await sendErc20(
            provider,
            contractAddress,
            toAddress,
            amount,
            tokenConfig.decimals
          );
        }
      }

      // Record transaction
      const tx: Transaction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        chainId: this.selectedChain,
        tokenId: this.selectedToken,
        hash: txHash,
        from: this.currentAddress || '',
        to: toAddress,
        amount,
        symbol,
        contractAddress: contractAddress || undefined,
        status: 'confirmed',
        timestamp: Date.now(),
      };

      runInAction(() => {
        this.transactions.unshift(tx);
        this.isSending = false;
      });

      hapticsStore.play('success');

      // Refresh balances
      await this.fetchBalances();

      return txHash;
    } catch (error) {
      runInAction(() => {
        this.isSending = false;
        this.sendError = (error as Error).message;
      });

      hapticsStore.play('error');
      throw error;
    }
  };

  /** Clear send error */
  clearSendError = () => {
    this.sendError = null;
  };

  /** Clear all state (on disconnect) */
  reset = () => {
    this.balances.clear();
    this.tokenBalances.clear();
    this.transactions = [];
    this.selectedChain = DEFAULT_CHAIN;
    this.selectedToken = 'native';
    this.isRefreshing = false;
    this.isSending = false;
    this.sendError = null;
  };
}

// ============================================================================
// Singleton Export
// ============================================================================

export const walletStore = new WalletStore();
