/**
 * 🔗 Reown AppKit Service - Headless Integration
 *
 * WalletConnect через Reown БЕЗ модального окна.
 * Используем programmatic API для полного контроля UI.
 *
 * @see https://docs.reown.com/appkit/javascript/core/actions
 */

// ============================================================================
// Types
// ============================================================================

export type ReownWalletId =
  | 'walletConnect'  // QR код
  | 'metamask'
  | 'trust'
  | 'coinbase'
  | 'rainbow'
  | 'phantom'
  | 'okx'
  | 'bitget'
  | 'binance'
  | 'uniswap'
  | 'zerion'
  | 'argent'
  | 'ledger'
  | 'safe';

export interface ReownState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

type StateCallback = (state: ReownState) => void;

// ============================================================================
// Reown Service (Singleton)
// ============================================================================

class ReownService {
  private _modal: any = null;
  private _walletButton: any = null;
  private _isInitialized = false;
  private _initPromise: Promise<void> | null = null;
  private _initFailed = false;

  // State
  private _address: string | null = null;
  private _chainId: number | null = null;
  private _isConnected = false;

  // Subscribers
  private _subscribers: Set<StateCallback> = new Set();

  // ─────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────

  async init(): Promise<void> {
    // Already initialized or failed
    if (this._isInitialized || this._initFailed) return;

    // Already initializing
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._doInit();
    return this._initPromise;
  }

