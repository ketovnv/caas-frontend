// MetaMask Service - Improved Detection
// ============================================================================

// Use any type for window.ethereum to avoid conflicts with other packages
// that also declare ethereum on Window (e.g., @reown/appkit)
type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  selectedAddress: string | null;
  chainId: string | null;
};

// Helper to get ethereum provider
const getEthereum = (): EthereumProvider | undefined => {
  return (window as any).ethereum;
};

export type MetaMaskState =
  | 'not_installed'
  | 'locked'
  | 'connected';

class MetaMaskService {
  private static readonly DETECTION_TIMEOUT = 3000; // 3 seconds to detect extension

  // ─────────────────────────────────────────────────────────
  // Detection with async wait for extension injection
  // ─────────────────────────────────────────────────────────

  get isInstalled(): boolean {
    return typeof window !== 'undefined' && !!getEthereum()?.isMetaMask;
  }

  get state(): MetaMaskState {
    if (!this.isInstalled) return 'not_installed';
    if (!getEthereum()?.selectedAddress) return 'locked';
    return 'connected';
  }

  /**
   * Wait for MetaMask extension to inject into window
   * Extensions inject asynchronously after page load
   */
  private async waitForExtension(): Promise<boolean> {
    // Already available
    if (this.isInstalled) return true;

    // Check for any ethereum provider (could be MetaMask or other)
    if (getEthereum()) return true;

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(() => {
        if (getEthereum()) {
          clearInterval(checkInterval);
          console.log('[MetaMask] Extension detected');
          resolve(true);
        } else if (Date.now() - startTime > MetaMaskService.DETECTION_TIMEOUT) {
          clearInterval(checkInterval);
          console.log('[MetaMask] Extension not found after timeout');
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
        'MetaMask кошелек не обнаружен.\n\n' +
        'Установить MetaMask для подключения к Ethereum?'
      );
      
      if (shouldInstall) {
        window.open('https://metamask.io/download/', '_blank');
      }
      
      throw new Error('MetaMask not installed');
    }

    try {
      console.log('[MetaMask] Requesting account access...');
      
      // Request account access - this will trigger MetaMask popup
      const ethereum = getEthereum()!;
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const address = accounts[0];
      console.log('[MetaMask] Connected:', address);
      
      return address!;

    } catch (error) {
      console.error('[MetaMask] Connection failed:', error);
      
      // User rejected
      if ((error as { code?: number }).code === 4001) {
        throw new Error('Подключение отклонено пользователем');
      }
      
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Account Info
  // ─────────────────────────────────────────────────────────

  get address(): string | null {
    return getEthereum()?.selectedAddress || null;
  }

  get chainId(): string | null {
    return getEthereum()?.chainId || null;
  }

  async getBalance(address?: string): Promise<string | null> {
    const targetAddress = address || this.address;
    const ethereum = getEthereum();
    if (!targetAddress || !ethereum) return null;

    try {
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [targetAddress, 'latest']
      }) as string;
      
      // Convert from wei to ETH
      const ethBalance = parseInt(balance, 16) / 1e18;
      return ethBalance.toFixed(6);
    } catch (error) {
      console.error('[MetaMask] getBalance failed:', error);
      return null;
    }
  }

  async getAccounts(): Promise<string[]> {
    const ethereum = getEthereum();
    if (!ethereum) return [];

    try {
      const accounts = await ethereum.request({
        method: 'eth_accounts'
      }) as string[];
      return accounts || [];
    } catch {
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────
  // Signing
  // ─────────────────────────────────────────────────────────

  async signMessage(message: string): Promise<string> {
    const ethereum = getEthereum();
    if (!ethereum || !this.address) {
      throw new Error('MetaMask not connected');
    }

    try {
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, this.address]
      }) as string;

      return signature;
    } catch (error) {
      console.error('[MetaMask] signMessage failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Chain Management
  // ─────────────────────────────────────────────────────────

  async switchChain(chainId: string): Promise<void> {
    const ethereum = getEthereum();
    if (!ethereum) {
      throw new Error('MetaMask not available');
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
    } catch (error) {
      // Chain not added to MetaMask
      if ((error as { code?: number }).code === 4902) {
        throw new Error('Chain not added to MetaMask');
      }
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Event Listeners
  // ─────────────────────────────────────────────────────────

  onAccountsChanged(handler: (accounts: string[]) => void): () => void {
    const ethereum = getEthereum();
    if (!ethereum) return () => {};

    const wrappedHandler = (accounts: unknown) => handler(accounts as string[]);
    ethereum.on('accountsChanged', wrappedHandler);

    return () => {
      getEthereum()?.removeListener('accountsChanged', wrappedHandler);
    };
  }

  onChainChanged(handler: (chainId: string) => void): () => void {
    const ethereum = getEthereum();
    if (!ethereum) return () => {};

    const wrappedHandler = (chainId: unknown) => handler(chainId as string);
    ethereum.on('chainChanged', wrappedHandler);

    return () => {
      getEthereum()?.removeListener('chainChanged', wrappedHandler);
    };
  }

  onDisconnect(handler: () => void): () => void {
    const ethereum = getEthereum();
    if (!ethereum) return () => {};

    ethereum.on('disconnect', handler);

    return () => {
      getEthereum()?.removeListener('disconnect', handler);
    };
  }

  // ─────────────────────────────────────────────────────────
  // Disconnect (MetaMask doesn't support programmatic disconnect)
  // ─────────────────────────────────────────────────────────

  disconnect(): void {
    // MetaMask doesn't support programmatic disconnect
    // User must disconnect from extension
    console.log('[MetaMask] Disconnect requested (user must disconnect from extension)');
  }

  // ─────────────────────────────────────────────────────────
  // Utility: Check if extension is available (non-blocking)
  // ─────────────────────────────────────────────────────────
  
  async checkAvailability(): Promise<MetaMaskState> {
    await this.waitForExtension();
    return this.state;
  }
}

export const metaMaskService = new MetaMaskService();
