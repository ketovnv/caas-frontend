import { WEB3AUTH_NETWORK } from '@web3auth/no-modal';

// ============================================================================
// Environment
// ============================================================================

const CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'YOUR_CLIENT_ID';
// TODO: Switch to SAPPHIRE_MAINNET for production when project is migrated
const NETWORK = WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;

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

// Always use popup mode - works in both web and Capacitor WebView
function getUxMode(): 'popup' | 'redirect' {
  return 'popup';
}

export const WEB3AUTH_CONFIG = {
  clientId: CLIENT_ID,
  web3AuthNetwork: NETWORK,

  // UX mode: popup for web, redirect for mobile Capacitor
  uxMode: getUxMode(),

  // Session management
  sessionTime: 86400 * 7, // 7 days
  storageType: 'local' as const,

  // Logging (disable in prod)
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
      // For Capacitor, use https://localhost which is the internal origin
      return 'https://localhost/auth/callback';
    }
    return `${window.location.origin}/auth/callback`;
  },

  /** UX mode: popup for web, redirect for mobile */
  get uxMode(): 'popup' | 'redirect' {
    return isNativePlatform() ? 'redirect' : 'popup';
  },
};
