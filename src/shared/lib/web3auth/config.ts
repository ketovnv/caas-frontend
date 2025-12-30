// ============================================================================
// Environment
// ============================================================================

const CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'YOUR_CLIENT_ID';

// WEB3AUTH_NETWORK values (avoiding import issues with Vite)
// TODO: Switch to 'sapphire_mainnet' for production
const NETWORK = 'sapphire_devnet' as const;

// ============================================================================
// Web3Auth Connection IDs (from Dashboard)
// ============================================================================

export const AUTH_CONNECTION_IDS = {
  google: import.meta.env.VITE_W3A_GOOGLE_CONNECTION_ID || '',
  facebook: import.meta.env.VITE_W3A_FACEBOOK_CONNECTION_ID || '',
  twitter: import.meta.env.VITE_W3A_TWITTER_CONNECTION_ID || '',
  discord: import.meta.env.VITE_W3A_DISCORD_CONNECTION_ID || '',
  github: import.meta.env.VITE_W3A_GITHUB_CONNECTION_ID || '',
  apple: import.meta.env.VITE_W3A_APPLE_CONNECTION_ID || '',
  email_passwordless: import.meta.env.VITE_W3A_EMAIL_CONNECTION_ID || '',
  sms_passwordless: import.meta.env.VITE_W3A_SMS_CONNECTION_ID || '',
} as const;

// ============================================================================
// Chain Config (Sepolia Testnet)
// ============================================================================

export const CHAIN_CONFIG = {
  chainNamespace: 'eip155' as const,
  chainId: '0xaa36a7', // Sepolia
  rpcTarget: 'https://rpc.sepolia.org',
  displayName: 'Ethereum Sepolia',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://images.toruswallet.io/eth.svg',
};

// ============================================================================
// Web3Auth Config (v10)
// ============================================================================

export const WEB3AUTH_CONFIG = {
  clientId: CLIENT_ID,
  web3AuthNetwork: NETWORK,
  chainConfig: CHAIN_CONFIG,

  // Session: 7 days, persist in localStorage
  sessionTime: 86400 * 7,
  storageType: 'local' as const,

  // Logging
  enableLogging: !import.meta.env.PROD,
};

// ============================================================================
// Platform Detection
// ============================================================================

function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  const capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return capacitor?.isNativePlatform?.() ?? false;
}

// ============================================================================
// Redirect Config (for Capacitor)
// ============================================================================

export const REDIRECT_CONFIG = {
  scheme: 'caas',
  universalLink: 'https://app.caas.io',

  get redirectUrl(): string {
    if (isNativePlatform()) {
      return 'https://localhost/auth/callback';
    }
    return `${window.location.origin}/auth/callback`;
  },

  get uxMode(): 'popup' | 'redirect' {
    return isNativePlatform() ? 'redirect' : 'popup';
  },
};
