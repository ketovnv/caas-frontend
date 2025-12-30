import { Web3AuthNoModal } from '@web3auth/no-modal';
import { AuthAdapter } from '@web3auth/auth-adapter';
import { WALLET_ADAPTERS, type IProvider } from '@web3auth/base';
import { WEB3AUTH_CONFIG, privateKeyProvider } from './config';
import type { LoginProvider } from './types';

// ============================================================================
// Web3Auth Service (Singleton) - v9 API
// ============================================================================

class Web3AuthService {
  private instance: Web3AuthNoModal | null = null;
  private _isInitialized = false;
  private _initPromise: Promise<Web3AuthNoModal> | null = null;
  private _isConnecting = false;

  // ─────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────

  async init(): Promise<Web3AuthNoModal> {
    if (this.instance && this._isInitialized) {
      return this.instance;
    }

    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._doInit();
    return this._initPromise;
  }

  private async _doInit(): Promise<Web3AuthNoModal> {
    this.instance = new Web3AuthNoModal(WEB3AUTH_CONFIG);

    // Configure Auth adapter for social logins (v9)
    const authAdapter = new AuthAdapter({
      privateKeyProvider,
      adapterSettings: {
        uxMode: 'popup',
      },
    });

    this.instance.configureAdapter(authAdapter);

    await this.instance.init();
    this._isInitialized = true;

    console.log('[Web3Auth] Initialized', {
      connected: this.instance.connected,
      provider: this.instance.provider ? 'yes' : 'no',
    });

    return this.instance;
  }

  // ─────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isConnected(): boolean {
    return this.instance?.connected ?? false;
  }

  get provider(): IProvider | null {
    return this.instance?.provider ?? null;
  }

  getInstance(): Web3AuthNoModal | null {
    return this.instance;
  }

  // ─────────────────────────────────────────────────────────
  // Connection Methods (v9 API)
  // ─────────────────────────────────────────────────────────

  async connectWithProvider(
    provider: LoginProvider,
    options?: { email?: string; phone?: string }
  ): Promise<IProvider | null> {
    if (this._isConnecting) {
      console.warn('[Web3Auth] Already connecting');
      return null;
    }

    if (!this.instance) {
      await this.init();
    }

    if (!this.instance) {
      throw new Error('Web3Auth not initialized');
    }

    // Already connected
    if (this.instance.connected && this.instance.provider) {
      try {
        await this.instance.getUserInfo();
        console.log('[Web3Auth] Already connected');
        return this.instance.provider;
      } catch {
        console.log('[Web3Auth] Stale session, logging out');
        await this.instance.logout().catch(() => {});
      }
    }

    this._isConnecting = true;

    try {
      console.log('[Web3Auth] Connecting with:', provider);

      // Build login params for v9
      const loginParams: Record<string, unknown> = {
        loginProvider: provider,
      };

      // Add hints for passwordless methods
      if (provider === 'email_passwordless' && options?.email) {
        loginParams.extraLoginOptions = { login_hint: options.email };
      }
      if (provider === 'sms_passwordless' && options?.phone) {
        loginParams.extraLoginOptions = { login_hint: options.phone };
      }

      const web3authProvider = await this.instance.connectTo(
        WALLET_ADAPTERS.AUTH,
        loginParams
      );

      return web3authProvider;
    } finally {
      this._isConnecting = false;
    }
  }

  async getUserInfo() {
    if (!this.instance?.connected) {
      return null;
    }

    try {
      return await this.instance.getUserInfo();
    } catch (error) {
      console.warn('[Web3Auth] getUserInfo failed:', error);
      return null;
    }
  }

  /**
   * Get private key (works with v9 + EthereumPrivateKeyProvider)
   */
  async getPrivateKey(): Promise<string | null> {
    if (!this.provider) return null;

    const methods = ['eth_private_key', 'private_key'];

    for (const method of methods) {
      try {
        const privateKey = await this.provider.request({ method });
        if (privateKey) {
          console.log('[Web3Auth] Got private key via:', method);
          return privateKey as string;
        }
      } catch {
        // Try next
      }
    }

    console.warn('[Web3Auth] getPrivateKey: no method worked');
    return null;
  }

  async disconnect(): Promise<void> {
    if (!this.instance) return;

    try {
      await this.instance.logout();
    } catch (error) {
      console.warn('[Web3Auth] logout failed:', error);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Session Management
  // ─────────────────────────────────────────────────────────

  async checkSession(): Promise<boolean> {
    if (!this.instance) {
      await this.init();
    }

    const isConnected = this.instance?.connected ?? false;
    console.log('[Web3Auth] checkSession:', { isConnected, hasProvider: !!this.provider });

    if (!isConnected || !this.provider) {
      return false;
    }

    try {
      const userInfo = await this.instance?.getUserInfo();
      const isValid = !!userInfo;
      console.log('[Web3Auth] Session valid:', isValid);
      return isValid;
    } catch (error) {
      console.warn('[Web3Auth] Session invalid:', error);
      try {
        await this.instance?.logout();
      } catch {
        // Ignore
      }
      return false;
    }
  }

  async handleRedirectCallback(): Promise<IProvider | null> {
    if (!this.instance) {
      await this.init();
    }
    return this.provider;
  }
}

// Export singleton
export const web3AuthService = new Web3AuthService();

// Export types
export * from './types';
export * from './config';
