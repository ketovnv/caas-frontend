import { Web3AuthNoModal, WALLET_CONNECTORS, AUTH_CONNECTION } from '@web3auth/no-modal';
import type { IProvider } from '@web3auth/no-modal';
import { WEB3AUTH_CONFIG, AUTH_CONNECTION_IDS } from './config';
import type { LoginProvider } from './types';

// Re-export IProvider from @web3auth/no-modal
export type { IProvider } from '@web3auth/no-modal';

// ============================================================================
// Web3Auth Service (Singleton) - v10 API
// ============================================================================

// Map our LoginProvider strings to AUTH_CONNECTION values
const AUTH_CONNECTION_MAP: Record<LoginProvider, string> = {
  google: AUTH_CONNECTION.GOOGLE,
  facebook: AUTH_CONNECTION.FACEBOOK,
  twitter: AUTH_CONNECTION.TWITTER,
  discord: AUTH_CONNECTION.DISCORD,
  github: AUTH_CONNECTION.GITHUB,
  apple: AUTH_CONNECTION.APPLE,
  email_passwordless: AUTH_CONNECTION.EMAIL_PASSWORDLESS,
  sms_passwordless: AUTH_CONNECTION.SMS_PASSWORDLESS,
};

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

    // Subscribe to error events
    this.instance.on('errored', (error) => {
      console.error('[Web3Auth] Error:', error);
    });

    await this.instance.init();
    this._isInitialized = true;

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
  // Connection Methods (v10 API)
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
        return this.instance.provider;
      } catch {
        await this.instance.logout().catch(() => {});
      }
    }

    this._isConnecting = true;

    try {
      // Get the proper AUTH_CONNECTION value
      const authConnection = AUTH_CONNECTION_MAP[provider];
      if (!authConnection) {
        throw new Error(`Unknown provider: ${provider}`);
      }

      // Build login params for v10 API
      const loginParams: Record<string, unknown> = {
        authConnection,
      };

      // Add authConnectionId from Dashboard if configured
      const authConnectionId = AUTH_CONNECTION_IDS[provider];
      if (authConnectionId) {
        loginParams.authConnectionId = authConnectionId;
      }

      // Add hints for passwordless methods
      if (provider === 'email_passwordless' && options?.email) {
        loginParams.extraLoginOptions = { login_hint: options.email };
      }
      if (provider === 'sms_passwordless' && options?.phone) {
        loginParams.extraLoginOptions = { login_hint: options.phone };
      }

      const web3authProvider = await this.instance.connectTo(
        WALLET_CONNECTORS.AUTH,
        loginParams
      );

      return web3authProvider;
    } catch (error) {
      throw error;
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
   * Get private key (v10 API)
   * Uses 'private_key' method - the standard for v10
   */
  async getPrivateKey(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const privateKey = await this.provider.request({ method: 'private_key' });
      if (privateKey) {
        return privateKey as string;
      }
    } catch (error) {
      console.warn('[Web3Auth] getPrivateKey failed:', error);
    }

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

  /**
   * Wait for session restoration (v10 restores asynchronously after init)
   * Returns user info if session restored, null otherwise
   */
  private _waitForSessionRestore(timeoutMs = 10000): Promise<Record<string, unknown> | null> {
    return new Promise((resolve) => {
      // Check if already fully ready
      if (this.instance?.provider) {
        this.instance.getUserInfo()
          .then(info => resolve(info as Record<string, unknown>))
          .catch(() => resolve(null));
        return;
      }

      // Not connected at all - no session
      if (!this.instance?.connected) {
        resolve(null);
        return;
      }

      let resolved = false;

      // Listen for connected event (fires when provider is truly ready)
      const onConnected = async (data: { reconnected?: boolean }) => {
        if (resolved) return;

        if (data?.reconnected) {
          resolved = true;
          cleanup();

          // Small delay to ensure internal state is ready
          await new Promise(r => setTimeout(r, 100));

          try {
            const userInfo = await this.instance?.getUserInfo();
            resolve(userInfo as Record<string, unknown>);
          } catch {
            resolve(null);
          }
        }
      };

      // Cleanup function
      const cleanup = () => {
        this.instance?.off('connected', onConnected);
        clearTimeout(timeoutId);
      };

      this.instance?.on('connected', onConnected);

      // Timeout
      const timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(null);
      }, timeoutMs);
    });
  }

  async checkSession(): Promise<boolean> {
    if (!this.instance) {
      await this.init();
    }

    const isConnected = this.instance?.connected ?? false;

    // Not connected - no session
    if (!isConnected) {
      return false;
    }

    // Already have provider - check session directly
    if (this.provider) {
      try {
        const userInfo = await this.instance?.getUserInfo();
        return !!userInfo;
      } catch {
        return false;
      }
    }

    // v10: connected=true but no provider yet
    // Wait for the 'connected' event with reconnected=true
    const userInfo = await this._waitForSessionRestore();
    return !!userInfo;
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
