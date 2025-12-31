import {makeAutoObservable, runInAction} from 'mobx';
import type {
    ChainId,
    TokenId,
    AssetKey,
    ChainBalance,
    TokenBalance,
    Transaction,
    ChainConfig
} from './types';
import {createAssetKey} from './types';
import {TOKENS, getTokenAddress, getTokenConfig} from 'entities/wallet';
import {
    authStore,
    getTronAccount,
    getTronBalance,
    sendTransaction as sendTronTx,
    getTrc20Balance,
    sendTrc20,
} from 'features/auth';
import {web3AuthService} from 'shared/lib/web3auth';
import {hapticsStore} from 'shared/lib/haptics';

export const TRON_CONFIG: ChainConfig = {
    id: 'tron',
    name: 'TRON',
    symbol: 'TRX',
    decimals: 6, // 1 TRX = 1,000,000 SUN
    rpcUrl: 'https://nile.trongrid.io',
    explorerUrl: 'https://nile.tronscan.org',
    faucetUrl: 'https://nileex.io/join/getJoinPage',
};

// Wallet Store - Multi-Chain & Multi-Token Balance & Transaction Management

class WalletStore {


    /** Token balances per chain:token key */
    tokenBalances: Map<AssetKey, TokenBalance> = new Map();


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

    balances: Map<ChainId, ChainBalance> = new Map();

    /** Current chain balance (native) */
    get currentBalance(): ChainBalance | undefined {
        return this.balances.get('tron');
    }

    /** Current token balance */
    get currentTokenBalance(): TokenBalance | undefined {
        if (this.selectedToken === 'native') {
            // Return native as TokenBalance format
            const native = this.currentBalance;
            if (!native) return undefined;
            const config = TRON_CONFIG;
            return {
                chainId: 'tron',
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

        const key = createAssetKey('tron', this.selectedToken);
        return this.tokenBalances.get(key);
    }

    /** Current token config */
    get currentTokenConfig() {
        return getTokenConfig(this.selectedToken);
    }

    /** Current display symbol */
    get currentSymbol(): string {
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
        return Object.entries(TOKENS)
            .filter(([id, token]) => id === 'native' || token.contracts['tron'])
            .map(([id]) => id as TokenId);
    }


    /** Select active token */
    setSelectedToken = (token: TokenId) => {
        this.selectedToken = token;
        hapticsStore.play('tap');
    };

    /** Fetch balances for all chains and tokens */
    fetchBalances = async () => {
        console.log('[WalletStore] fetchBalances called', {
            isConnected: authStore.isConnected,
            walletType: authStore.walletType,
            isRefreshing: this.isRefreshing,
        });

        if (!authStore.isConnected) {
            console.log('[WalletStore] Not connected, skipping');
            return;
        }

        // Only Web3Auth has access to private key for both chains
        if (authStore.walletType !== 'web3auth') {
            console.warn('[WalletStore] Multi-chain balance requires Web3Auth');
            return;
        }

        const provider = web3AuthService.provider;
        console.log('[WalletStore] Provider:', provider ? 'exists' : 'null');
        if (!provider) return;

        runInAction(() => {
            this.isRefreshing = true;
        });

        await this.fetchTronBalance(provider);
        console.log('[WalletStore] TRX balance done');

        await this.fetchTokenBalance(provider, 'tron', 'usdt');
        console.log('[WalletStore] USDT balance done');

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
            const balance = await getTrc20Balance(provider, contractAddress, tokenConfig.decimals);

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
            const contractAddress = getTokenAddress(this.selectedToken, 'tron');

            // Validate Tron address
            if (!toAddress.startsWith('T') || toAddress.length !== 34) {
                throw new Error('Неверный TRON адрес (должен начинаться с T)');
            }

            if (this.selectedToken === 'native') {
                // Native TRX transfer
                const result = await sendTronTx(provider, toAddress, Number(amount));
                const parsed = JSON.parse(result);
                txHash = parsed.txid || parsed.transaction?.txID || result;
            } else {
                // TRC-20 transfer (USDT)
                if (!contractAddress) throw new Error('Токен недоступен');
                txHash = await sendTrc20(
                    provider,
                    contractAddress,
                    toAddress,
                    amount,
                    tokenConfig.decimals
                );
            }

            // Record transaction
            const tx: Transaction = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                chainId: 'tron',
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
        this.selectedToken = 'native';
        this.isRefreshing = false;
        this.isSending = false;
        this.sendError = null;
    };
}


// Singleton Export


export const walletStore = new WalletStore();
