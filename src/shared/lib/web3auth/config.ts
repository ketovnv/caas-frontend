import { WEB3AUTH_NETWORK } from '@web3auth/no-modal';

// ============================================================================
// Environment
// ============================================================================

const CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'YOUR_CLIENT_ID';
const NETWORK = import.meta.env.PROD
  ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
  : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;

// ============================================================================
// Web3Auth Connection IDs (from Dashboard)
// ============================================================================

// TODO: Get these from https://dashboard.web3auth.io
// 1. Go to your project
// 2. Click "Custom Authentication" or "Auth Connections"
// 3. Create connections for each provider
// 4. Copy the Connection ID for each

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
// Web3Auth Config
// ============================================================================

export const WEB3AUTH_CONFIG = {
  clientId: CLIENT_ID,
  web3AuthNetwork: NETWORK,

  // Session management
  sessionTime: 86400 * 7, // 7 days
  storageType: 'local' as const,

  // Logging (disable in prod)
  enableLogging: !import.meta.env.PROD,
};

// ============================================================================
// Redirect Config (for Capacitor)
// ============================================================================

export const REDIRECT_CONFIG = {
  scheme: 'caas',
  universalLink: 'https://app.caas.io',

  get redirectUrl(): string {
    const capacitor = typeof window !== 'undefined'
      ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
      : null;

    const isNative = capacitor?.isNativePlatform?.() ?? false;

    if (isNative) {
      return `${this.scheme}://auth/callback`;
    }

    return `${window.location.origin}/auth/callback`;
  },
};
