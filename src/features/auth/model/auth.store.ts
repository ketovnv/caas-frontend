import { makeAutoObservable, runInAction } from 'mobx';
import { web3AuthService, type LoginProvider, type AuthStatus, type IProvider, type UserInfo, type WalletProvider } from '@/shared/lib/web3auth';
import { tronLinkService } from '@/shared/lib/tronlink';
import { metaMaskService } from '@/shared/lib/metamask';
import { reownService, type ReownWalletId } from '@/shared/lib/reown';
import { hapticsStore } from '@/shared/lib/haptics';
import { router } from 'app/router';
import { walletStore } from 'entities/wallet';

// ============================================================================
// Types
// ============================================================================

type WalletType = 'web3auth' | 'tronlink' | 'metamask' | 'reown' | null;

// ============================================================================
// Auth Store
// ============================================================================

class AuthStore {
  // State
  status: AuthStatus = 'initializing';
  provider: IProvider | null = null;
  userInfo: Partial<UserInfo> | null = null;
  error: Error | null = null;
  selectedProvider: WalletProvider | null = null;

  // External wallet state
  walletType: WalletType = null;
  walletAddress: string | null = null;
  chainId: number | null = null;

  // UI State (для LoginOptions)
  activeButtonId: string | null = null;
  inputMode: 'email' | 'phone' | null = null;
  emailInput = '';
  phoneInput = '';

  constructor() {
    makeAutoObservable(this);
    this.initialize();
  }

  // ─────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────

  get isConnected(): boolean {
    return this.status === 'connected' && (this.provider !== null || this.walletAddress !== null);
  }

  get isLoading(): boolean {
    return this.status === 'initializing' || this.status === 'connecting';
  }

  get isReady(): boolean {
    return this.status === 'ready';
  }

  get displayName(): string | null {
    // For external wallets, show shortened address
    if (this.walletAddress) {
      return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
    }
    if (!this.userInfo) return null;
    return this.userInfo.name || this.userInfo.email || 'User';
  }

  get profileImage(): string | null {
    return this.userInfo?.profileImage || null;
  }

  get email(): string | null {
    return this.userInfo?.email || null;
  }

  /** Check if WalletConnect is available (Reown configured) */
  get isWalletConnectAvailable(): boolean {
    return reownService.isAvailable;
  }

  // ─────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────

  private async initialize() {
    try {
      // Init Web3Auth
      await web3AuthService.init();

      // Init Reown (non-blocking)
      reownService.init().catch(() => {});

      // Check for existing session
      const hasSession = await web3AuthService.checkSession();

      if (hasSession) {
        const userInfo = await web3AuthService.getUserInfo();

        runInAction(() => {
          this.status = 'connected';
          this.provider = web3AuthService.provider;
          this.userInfo = userInfo;
          this.walletType = 'web3auth';
        });

        // Fetch balances after session restore
        walletStore.fetchBalances();

        // Welcome back haptic
        hapticsStore.play('success');
      } else {
        runInAction(() => {
          this.status = 'ready';
        });
      }

      // Subscribe to Reown state changes
      this._subscribeToReown();

    } catch (error) {
      runInAction(() => {
        this.status = 'ready';
        this.error = error as Error;
      });
    }
  }

  /** Subscribe to Reown connection changes */
  private _subscribeToReown() {
    reownService.subscribe((state) => {
      // Only update if we're using Reown
      if (this.walletType !== 'reown') return;

      runInAction(() => {
        this.walletAddress = state.address;
        this.chainId = state.chainId;
        
        if (!state.isConnected && this.status === 'connected') {
          // Disconnected externally
          this.status = 'ready';
          this.walletType = null;
          this.walletAddress = null;
          this.userInfo = null;
        }
      });
    });
  }

  // ─────────────────────────────────────────────────────────
  // Connection Actions
  // ─────────────────────────────────────────────────────────

  /**
   * Connect with social provider (no-modal - custom UI)
   * Requires authConnectionId configured in Dashboard
   */
  connect = async (
    provider: LoginProvider,
    options?: { email?: string; phone?: string }
  ) => {
    if (this.status === 'connecting') return;

    hapticsStore.playWeb3('connectStart');

    runInAction(() => {
      this.status = 'connecting';
      this.selectedProvider = provider;
      this.error = null;
    });

    try {
      const web3authProvider = await web3AuthService.connectWithProvider(
        provider,
        options
      );

      if (!web3authProvider) {
        throw new Error('Connection failed - no provider returned');
      }

      const userInfo = await web3AuthService.getUserInfo();

      runInAction(() => {
        this.status = 'connected';
        this.provider = web3authProvider;
        this.userInfo = userInfo;
        this.selectedProvider = null;
        this.walletType = 'web3auth';
      });

      // Fetch balances after connect
      walletStore.fetchBalances();

      hapticsStore.playWeb3('connectSuccess');

      // Redirect to wallet after successful login
      router.navigate('home');

    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error as Error;
      });

