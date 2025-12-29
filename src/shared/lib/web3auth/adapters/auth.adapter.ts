import { REDIRECT_CONFIG } from '../config';
import type { LoginProvider } from '../types';

// ============================================================================
// Login Parameters Factory (V10 API)
// ============================================================================

// V10 uses 'authConnection' instead of 'loginProvider'
export interface V10LoginParams {
  authConnection: string;
  login_hint?: string;
  extraLoginOptions?: Record<string, unknown>;
}

/**
 * Create login parameters for the AUTH connector (V10 API)
 * V10 uses 'authConnection' instead of 'loginProvider'
 */
export function getLoginParams(
  provider: LoginProvider,
  options?: { email?: string; phone?: string }
): V10LoginParams {
  const params: V10LoginParams = {
    authConnection: provider,
  };

  // Email passwordless
  if (provider === 'email_passwordless' && options?.email) {
    params.login_hint = options.email;
    params.extraLoginOptions = {
      login_hint: options.email,
    };
  }

  // SMS passwordless
  if (provider === 'sms_passwordless' && options?.phone) {
    params.login_hint = options.phone;
    params.extraLoginOptions = {
      login_hint: options.phone,
    };
  }

  return params;
}

// Re-export redirect config for use in connector settings
export { REDIRECT_CONFIG };
