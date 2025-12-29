// ============================================================================
// TronLink Service - Improved Detection
// ============================================================================

// TronLink injects these globals
declare global {
  interface Window {
    tronWeb?: {
      ready: boolean;
      defaultAddress: {
        base58: string;
        hex: string;
      };
      trx: {
        getBalance: (address: string) => Promise<number>;
        sign: (message: string) => Promise<string>;
        sendTransaction: (to: string, amount: number) => Promise<unknown>;
      };
      toSun: (amount: number) => number;
      fromSun: (amount: number) => number;
    };
    tronLink?: {
      ready: boolean;
      request: (args: { method: string }) => Promise<unknown>;
    };
  }
}

export type TronLinkState =
  | 'not_installed'
  | 'locked'
  | 'ready'
  | 'connected';

class TronLinkService {
  private static readonly DETECTION_TIMEOUT = 3000; // 3 seconds to detect extension
  private static readonly TRONWEB_READY_TIMEOUT = 10000; // 10 seconds for TronWeb ready

  // ─────────────────────────────────────────────────────────
  // Detection with async wait for extension injection
  // ─────────────────────────────────────────────────────────

  get isInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.tronLink;
  }

  get isReady(): boolean {
    return this.isInstalled && !!window.tronWeb?.ready;
  }

  get state(): TronLinkState {
    if (!this.isInstalled) return 'not_installed';
    if (!window.tronWeb?.ready) return 'locked';
    if (!window.tronWeb.defaultAddress?.base58) return 'ready';
    return 'connected';
  }

  /**
   * Wait for TronLink extension to inject into window
   * Extensions inject asynchronously after page load
   */
  private async waitForExtension(): Promise<boolean> {
    // Already available
    if (this.isInstalled) return true;

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(() => {
        if (window.tronLink) {
          clearInterval(checkInterval);
          console.log('[TronLink] Extension detected');
          resolve(true);
        } else if (Date.now() - startTime > TronLinkService.DETECTION_TIMEOUT) {
          clearInterval(checkInterval);
          console.log('[TronLink] Extension not found after timeout');
          resolve(false);
        }
      }, 100);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Connection
  // ─────────────────────────────────────────────────────────

  async connect(): Promise<string | null> {
    // Wait for extension to be injected
    const isAvailable = await this.waitForExtension();
    
    if (!isAvailable) {
      // Extension truly not installed - offer to install
      const shouldInstall = window.confirm(
        'TronLink кошелек не обнаружен.\n\n' +
        'Установить TronLink для подключения к TRON?'
      );
      
      if (shouldInstall) {
        window.open('https://www.tronlink.org/', '_blank');
      }
      
      throw new Error('TronLink not installed');
    }

    try {
      console.log('[TronLink] Requesting account access...');
      
      // Request account access - this will trigger TronLink popup
      await window.tronLink!.request({ method: 'tron_requestAccounts' });

      // Wait for TronWeb to be ready
      await this.waitForTronWeb();

      const address = window.tronWeb?.defaultAddress?.base58;

      if (!address) {
        throw new Error('No account found. Please unlock TronLink.');
      }

      console.log('[TronLink] Connected:', address);
      return address;

    } catch (error) {
      console.error('[TronLink] Connection failed:', error);
      
      // User rejected or other error
      if ((error as Error).message?.includes('User rejected')) {
        throw new Error('Подключение отклонено пользователем');
      }
      
      throw error;
    }
  }

  private waitForTronWeb(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already ready
      if (window.tronWeb?.ready) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.tronWeb?.ready) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() - startTime > TronLinkService.TRONWEB_READY_TIMEOUT) {
          clearInterval(interval);
          reject(new Error('TronWeb не готов. Пожалуйста, разблокируйте TronLink.'));
        }
      }, 100);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Account Info
  // ─────────────────────────────────────────────────────────

  get address(): string | null {
    return window.tronWeb?.defaultAddress?.base58 || null;
  }

  async getBalance(): Promise<string | null> {
    if (!this.address || !window.tronWeb) return null;

    try {
      const balance = await window.tronWeb.trx.getBalance(this.address);
      // Convert from SUN to TRX (1 TRX = 1,000,000 SUN)
      return (balance / 1_000_000).toFixed(6);
    } catch (error) {
      console.error('[TronLink] getBalance failed:', error);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Signing
  // ─────────────────────────────────────────────────────────

  async signMessage(message: string): Promise<string | null> {
    if (!window.tronWeb?.ready) {
      throw new Error('TronWeb not ready');
    }

    try {
      const signature = await window.tronWeb.trx.sign(message);
      return signature;
    } catch (error) {
      console.error('[TronLink] signMessage failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Disconnect (TronLink doesn't have disconnect, just clear state)
  // ─────────────────────────────────────────────────────────

  disconnect(): void {
    // TronLink doesn't support programmatic disconnect
    // User must disconnect from extension
    console.log('[TronLink] Disconnect requested (user must disconnect from extension)');
  }

  // ─────────────────────────────────────────────────────────
  // Utility: Check if extension is available (non-blocking)
  // ─────────────────────────────────────────────────────────
  
  async checkAvailability(): Promise<TronLinkState> {
    await this.waitForExtension();
    return this.state;
  }
}

export const tronLinkService = new TronLinkService();