  private async _doInit(): Promise<void> {
    const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

    // Validate project ID exists and looks valid (alphanumeric, 32 chars)
    if (!projectId || !/^[a-f0-9]{32}$/i.test(projectId)) {
      // Silent - Reown is optional
      this._initFailed = true;
      return;
    }

    try {
      // Dynamic imports
      const { createAppKit } = await import('@reown/appkit');
      const { EthersAdapter } = await import('@reown/appkit-adapter-ethers');
      const networks = await import('@reown/appkit/networks');

      const metadata = {
        name: 'CaaS Wallet',
        description: 'Crypto-as-a-Service',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`]
      };

      // Supported networks (cast to tuple type for AppKit)
      const supportedNetworks = [
        networks.mainnet,
        networks.polygon,
        networks.bsc,
        networks.arbitrum,
        networks.optimism,
      ] as const;

      // Create AppKit (headless mode)
      this._modal = createAppKit({
        adapters: [new EthersAdapter()],
        networks: supportedNetworks as any,
        projectId,
        metadata,
        features: {
          analytics: false,
          email: false,
          socials: false,
        },
        enableWallets: true,
        enableEIP6963: true,
      });

      // Subscribe to state changes - with fallback
      this._setupSubscriptions();

      // Load wallet button (lazy, non-blocking)
      this._loadWalletButton().catch(() => {});

      this._isInitialized = true;
      console.log('[Reown] ✅ Initialized');

    } catch (error) {
      console.error('[Reown] ❌ Init failed:', error);
      this._initFailed = true;
      this._initPromise = null;
      // Don't throw - Reown is optional
    }
  }

  private _setupSubscriptions(): void {
    if (!this._modal) return;

    // Try subscribeProvider first
    if (typeof this._modal.subscribeProvider === 'function') {
      try {
        this._modal.subscribeProvider((state: any) => {
          this._updateState(state);
        });
        console.log('[Reown] Subscribed via subscribeProvider');
        return;
      } catch (e) {
        console.warn('[Reown] subscribeProvider failed:', e);
      }
    }

    // Fallback: poll state
    console.log('[Reown] Using polling fallback for state');
    setInterval(() => {
      if (!this._modal) return;

      const newState = {
        address: this._modal.getAddress?.() ?? null,
        chainId: this._modal.getChainId?.() ?? null,
        isConnected: this._modal.getIsConnected?.() ?? false,
      };

      // Only update if changed
      if (
        newState.address !== this._address ||
        newState.chainId !== this._chainId ||
        newState.isConnected !== this._isConnected
      ) {
        this._updateState(newState);
      }
    }, 1000);
  }

  private _updateState(state: any): void {
    this._address = state.address ?? null;
    this._chainId = state.chainId ?? null;
    this._isConnected = state.isConnected ?? false;

    this._notifySubscribers();

    if (this._address) {
      console.log('[Reown] State:', {
        address: this._address.slice(0, 10) + '...',
        chainId: this._chainId,
        connected: this._isConnected
      });
    }
  }

  private async _loadWalletButton(): Promise<void> {
    try {
      const { createAppKitWalletButton } = await import('@reown/appkit-wallet-button');
      this._walletButton = createAppKitWalletButton();
      console.log('[Reown] Wallet button loaded');
    } catch (error) {
      // Wallet button is optional
    }
  }

  // ─────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get address(): string | null {
    return this._address;
  }

  get chainId(): number | null {
    return this._chainId;
  }

  get isAvailable(): boolean {
    const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
    // Valid Reown project ID: 32 hex characters
    return /^[a-f0-9]{32}$/i.test(projectId ?? '') && !this._initFailed;
  }

  get state(): ReownState {
    return {
      address: this._address,
      chainId: this._chainId,
      isConnected: this._isConnected,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Subscriptions
  // ─────────────────────────────────────────────────────────

  subscribe(callback: StateCallback): () => void {
    this._subscribers.add(callback);
    // Immediate callback with current state
    callback(this.state);

    return () => {
      this._subscribers.delete(callback);
    };
  }

  private _notifySubscribers(): void {
    const state = this.state;
    this._subscribers.forEach(cb => cb(state));
  }

  // ─────────────────────────────────────────────────────────
  // Connection Methods
  // ─────────────────────────────────────────────────────────

  /**
   * 📱 Connect via WalletConnect QR
   * Opens minimal QR view - для мобильных кошельков
   */
  async connectWalletConnect(): Promise<string | null> {
    await this.init();

    if (!this._modal) {
      throw new Error('Reown not initialized');
    }

    // Открываем только QR view
    this._modal.open({ view: 'Connect' });

    // Ждём подключения
    return this._waitForConnection();
  }

  /**
   * 🦊 Connect specific wallet
   * Для конкретного кошелька через wallet-button API
   */
  async connectWallet(walletId: ReownWalletId): Promise<string | null> {
    await this.init();

    // Если есть wallet button - используем его
    if (this._walletButton?.isReady?.()) {
      console.log(`[Reown] Connecting via wallet-button: ${walletId}`);
      this._walletButton.connect(walletId);
      return this._waitForConnection();
    }

    // Fallback - открываем modal на нужном кошельке
    if (walletId === 'walletConnect') {
      return this.connectWalletConnect();
    }

    // Для других кошельков открываем AllWallets view
    this._modal?.open({ view: 'AllWallets' });
    return this._waitForConnection();
  }

  /**
   * Wait for connection with timeout
   */
  private _waitForConnection(timeoutMs = 120000): Promise<string | null> {
    return new Promise((resolve) => {
      // Уже подключены?
      if (this._isConnected && this._address) {
        resolve(this._address);
        return;
      }

      const startTime = Date.now();

      const unsubscribe = this.subscribe((state) => {
        if (state.isConnected && state.address) {
          unsubscribe();
          resolve(state.address);
        }
      });

      // Timeout
      const checkTimeout = setInterval(() => {
        if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkTimeout);
          unsubscribe();
          resolve(null);
        }

        // Если modal закрыт без подключения
        const modalState = this._modal?.getState?.();
        if (modalState && !modalState.open && !this._isConnected) {
          clearInterval(checkTimeout);
          unsubscribe();
          resolve(null);
        }
      }, 500);
    });
  }

  /**
   * Switch network
   */
  async switchNetwork(chainId: number): Promise<void> {
    await this.init();

    if (!this._modal) return;

    try {
      // AppKit handles network switching
      const networks = await import('@reown/appkit/networks');
      const network = Object.values(networks).find(
        (n: any) => n?.id === chainId
      );

      if (network) {
        this._modal.switchNetwork(network);
      }
    } catch (error) {
      console.error('[Reown] Switch network failed:', error);
    }
  }

  /**
   * Open network selector
   */
  openNetworkSelector(): void {
    this._modal?.open({ view: 'Networks' });
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    if (!this._modal) return;

    try {
      // Close modal if open
      this._modal.close();

      // Disconnect
      await this._modal.adapter?.connectionControllerClient?.disconnect();

      this._address = null;
      this._chainId = null;
      this._isConnected = false;
      this._notifySubscribers();

      console.log('[Reown] Disconnected');
    } catch (error) {
      console.warn('[Reown] Disconnect error:', error);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Provider Access
  // ─────────────────────────────────────────────────────────

  /**
   * Get EIP-1193 provider
   */
  getProvider(): any {
    return this._modal?.getWalletProvider?.() ?? null;
  }

  /**
   * Get wallet info
   */
  getWalletInfo(): { name?: string; icon?: string } | null {
    return this._modal?.getWalletInfo?.() ?? null;
  }

  /**
   * Get AppKit instance (for advanced usage)
   */
  getModal(): any {
    return this._modal;
  }
}

// Export singleton
export const reownService = new ReownService();
