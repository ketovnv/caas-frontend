import type { IProvider, UserInfo } from '@web3auth/base';

// ============================================================================
// Login Providers
// ============================================================================

export type SocialProvider =
  | 'google'
  | 'apple'
  | 'twitter'
  | 'discord'
  | 'github'
  | 'facebook';

export type PasswordlessProvider =
  | 'email_passwordless'
  | 'sms_passwordless';

/** Direct browser extension wallets */
export type ExtensionWallet =
  | 'metamask'
  | 'tronlink';

/** Reown/WalletConnect supported wallets */
export type ReownWallet =
  | 'walletconnect'  // QR код
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

export type ExternalWallet = ExtensionWallet | ReownWallet;

export type LoginProvider = SocialProvider | PasswordlessProvider;

export type WalletProvider = LoginProvider | ExternalWallet;

// ============================================================================
// Auth Status
// ============================================================================

export type AuthStatus =
  | 'initializing'  // SDK loading
  | 'ready'         // Ready to connect
  | 'connecting'    // Login in progress
  | 'connected'     // Successfully connected
  | 'disconnecting' // Logout in progress
  | 'error';        // Error occurred

// ============================================================================
// Auth State
// ============================================================================

export interface AuthState {
  status: AuthStatus;
  provider: IProvider | null;
  userInfo: Partial<UserInfo> | null;
  error: Error | null;
  selectedProvider: LoginProvider | null;
}

// ============================================================================
// Provider Config (for UI)
// ============================================================================

export interface ProviderConfig {
  id: LoginProvider;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  available: boolean;
  requiresInput?: boolean;
}

// ============================================================================
// Login Parameters (V10 API)
// ============================================================================

// V10 uses authConnection instead of loginProvider
export interface AuthLoginParams {
  authConnection: string;
  authConnectionId?: string; // Optional: From Web3Auth Dashboard
  groupedAuthConnectionId?: string; // Optional: For account linking
  login_hint?: string;
  extraLoginOptions?: Record<string, unknown>;
}

// ============================================================================
// Re-exports
// ============================================================================

export type { IProvider, UserInfo };
