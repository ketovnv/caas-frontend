import {
  Web3AuthNoModal,
  WALLET_CONNECTORS,
  AUTH_CONNECTION,
  type IProvider,
} from '@web3auth/no-modal';
import { WEB3AUTH_CONFIG, AUTH_CONNECTION_IDS } from './config';
import type { LoginProvider } from './types';

// ============================================================================
// Provider to AUTH_CONNECTION mapping
// ============================================================================

const PROVIDER_TO_AUTH_CONNECTION: Record<LoginProvider, string> = {
  google: AUTH_CONNECTION.GOOGLE,
  apple: AUTH_CONNECTION.APPLE,
  twitter: AUTH_CONNECTION.TWITTER,
  discord: AUTH_CONNECTION.DISCORD,
  github: AUTH_CONNECTION.GITHUB,
  facebook: AUTH_CONNECTION.FACEBOOK,
  email_passwordless: AUTH_CONNECTION.EMAIL_PASSWORDLESS,
  sms_passwordless: AUTH_CONNECTION.SMS_PASSWORDLESS,
};

// ============================================================================
// Web3Auth Service (Singleton)
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

  /**
   * Получить инстанс Web3Auth (для прямого использования)
   */
  getInstance(): Web3AuthNoModal | null {
    return this.instance;
  }

  // ─────────────────────────────────────────────────────────
  // Connection Methods
  // ─────────────────────────────────────────────────────────

  /**
   * Connect with social provider (no-modal - custom UI)
   * Requires authConnectionId from Web3Auth Dashboard
   */
  async connectWithProvider(
    provider: LoginProvider,
    options?: { email?: string; phone?: string }
  ): Promise<IProvider | null> {
    // Guard against multiple simultaneous connections
    if (this._isConnecting) {
      console.warn('[Web3Auth] Already connecting, ignoring duplicate call');
      return null;
    }

    if (!this.instance) {
      await this.init();
    }

    if (!this.instance) {
      throw new Error('Web3Auth not initialized');
    }

    const authConnection = PROVIDER_TO_AUTH_CONNECTION[provider];
    const authConnectionId = AUTH_CONNECTION_IDS[provider];

    if (!authConnectionId) {
      throw new Error(
        `Missing authConnectionId for ${provider}. ` +
        `Configure VITE_W3A_${provider.toUpperCase()}_CONNECTION_ID in .env ` +
        `or set up connection in Web3Auth Dashboard.`
      );
    }

    // Build login params for V10 API
    const loginParams: Record<string, unknown> = {
      authConnection,
      authConnectionId,
    };

    // Add login_hint for passwordless methods
    if (provider === 'email_passwordless' && options?.email) {
      loginParams.login_hint = options.email;
    }
    if (provider === 'sms_passwordless' && options?.phone) {
      loginParams.login_hint = options.phone;
    }

    console.log('[Web3Auth] Connecting with:', { provider, authConnectionId });

    // If already connected with valid provider, return it
    if (this.instance.connected && this.instance.provider) {
      // Verify connection is actually valid by checking provider
      try {
        await this.instance.getUserInfo();
        console.log('[Web3Auth] Already connected, returning existing provider');
        return this.instance.provider;
      } catch {
        // Stale session - need to logout first
        console.log('[Web3Auth] Stale session detected, logging out first');
        await this.instance.logout().catch(() => {});
      }
    }

    this._isConnecting = true;
    try {
      const web3authProvider = await this.instance.connectTo(
        WALLET_CONNECTORS.AUTH,
        loginParams
      );
      return web3authProvider;
    } finally {
      this._isConnecting = false;
    }
  }

  /**
   * Get user info after connection
   */
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
   * Get private key (for TRON)
   * Web3Auth v10 uses eth_private_key method
   */
  async getPrivateKey(): Promise<string | null> {
    if (!this.provider) return null;

    // Try different method names (varies by Web3Auth version/adapter)
    const methods = ['eth_private_key', 'private_key', 'solana_private_key'];

    for (const method of methods) {
      try {
        const privateKey = await this.provider.request({ method });
        if (privateKey) {
          console.log('[Web3Auth] Got private key via:', method);
          return privateKey as string;
        }
      } catch {
        // Try next method
      }
    }

    console.warn('[Web3Auth] getPrivateKey: no supported method found');
    return null;
  }

  /**
   * Disconnect
   */
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
    return this.instance?.connected ?? false;
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