      hapticsStore.playWeb3('connectError');
    }
  };

  /**
   * Connect with email (passwordless)
   */
  connectWithEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      hapticsStore.playWeb3('invalidInput');
      return;
    }

    await this.connect('email_passwordless', { email });
  };

  /**
   * Connect with phone (SMS)
   */
  connectWithPhone = async (phone: string) => {
    if (!phone || phone.length < 10) {
      hapticsStore.playWeb3('invalidInput');
      return;
    }

    await this.connect('sms_passwordless', { phone });
  };

  // ─────────────────────────────────────────────────────────
  // External Wallet Connections
  // ─────────────────────────────────────────────────────────

  /**
   * Connect with TronLink (uses async detection)
   */
  connectTronLink = async () => {
    if (this.status === 'connecting') return;

    hapticsStore.playWeb3('connectStart');

    runInAction(() => {
      this.status = 'connecting';
      this.selectedProvider = 'tronlink';
      this.error = null;
    });

    try {
      // tronLinkService.connect() now waits for extension injection
      const address = await tronLinkService.connect();

      if (!address) {
        throw new Error('TronLink connection failed');
      }

      runInAction(() => {
        this.status = 'connected';
        this.walletType = 'tronlink';
        this.walletAddress = address;
        this.userInfo = { name: 'TronLink Wallet' };
        this.selectedProvider = null;
      });

      hapticsStore.playWeb3('connectSuccess');

      // Redirect to wallet after successful login
      router.navigate('home');

    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error as Error;
      });

      hapticsStore.playWeb3('connectError');
    }
  };

  /**
   * Connect with MetaMask (uses async detection)
   */
  connectMetaMask = async () => {
    if (this.status === 'connecting') return;

    hapticsStore.playWeb3('connectStart');

    runInAction(() => {
      this.status = 'connecting';
      this.selectedProvider = 'metamask';
      this.error = null;
    });

    try {
      // metaMaskService.connect() now waits for extension injection
      const address = await metaMaskService.connect();

      if (!address) {
        throw new Error('MetaMask connection failed');
      }

      runInAction(() => {
        this.status = 'connected';
        this.walletType = 'metamask';
        this.walletAddress = address;
        this.userInfo = { name: 'MetaMask Wallet' };
        this.selectedProvider = null;
      });

      hapticsStore.playWeb3('connectSuccess');

      // Setup listeners for account/chain changes
      this.setupMetaMaskListeners();

      // Redirect to wallet after successful login
      router.navigate('home');

    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error as Error;
      });

      hapticsStore.playWeb3('connectError');
    }
  };

  /**
   * Setup MetaMask event listeners
   */
  private setupMetaMaskListeners() {
    // Account changed
    metaMaskService.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        this.disconnect();
      } else if (accounts[0] !== this.walletAddress) {
        // Account switched
        runInAction(() => {
          this.walletAddress = accounts[0] ?? null;
        });
      }
    });

    // Chain changed
    metaMaskService.onChainChanged(() => {
      // Could reload or update UI here
    });
  }

  // ─────────────────────────────────────────────────────────
  // Reown / WalletConnect
  // ─────────────────────────────────────────────────────────

  /**
   * 📱 Connect via WalletConnect QR (Reown)
   * Opens QR code for mobile wallets
   */
  connectWalletConnect = async () => {
    if (this.status === 'connecting') return;
    if (!reownService.isAvailable) {
      console.warn('[AuthStore] Reown not configured');
      return;
    }

    hapticsStore.playWeb3('connectStart');

    runInAction(() => {
      this.status = 'connecting';
      this.selectedProvider = 'walletconnect';
      this.error = null;
    });

    try {
      const address = await reownService.connectWalletConnect();

      if (!address) {
        // User cancelled
        runInAction(() => {
          this.status = 'ready';
          this.selectedProvider = null;
        });
        return;
      }

      const walletInfo = reownService.getWalletInfo();

      runInAction(() => {
        this.status = 'connected';
        this.walletType = 'reown';
        this.walletAddress = address;
        this.chainId = reownService.chainId;
        this.userInfo = {
          name: walletInfo?.name || 'WalletConnect'
        };
        this.selectedProvider = null;
      });

      hapticsStore.playWeb3('connectSuccess');

      // Redirect to wallet after successful login
      router.navigate('home');

    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error as Error;
      });

      hapticsStore.playWeb3('connectError');
    }
  };

  /**
   * 🦊 Connect specific wallet via Reown
   * For wallets like Trust, Coinbase, Rainbow etc.
   */
  connectReownWallet = async (walletId: ReownWalletId) => {
    if (this.status === 'connecting') return;
    if (!reownService.isAvailable) {
      console.warn('[AuthStore] Reown not configured');
      return;
    }

    hapticsStore.playWeb3('connectStart');

    runInAction(() => {
      this.status = 'connecting';
      this.selectedProvider = walletId as WalletProvider;
      this.error = null;
    });

    try {
      const address = await reownService.connectWallet(walletId);

      if (!address) {
        runInAction(() => {
          this.status = 'ready';
          this.selectedProvider = null;
        });
        return;
      }

      const walletInfo = reownService.getWalletInfo();

      runInAction(() => {
        this.status = 'connected';
        this.walletType = 'reown';
        this.walletAddress = address;
        this.chainId = reownService.chainId;
        this.userInfo = {
          name: walletInfo?.name || walletId
        };
        this.selectedProvider = null;
      });

      hapticsStore.playWeb3('connectSuccess');

      // Redirect to wallet after successful login
      router.navigate('home');

    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error as Error;
      });

      hapticsStore.playWeb3('connectError');
    }
  };

  /**
   * Switch network (for Reown connections)
   */
  switchNetwork = async (chainId: number) => {
    if (this.walletType !== 'reown') return;
    
    await reownService.switchNetwork(chainId);
  };

  /**
   * Open network selector (Reown UI)
   */
  openNetworkSelector = () => {
    if (this.walletType !== 'reown') return;
    
    reownService.openNetworkSelector();
  };

  // ─────────────────────────────────────────────────────────
  // Disconnect
  // ─────────────────────────────────────────────────────────

  /**
   * Disconnect
   */
  disconnect = async () => {
    hapticsStore.play('tap');

    runInAction(() => {
      this.status = 'disconnecting';
    });

    try {
      // Disconnect based on wallet type
      switch (this.walletType) {
        case 'tronlink':
          tronLinkService.disconnect();
          break;
        case 'metamask':
          metaMaskService.disconnect();
          break;
        case 'reown':
          await reownService.disconnect();
          break;
        case 'web3auth':
          await web3AuthService.disconnect();
          break;
      }

      runInAction(() => {
        this.status = 'ready';
        this.provider = null;
        this.userInfo = null;
        this.selectedProvider = null;
        this.error = null;
        this.walletType = null;
        this.walletAddress = null;
        this.chainId = null;
      });

      // Haptic: disconnected
      hapticsStore.playWeb3('disconnect');

    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error as Error;
      });
    }
  };

  /**
   * Clear error state
   */
  clearError = () => {
    runInAction(() => {
      this.error = null;
      if (this.status === 'error') {
        this.status = 'ready';
      }
    });
  };

  /**
   * Retry last connection
   */
  retry = async () => {
    if (!this.selectedProvider) return;

    hapticsStore.play('tap');
    this.clearError();

    // Handle external wallets
    switch (this.selectedProvider) {
      case 'tronlink':
        await this.connectTronLink();
        break;
      case 'metamask':
        await this.connectMetaMask();
        break;
      case 'walletconnect':
        await this.connectWalletConnect();
        break;
      default:
        // Check if it's a Reown wallet ID
        const reownWallets: ReownWalletId[] = [
          'trust', 'coinbase', 'rainbow', 'phantom', 
          'okx', 'bitget', 'binance', 'uniswap', 'zerion', 'argent'
        ];
        if (reownWallets.includes(this.selectedProvider as ReownWalletId)) {
          await this.connectReownWallet(this.selectedProvider as ReownWalletId);
        } else {
          await this.connect(this.selectedProvider as LoginProvider);
        }
    }
  };

  // ─────────────────────────────────────────────────────────
  // Provider Selection (for UI/animations)
  // ─────────────────────────────────────────────────────────

  selectProvider = (provider: WalletProvider) => {
    this.selectedProvider = provider;
    hapticsStore.playWeb3('providerSelect');
  };

  hoverProvider = () => {
    hapticsStore.playWeb3('providerHover');
  };

  // ─────────────────────────────────────────────────────────
  // UI Actions (для LoginOptions)
  // ─────────────────────────────────────────────────────────

  setActiveButton = (id: string | null) => {
    this.activeButtonId = id;
  };

  setInputMode = (mode: 'email' | 'phone' | null) => {
    this.inputMode = mode;
  };

  setEmailInput = (value: string) => {
    this.emailInput = value;
  };

  setPhoneInput = (value: string) => {
    this.phoneInput = value;
  };

  /** Computed: текущее значение инпута */
  get currentInput(): string {
    return this.inputMode === 'email' ? this.emailInput : this.phoneInput;
  }

  /** Submit email/phone */
  submitInput = () => {
    if (this.inputMode === 'email' && this.emailInput.trim()) {
      this.connectWithEmail(this.emailInput);
    } else if (this.inputMode === 'phone' && this.phoneInput.trim()) {
      this.connectWithPhone(this.phoneInput);
    }
  };

  /** Отмена ввода */
  cancelInput = () => {
    this.inputMode = null;
  };
}

export const authStore = new AuthStore();
